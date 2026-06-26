<?php

namespace App\Http\Controllers;

use App\Models\Document;
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
        $document->load(['creator','approver']);
        return Inertia::render('Documents/Show', ['document' => $document]);
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
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);
        return back()->with('message', 'Documento aprovado.');
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
