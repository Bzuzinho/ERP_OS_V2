<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ServiceArea;
use App\Models\Task;
use App\Models\Team;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['contact','assignee','serviceArea','creator'])
            ->orderByDesc('created_at');

        if ($request->filled('status'))       $query->where('status', $request->status);
        if ($request->filled('priority'))     $query->where('priority', $request->priority);
        if ($request->filled('service_area')) $query->where('service_area_id', $request->service_area);
        if ($request->filled('search')) {
            $query->where(fn($q) =>
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('reference', 'like', "%{$request->search}%")
            );
        }

        return Inertia::render('Tickets/Index', [
            'tickets'      => $query->paginate(15)->withQueryString(),
            'filters'      => $request->only(['status','priority','service_area','search']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'stats'        => [
                'total'        => Ticket::count(),
                'aberto'       => Ticket::where('status','aberto')->count(),
                'em_progresso' => Ticket::whereIn('status',['em_progresso','com_tarefas'])->count(),
                'resolvido'    => Ticket::where('status','resolvido')->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Tickets/Create', [
            'contacts'     => Contact::orderBy('name')->get(['id','name','email','type']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'teams'        => Team::where('is_active', true)->orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'tema'            => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'priority'        => 'required|in:baixa,normal,alta,urgente',
            'origin'          => 'required|in:portal,presencial,telefone,email,interno',
            'ticket_type'     => 'in:interno,externo',
            'contact_id'      => 'nullable|exists:contacts,id',
            'assigned_to'     => 'nullable|exists:users,id',
            'service_area_id' => 'nullable|exists:service_areas,id',
            'team_id'         => 'nullable|exists:teams,id',
        ]);

        $data['status']          = 'aberto';
        $data['public_status']   = 'recebido';
        $data['created_by']      = auth()->id();
        $data['organization_id'] = 1;
        $data['ticket_type']     = $data['ticket_type'] ?? 'externo';

        $ticket = Ticket::create($data);

        // Log creation
        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'criado',
            'to_status'  => $ticket->status,
            'note'       => 'Pedido criado.',
        ]);
        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'estado',
            'to_status'  => $ticket->status,
            'note'       => 'Estado inicial do pedido.',
        ]);

        return redirect()->route('tickets.show', $ticket)->with('message', 'Pedido criado com sucesso.');
    }

    public function show(Ticket $ticket)
    {
        $ticket->load([
            'contact','assignee','serviceArea','team','creator',
            'comments.user','comments.contact',
            'tasks.assignee',
            'attachments.user',
            'statusHistory.user','statusHistory.contact',
        ]);

        $tasks       = $ticket->tasks;
        $totalTasks  = $tasks->count();
        $doneTasks   = $tasks->where('status','completed')->count();
        $progress    = $totalTasks > 0 ? round($doneTasks / $totalTasks * 100) : 0;

        return Inertia::render('Tickets/Show', [
            'ticket'       => array_merge($ticket->toArray(), [
                'progress'      => $progress,
                'tasks_total'   => $totalTasks,
                'tasks_done'    => $doneTasks,
            ]),
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'teams'        => Team::where('is_active', true)->orderBy('name')->get(['id','name']),
            'contacts'     => \App\Models\Contact::orderBy('name')->get(['id','name','email','phone']),
        ]);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'tema'            => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'sometimes|string',
            'priority'        => 'sometimes|in:baixa,normal,alta,urgente',
            'assigned_to'     => 'nullable|exists:users,id',
            'service_area_id' => 'nullable|exists:service_areas,id',
            'team_id'         => 'nullable|exists:teams,id',
            'note'            => 'nullable|string',
        ]);

        $note = $data['note'] ?? null;
        unset($data['note']);

        $oldStatus = $ticket->status;
        $ticket->update($data);

        if (isset($data['status']) && $oldStatus !== $data['status']) {
            $ticket->statusHistory()->create([
                'user_id'     => auth()->id(),
                'event_type'  => 'estado',
                'from_status' => $oldStatus,
                'to_status'   => $data['status'],
                'note'        => $note ?? 'Atualizacao de estado durante o tratamento.',
            ]);
            // Technical event
            $ticket->statusHistory()->create([
                'user_id'     => auth()->id(),
                'event_type'  => 'tecnico',
                'to_status'   => $data['status'],
                'note'        => 'Estado do pedido alterado.',
            ]);
        }

        return back()->with('message', 'Pedido atualizado.');
    }

    // POST /pedidos/{ticket}/encaminhar
    public function route(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'service_area_id' => 'nullable|exists:service_areas,id',
            'assigned_to'     => 'nullable|exists:users,id',
        ]);

        $ticket->update($data);

        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'encaminhamento',
            'to_status'  => $ticket->status,
            'note'       => 'Pedido encaminhado.',
        ]);

        return back()->with('message', 'Encaminhamento guardado.');
    }

    // PATCH /pedidos/{ticket}/atribuir
    public function assign(Request $request, Ticket $ticket)
    {
        $data = $request->validate(['assigned_to' => 'nullable|exists:users,id']);
        $ticket->update($data);

        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'tecnico',
            'to_status'  => $ticket->status,
            'note'       => 'Responsável atribuído.',
        ]);

        return back()->with('message', 'Responsável atribuído.');
    }

    // POST /pedidos/{ticket}/cancelar
    public function cancel(Request $request, Ticket $ticket)
    {
        $data = $request->validate(['cancellation_reason' => 'nullable|string']);

        $old = $ticket->status;
        $ticket->update([
            'status'              => 'cancelado',
            'cancellation_reason' => $data['cancellation_reason'] ?? null,
            'closed_at'           => now(),
        ]);

        $ticket->statusHistory()->create([
            'user_id'     => auth()->id(),
            'event_type'  => 'estado',
            'from_status' => $old,
            'to_status'   => 'cancelado',
            'note'        => $data['cancellation_reason'] ?? 'Pedido cancelado.',
        ]);

        return back()->with('message', 'Pedido cancelado.');
    }

    // POST /pedidos/{ticket}/gerar-tarefa
    public function createTask(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $task = Task::create([
            'organization_id' => $ticket->organization_id,
            'title'           => $data['title'],
            'description'     => $data['description'] ?? $ticket->description,
            'status'          => 'pending',
            'priority'        => 'medium',
            'ticket_id'       => $ticket->id,
            'assigned_to'     => $ticket->assigned_to,
            'service_area_id' => $ticket->service_area_id,
            'origin'          => 'ticket',
            'created_by'      => auth()->id(),
        ]);

        // Update ticket status to com_tarefas
        $old = $ticket->status;
        if (!in_array($ticket->status, ['resolvido','encerrado','cancelado'])) {
            $ticket->update(['status' => 'com_tarefas']);
        }

        $ticket->statusHistory()->create([
            'user_id'     => auth()->id(),
            'event_type'  => 'estado',
            'from_status' => $old,
            'to_status'   => 'com_tarefas',
            'note'        => 'Tarefas geradas a partir do pedido.',
        ]);
        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'tecnico',
            'to_status'  => 'com_tarefas',
            'note'       => 'Estado do pedido alterado.',
        ]);
        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'tarefa_criada',
            'to_status'  => $ticket->status,
            'note'       => "Tarefa \"{$task->title}\" gerada.",
        ]);

        return back()->with('message', 'Tarefa gerada com sucesso.');
    }

    public function addComment(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'body' => 'required|string',
            'type' => 'required|in:public,internal',
        ]);

        $ticket->comments()->create([
            'body'    => $data['body'],
            'type'    => $data['type'],
            'user_id' => auth()->id(),
        ]);

        return back()->with('message', 'Comentário adicionado.');
    }

    // PATCH /pedidos/{ticket}/contacto
    public function updateContact(Request $request, Ticket $ticket)
    {
        $data = $request->validate(['contact_id' => 'nullable|exists:contacts,id']);
        $ticket->update($data);

        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'tecnico',
            'to_status'  => $ticket->status,
            'note'       => $data['contact_id'] ? 'Contacto associado atualizado.' : 'Contacto associado removido.',
        ]);

        return back()->with('message', 'Contacto atualizado.');
    }

    // POST /pedidos/{ticket}/anexos
    public function storeAttachment(Request $request, Ticket $ticket)
    {
        $request->validate(['file' => 'required|file|max:20480']);

        $file = $request->file('file');
        $path = $file->store("tickets/{$ticket->id}", 'public');

        $ticket->attachments()->create([
            'organization_id' => $ticket->organization_id,
            'user_id'         => auth()->id(),
            'filename'        => $path,
            'original_name'   => $file->getClientOriginalName(),
            'mime_type'       => $file->getMimeType(),
            'size'            => $file->getSize(),
            'disk'            => 'public',
            'visibility'      => 'internal',
        ]);

        $ticket->statusHistory()->create([
            'user_id'    => auth()->id(),
            'event_type' => 'anexo',
            'to_status'  => $ticket->status,
            'note'       => "Ficheiro \"{$file->getClientOriginalName()}\" anexado.",
        ]);

        return back()->with('message', 'Ficheiro anexado.');
    }

    // DELETE /pedidos/{ticket}/anexos/{attachment}
    public function destroyAttachment(Ticket $ticket, \App\Models\Attachment $attachment)
    {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->filename);
        $attachment->delete();
        return back()->with('message', 'Anexo removido.');
    }
}
