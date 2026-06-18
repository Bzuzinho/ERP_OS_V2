<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ServiceArea;
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
                'total'    => Ticket::count(),
                'aberto'   => Ticket::where('status','aberto')->count(),
                'em_progresso' => Ticket::where('status','em_progresso')->count(),
                'resolvido' => Ticket::where('status','resolvido')->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Tickets/Create', [
            'contacts'     => Contact::orderBy('name')->get(['id','name','email','type']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'priority'        => 'required|in:baixa,normal,alta,urgente',
            'origin'          => 'required|in:portal,presencial,telefone,email,interno',
            'contact_id'      => 'nullable|exists:contacts,id',
            'assigned_to'     => 'nullable|exists:users,id',
            'service_area_id' => 'nullable|exists:service_areas,id',
        ]);

        $data['status']       = 'aberto';
        $data['public_status'] = 'recebido';
        $data['created_by']   = auth()->id();
        $data['organization_id'] = 1; // TODO: from auth user

        $ticket = Ticket::create($data);

        return redirect()->route('tickets.show', $ticket)->with('message', 'Pedido criado com sucesso.');
    }

    public function show(Ticket $ticket)
    {
        $ticket->load(['contact','assignee','serviceArea','creator','comments.user','attachments','tasks.assignee','statusHistory.user']);

        return Inertia::render('Tickets/Show', [
            'ticket'       => $ticket,
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
        ]);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'sometimes|in:aberto,em_analise,em_progresso,aguarda_resposta,resolvido,encerrado',
            'priority'        => 'sometimes|in:baixa,normal,alta,urgente',
            'assigned_to'     => 'nullable|exists:users,id',
            'service_area_id' => 'nullable|exists:service_areas,id',
        ]);

        $old = $ticket->status;
        $ticket->update($data);

        if (isset($data['status']) && $old !== $data['status']) {
            $ticket->statusHistory()->create([
                'user_id'     => auth()->id(),
                'from_status' => $old,
                'to_status'   => $data['status'],
            ]);
        }

        return back()->with('message', 'Pedido atualizado.');
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
}
