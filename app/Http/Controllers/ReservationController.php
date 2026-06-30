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
            'spaces'   => Space::where('is_active', true)->orderBy('name')->get(['id','name','location','capacity']),
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
        $data['plan_id']         = $request->input('plan_id'); // nullable
        $reservation = SpaceReservation::create($data);

        return back()->with('message', 'Reserva criada e aguarda aprovação.');
    }

    public function show(SpaceReservation $reservation)
    {
        $reservation->load([
            'space.responsibleUser:id,name',
            'space.responsibleTeam:id,name',
            'contact','user','reviewer','escalatedTo',
            'plan:id,title',
            'event','tasks.assignee',
        ]);

        $users = \App\Models\User::where('is_active', true)->orderBy('name')->get(['id','name']);

        return Inertia::render('Reservations/Show', [
            'reservation' => [
                'id'                 => $reservation->id,
                'title'              => $reservation->title,
                'purpose'            => $reservation->purpose,
                'status'             => $reservation->status,
                'rejection_reason'   => $reservation->rejection_reason,
                'starts_at'          => $reservation->starts_at,
                'ends_at'            => $reservation->ends_at,
                'expected_attendees' => $reservation->expected_attendees,
                'space'              => $reservation->space ? [
                    'id'               => $reservation->space->id,
                    'name'             => $reservation->space->name,
                    'location'         => $reservation->space->location ?? null,
                    'responsible_user' => $reservation->space->responsibleUser
                        ? ['id'=>$reservation->space->responsibleUser->id,'name'=>$reservation->space->responsibleUser->name]
                        : null,
                    'responsible_team' => $reservation->space->responsibleTeam
                        ? ['id'=>$reservation->space->responsibleTeam->id,'name'=>$reservation->space->responsibleTeam->name]
                        : null,
                ] : null,
                'contact'            => $reservation->contact ? ['id'=>$reservation->contact->id,'name'=>$reservation->contact->name,'email'=>$reservation->contact->email ?? null] : null,
                'user'               => $reservation->user ? ['id'=>$reservation->user->id,'name'=>$reservation->user->name] : null,
                'reviewer'           => $reservation->reviewer ? ['id'=>$reservation->reviewer->id,'name'=>$reservation->reviewer->name] : null,
                'reviewed_at'        => $reservation->reviewed_at,
                'escalated_to'       => $reservation->escalatedTo ? ['id'=>$reservation->escalatedTo->id,'name'=>$reservation->escalatedTo->name] : null,
                'escalated_at'       => $reservation->escalated_at,
                'escalation_notes'   => $reservation->escalation_notes,
                'plan'               => $reservation->plan ? ['id'=>$reservation->plan->id,'title'=>$reservation->plan->title] : null,
                'event'              => $reservation->event ? ['id'=>$reservation->event->id,'title'=>$reservation->event->title] : null,
                'tasks'              => $reservation->tasks->map(fn($t) => [
                    'id'       => $t->id,
                    'title'    => $t->title,
                    'status'   => $t->status,
                    'assignee' => $t->assignee ? ['name'=>$t->assignee->name] : null,
                ]),
                'created_at'         => $reservation->created_at,
            ],
            'users' => $users,
            'currentUser' => ['id' => auth()->id()],
        ]);
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

    /** POST /reservas/{reservation}/escalar */
    public function escalate(Request $request, SpaceReservation $reservation)
    {
        $data = $request->validate([
            'escalated_to_id'  => 'required|exists:users,id',
            'escalation_notes' => 'nullable|string|max:1000',
        ]);

        $reservation->update([
            'escalated_to_id'  => $data['escalated_to_id'],
            'escalated_at'     => now(),
            'escalation_notes' => $data['escalation_notes'] ?? null,
        ]);

        return back()->with('message', 'Pedido de aprovação escalado.');
    }

    public function destroy(SpaceReservation $reservation)
    {
        $reservation->update(['status' => 'cancelada']);
        return redirect('/reservas')->with('message', 'Reserva cancelada.');
    }
}
