<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\NotificationRecipient;
use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['creator','approver'])->orderByDesc('created_at');
        if ($request->filled('type'))       $query->where('type', $request->type);
        if ($request->filled('visibility')) $query->where('visibility', $request->visibility);
        if ($request->filled('search'))     $query->where('title', 'like', "%{$request->search}%");

        return Inertia::render('Documents/Index', [
            'documents' => $query->paginate(30)->withQueryString(),
            'filters'   => $request->only(['type','visibility','search']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'type'         => 'required|in:documento,ata,regulamento,formulário,outro',
            'visibility'   => 'required|in:público,interno,restrito',
            'meeting_date' => 'nullable|date',
            'file'         => 'nullable|file|max:51200', // 50 MB
        ]);

        $data['organization_id'] = 1;
        $data['created_by']      = auth()->id();

        if ($request->hasFile('file')) {
            $file                  = $request->file('file');
            $path                  = $file->store('documentos', 'public');
            $data['filename']      = $path;
            $data['original_name'] = $file->getClientOriginalName();
            $data['mime_type']     = $file->getMimeType();
            $data['file_size']     = $file->getSize();
        }

        unset($data['file']);
        $doc = Document::create($data);
        return redirect("/documentos/{$doc->id}")->with('message', 'Documento criado.');
    }

    public function show(Document $document)
    {
        $document->load(['creator','approver','approvalRequestedFrom']);
        $users = User::orderBy('name')->get(['id','name']);
        return Inertia::render('Documents/Show', [
            'document' => $document,
            'users'    => $users,
        ]);
    }

    public function update(Request $request, Document $document)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'type'         => 'required|in:documento,ata,regulamento,formulário,outro',
            'visibility'   => 'required|in:público,interno,restrito',
            'meeting_date' => 'nullable|date',
            'file'         => 'nullable|file|max:51200',
        ]);

        if ($request->hasFile('file')) {
            // delete old file
            if ($document->filename) {
                Storage::disk('public')->delete($document->filename);
            }
            $file                  = $request->file('file');
            $path                  = $file->store('documentos', 'public');
            $data['filename']      = $path;
            $data['original_name'] = $file->getClientOriginalName();
            $data['mime_type']     = $file->getMimeType();
            $data['file_size']     = $file->getSize();
        }

        unset($data['file']);
        $document->update($data);
        return redirect("/documentos/{$document->id}")->with('message', 'Documento atualizado.');
    }

    public function download(Document $document)
    {
        if (!$document->filename || !Storage::disk('public')->exists($document->filename)) {
            abort(404, 'Ficheiro não encontrado.');
        }
        return Storage::disk('public')->download($document->filename, $document->original_name ?? 'documento');
    }

    public function approve(Document $document)
    {
        $document->update([
            'is_approved'                => true,
            'approved_at'                => now(),
            'approved_by'                => auth()->id(),
            // clear pending request
            'approval_requested_from_id' => null,
            'approval_requested_at'      => null,
            'approval_notes'             => null,
        ]);

        // Notify creator that document was approved
        if ($document->created_by && $document->created_by !== auth()->id()) {
            $notif = SystemNotification::create([
                'organization_id' => 1,
                'type'            => 'documento_aprovado',
                'title'           => 'Documento aprovado',
                'message'         => "O documento \"{$document->title}\" foi aprovado.",
                'action_url'      => "/documentos/{$document->id}",
                'priority'        => 'normal',
            ]);
            NotificationRecipient::create([
                'system_notification_id' => $notif->id,
                'user_id'                => $document->created_by,
            ]);
        }

        return back()->with('message', 'Documento aprovado.');
    }

    public function unapprove(Document $document)
    {
        $document->update([
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);
        return back()->with('message', 'Aprovação retirada. Documento voltou a pendente.');
    }

    public function requestApproval(Request $request, Document $document)
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'notes'    => 'nullable|string|max:500',
        ]);

        $document->update([
            // store the first selected user as primary requester
            'approval_requested_from_id' => $request->user_ids[0],
            'approval_requested_at'      => now(),
            'approval_notes'             => $request->notes,
        ]);

        // Create notification for each selected user
        $notif = SystemNotification::create([
            'organization_id' => 1,
            'type'            => 'aprovacao_pendente',
            'title'           => 'Aprovação solicitada',
            'message'         => "O documento \"{$document->title}\" aguarda a sua aprovação." .
                                 ($request->notes ? " Nota: {$request->notes}" : ''),
            'action_url'      => "/documentos/{$document->id}",
            'priority'        => 'high',
        ]);

        foreach ($request->user_ids as $userId) {
            NotificationRecipient::create([
                'system_notification_id' => $notif->id,
                'user_id'                => $userId,
            ]);
        }

        return back()->with('message', 'Pedido de aprovação enviado.');
    }

    public function destroy(Document $document)
    {
        if ($document->filename) {
            Storage::disk('public')->delete($document->filename);
        }
        $document->delete();
        return redirect('/documentos')->with('message', 'Documento removido.');
    }

    // ── Atas ──────────────────────────────────────────────────────────────

    public function atasIndex(Request $request)
    {
        $query = Document::with(['creator','approver'])
            ->where('type', 'ata')
            ->orderByDesc('meeting_date');

        if ($request->filled('search')) $query->where('title', 'like', "%{$request->search}%");
        if ($request->filled('status')) {
            $request->status === 'aprovada'
                ? $query->where('is_approved', true)
                : $query->where('is_approved', false);
        }

        return Inertia::render('Atas/Index', [
            'atas'    => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search','status']),
        ]);
    }

    public function atasStore(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'meeting_date' => 'required|date',
            'visibility'   => 'required|in:público,interno,restrito',
            'content'      => 'nullable|string',
        ]);
        $data['type']            = 'ata';
        $data['organization_id'] = 1;
        $data['created_by']      = auth()->id();
        $ata = Document::create($data);
        return redirect("/atas/{$ata->id}")->with('message', 'Ata criada com sucesso.');
    }

    public function atasShow(Document $document)
    {
        $document->load(['creator','approver']);
        return Inertia::render('Atas/Show', ['ata' => $document]);
    }

    public function atasUpdate(Request $request, Document $document)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'meeting_date' => 'required|date',
            'visibility'   => 'required|in:público,interno,restrito',
            'content'      => 'nullable|string',
        ]);
        $document->update($data);
        return redirect("/atas/{$document->id}")->with('message', 'Ata atualizada.');
    }
}
