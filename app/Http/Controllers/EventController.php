<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::with(['space','creator'])
            ->when($request->filled('month'), fn($q) => $q->whereMonth('starts_at', $request->month))
            ->when($request->filled('year'),  fn($q) => $q->whereYear('starts_at', $request->year))
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('Events/Index', [
            'events' => $events,
            'spaces' => Space::where('is_active', true)->get(['id','name']),
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
        Event::create($data);
        return back()->with('message', 'Evento criado.');
    }

    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'required|date',
            'ends_at'     => 'required|date',
            'all_day'     => 'boolean',
            'type'        => 'required|string',
            'visibility'  => 'required|string',
            'color'       => 'nullable|string|max:7',
        ]);
        $event->update($data);
        return back()->with('message', 'Evento atualizado.');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return back()->with('message', 'Evento removido.');
    }
}
