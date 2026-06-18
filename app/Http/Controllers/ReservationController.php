<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Event;
use App\Models\Space;
use App\Models\SpaceReservation;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = SpaceReservation::with(['space','contact','user'])
            ->orderByDesc('starts_at');

        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('space'))  $query->where('space_id', $request->space);

        return Inertia::render('Reservations/Index', [
            'reservations' => $query->paginate(15)->withQueryString(),
            'spaces'       => Space::where('is_active', true)->get(['id','name']),
            'filters'      => $request->only(['status','space']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Reservations/Create', [
            'spaces'   => Space::where('is_active', true)->where('is_public', true)->get(),
            'contacts' => Contact::orderBy('name')->get(['id','name','email','type']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'space_id'           => 'required|exists:spaces,id',
            'contact_id'         => 'nullable|exists:contacts,id',
            'title'              => 'required|string|max:255',
            'purpose'            => 'nullable|string',
            'starts_at'          => 'required|date',
            'ends_at'            => 'required|date|after:starts_at',
            'expected_attendees' => 'nullable|integer',
        ]);

        // check overlap
        $overlap = SpaceReservation::where('space_id', $data['space_id'])
            ->where('status', '!=', 'cancelada')
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            ->exists();

        if ($overlap) {
            return back()->withErrors(['starts_at' => 'O espaço já está reservado neste período.']);
        }

        $data['organization_id'] = 1;
        $data['user_id']         = auth()->id();
        $reservation = SpaceReservation::create($data);

        return redirect()->route('reservations.index')->with('message', 'Reserva criada e aguarda aprovação.');
    }

    public function approve(SpaceReservation $reservation)
    {
        $reservation->update([
            'status'      => 'aprovada',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Create event
        Event::create([
            'organization_id'     => $reservation->organization_id,
            'space_id'            => $reservation->space_id,
            'space_reservation_id'=> $reservation->id,
            'title'               => $reservation->title,
            'starts_at'           => $reservation->starts_at,
            'ends_at'             => $reservation->ends_at,
            'type'                => 'reserva',
            'visibility'          => 'público',
            'created_by'          => auth()->id(),
        ]);

        // Create preparation tasks
        Task::create([
            'organization_id'    => $reservation->organization_id,
            'title'              => 'Preparar espaço — ' . $reservation->title,
            'status'             => 'pending',
            'priority'           => 'medium',
            'space_reservation_id' => $reservation->id,
            'due_date'           => $reservation->starts_at,
            'origin'             => 'reservation',
            'created_by'         => auth()->id(),
        ]);

        return back()->with('message', 'Reserva aprovada.');
    }

    public function reject(Request $request, SpaceReservation $reservation)
    {
        $data = $request->validate(['rejection_reason' => 'nullable|string']);
        $reservation->update([
            'status'           => 'rejeitada',
            'rejection_reason' => $data['rejection_reason'] ?? null,
            'reviewed_by'      => auth()->id(),
            'reviewed_at'      => now(),
        ]);
        return back()->with('message', 'Reserva rejeitada.');
    }
}
