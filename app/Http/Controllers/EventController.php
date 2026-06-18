<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $now   = now();
        $month = $request->get('month', $now->month);
        $year  = $request->get('year',  $now->year);

        $events = Event::with(['space','creator','participants.user','participants.contact','tasks'])
            ->where('organization_id', 1)
            ->whereMonth('starts_at', $month)
            ->whereYear('starts_at',  $year)
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('Events/Index', [
            'events'   => $events,
            'spaces'   => Space::where('is_active', true)->get(['id','name']),
            'users'    => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'contacts' => Contact::orderBy('name')->get(['id','name']),
            'month'    => (int) $month,
            'year'     => (int) $year,
        ]);
    }

    public function show(Event $event)
    {
        $event->load(['space','creator','participants.user','participants.contact','tasks.assignee','reservation']);

        return Inertia::render('Events/Show', [
            'event'    => $event,
            'users'    => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'contacts' => Contact::orderBy('name')->get(['id','name']),
            'spaces'   => Space::where('is_active', true)->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'required|date',
            'ends_at'     => 'required|date|after:starts_at',
            'all_day'     => 'boolean',
            'type'        => 'required|in:interno,público,reunião,reserva,planeamento',
            'visibility'  => 'required|in:interno,público',
            'space_id'    => 'nullable|exists:spaces,id',
            'location'    => 'nullable|string',
            'color'       => 'nullable|string|max:7',
        ]);

        $data['organization_id'] = 1;
        $data['created_by']      = auth()->id();
        $event = Event::create($data);

        // Auto-add creator as organizer
        EventParticipant::create([
            'event_id' => $event->id,
            'user_id'  => auth()->id(),
            'role'     => 'organizador',
            'status'   => 'confirmado',
        ]);

        return back()->with('message', 'Evento criado.');
    }

    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'sometimes|date',
            'ends_at'     => 'sometimes|date',
            'all_day'     => 'boolean',
            'type'        => 'sometimes|in:interno,público,reunião,reserva,planeamento',
            'visibility'  => 'sometimes|in:interno,público',
            'color'       => 'nullable|string|max:7',
            'location'    => 'nullable|string',
            'space_id'    => 'nullable|exists:spaces,id',
        ]);

        $event->update($data);
        return back()->with('message', 'Evento atualizado.');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return back()->with('message', 'Evento removido.');
    }

    // ─── Participantes ────────────────────────────────────────────────────────

    public function storeParticipant(Request $request, Event $event)
    {
        $data = $request->validate([
            'user_id'    => 'nullable|exists:users,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'role'       => 'in:organizador,participante,convidado',
            'status'     => 'in:confirmado,pendente,recusado',
        ]);

        // At least one of user or contact must be provided
        if (empty($data['user_id']) && empty($data['contact_id'])) {
            return back()->withErrors(['participant' => 'Selecione um utilizador ou contacto.']);
        }

        // Avoid duplicates
        $exists = $event->participants()
            ->when($data['user_id'] ?? null,    fn($q) => $q->where('user_id',    $data['user_id']))
            ->when($data['contact_id'] ?? null,  fn($q) => $q->where('contact_id', $data['contact_id']))
            ->exists();

        if ($exists) return back()->withErrors(['participant' => 'Participante já adicionado.']);

        EventParticipant::create(array_merge($data, [
            'event_id' => $event->id,
            'role'     => $data['role'] ?? 'participante',
            'status'   => $data['status'] ?? 'pendente',
        ]));

        return back()->with('message', 'Participante adicionado.');
    }

    public function destroyParticipant(Event $event, EventParticipant $participant)
    {
        abort_unless($participant->event_id === $event->id, 403);
        $participant->delete();
        return back()->with('message', 'Participante removido.');
    }

    public function updateParticipant(Request $request, Event $event, EventParticipant $participant)
    {
        abort_unless($participant->event_id === $event->id, 403);
        $data = $request->validate([
            'status' => 'required|in:confirmado,pendente,recusado',
        ]);
        $participant->update($data);
        return back()->with('message', 'Estado atualizado.');
    }
}
