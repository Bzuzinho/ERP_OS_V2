<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
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
            'documents' => $query->paginate(20)->withQueryString(),
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
        ]);
        $data['organization_id'] = 1;
        $data['created_by']      = auth()->id();
        Document::create($data);
        return back()->with('message', 'Documento criado.');
    }

    public function approve(Document $document)
    {
        $document->update([
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);
        return back()->with('message', 'Documento aprovado.');
    }

    public function destroy(Document $document)
    {
        $document->delete();
        return back()->with('message', 'Documento removido.');
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
