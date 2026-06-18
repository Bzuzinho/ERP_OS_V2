<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\MaterialAllocation;
use App\Models\OperationalPlan;
use App\Models\SpaceReservation;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperationalPlanController extends Controller
{
    public function index()
    {
        $plans = OperationalPlan::withCount('tasks')
            ->orderByRaw("CAST(strftime('%Y', COALESCE(planned_start, created_at)) AS INTEGER) DESC")
            ->orderBy('title')
            ->get()
            ->map(fn($p) => array_merge($p->toArray(), [
                'year'      => $p->planned_start ? $p->planned_start->year : now()->year,
                'starts_at' => $p->planned_start,
                'ends_at'   => $p->planned_end,
                'progress'  => 0,
            ]));

        return Inertia::render('Planeamento/Index', ['plans' => $plans]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'year'        => 'required|integer|min:2020|max:2100',
            'starts_at'   => 'required|date',
            'ends_at'     => 'required|date|after:starts_at',
            'status'      => 'nullable|in:rascunho,ativo,concluido,cancelado',
        ]);

        $plan = OperationalPlan::create([
            'organization_id' => 1,
            'created_by'      => auth()->id(),
            'title'           => $data['title'],
            'description'     => $data['description'] ?? null,
            'status'          => $data['status'] ?? 'rascunho',
            'planned_start'   => $data['starts_at'],
            'planned_end'     => $data['ends_at'],
        ]);

        return redirect("/planeamento/{$plan->id}")->with('message', 'Plano criado.');
    }

    public function show(OperationalPlan $plan)
    {
        $plan->load(['tasks' => fn($q) => $q->with('assignee')->orderBy('due_date')]);
        $data = array_merge($plan->toArray(), [
            'year'      => $plan->planned_start ? $plan->planned_start->year : now()->year,
            'starts_at' => $plan->planned_start,
            'ends_at'   => $plan->planned_end,
            'progress'  => $plan->tasks->count() > 0
                ? (int) round(($plan->tasks->where('status','completed')->count() / $plan->tasks->count()) * 100)
                : 0,
        ]);
        return Inertia::render('Planeamento/Show', ['plan' => $data]);
    }

    public function update(Request $request, OperationalPlan $plan)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'year'        => 'nullable|integer',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date',
            'status'      => 'nullable|in:rascunho,ativo,concluido,cancelado',
        ]);

        $plan->update([
            'title'         => $data['title'],
            'description'   => $data['description'] ?? $plan->description,
            'status'        => $data['status'] ?? $plan->status,
            'planned_start' => $data['starts_at'] ?? $plan->planned_start,
            'planned_end'   => $data['ends_at'] ?? $plan->planned_end,
        ]);

        return back()->with('message', 'Plano atualizado.');
    }

    public function destroy(OperationalPlan $plan)
    {
        $plan->delete();
        return redirect('/planeamento')->with('message', 'Plano eliminado.');
    }

    // Sub-seccoes do modulo Planeamento

    public function agenda()
    {
        $events = Event::with(['space', 'creator'])
            ->where('starts_at', '>=', now()->startOfDay())
            ->orderBy('starts_at')
            ->limit(50)
            ->get()
            ->map(fn($e) => [
                'id'        => $e->id,
                'title'     => $e->title,
                'starts_at' => $e->starts_at,
                'ends_at'   => $e->ends_at,
                'type'      => $e->type,
                'location'  => $e->location,
                'all_day'   => $e->all_day,
                'space'     => $e->space ? ['id' => $e->space->id, 'name' => $e->space->name] : null,
                'creator'   => $e->creator ? ['name' => $e->creator->name] : null,
            ]);

        $reservations = SpaceReservation::with(['space', 'contact', 'user'])
            ->whereIn('status', ['pendente', 'aprovada'])
            ->where('starts_at', '>=', now()->startOfDay())
            ->orderBy('starts_at')
            ->limit(30)
            ->get()
            ->map(fn($r) => [
                'id'        => $r->id,
                'title'     => $r->title,
                'starts_at' => $r->starts_at,
                'ends_at'   => $r->ends_at,
                'status'    => $r->status,
                'space'     => $r->space ? ['name' => $r->space->name] : null,
                'requester' => $r->contact ? $r->contact->name : ($r->user ? $r->user->name : '--'),
            ]);

        return Inertia::render('Planeamento/Agenda', [
            'events'       => $events,
            'reservations' => $reservations,
        ]);
    }

    public function requisicoes()
    {
        $spacePending = SpaceReservation::with(['space', 'contact', 'user'])
            ->where('status', 'pendente')
            ->orderBy('starts_at')
            ->get()
            ->map(fn($r) => [
                'id'        => $r->id,
                'title'     => $r->title,
                'purpose'   => $r->purpose,
                'starts_at' => $r->starts_at,
                'ends_at'   => $r->ends_at,
                'space'     => $r->space ? ['name' => $r->space->name] : null,
                'requester' => $r->contact ? $r->contact->name : ($r->user ? $r->user->name : '--'),
            ]);

        $tasksPendingValidation = Task::with(['assignee', 'team', 'materials'])
            ->where('validation_status', 'pendente')
            ->orderBy('due_date')
            ->limit(30)
            ->get()
            ->map(fn($t) => [
                'id'                => $t->id,
                'title'             => $t->title,
                'due_date'          => $t->due_date,
                'priority'          => $t->priority,
                'validation_status' => $t->validation_status,
                'assignee'          => $t->assignee ? ['name' => $t->assignee->name] : null,
                'team'              => $t->team ? ['name' => $t->team->name] : null,
                'materials_count'   => $t->materials->count(),
            ]);

        return Inertia::render('Planeamento/Requisicoes', [
            'spacePending'           => $spacePending,
            'tasksPendingValidation' => $tasksPendingValidation,
        ]);
    }

    public function recursos()
    {
        $teams = Team::with(['leader', 'members'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id'            => $t->id,
                'name'          => $t->name,
                'type'          => $t->type,
                'leader'        => $t->leader ? ['name' => $t->leader->name] : null,
                'members_count' => $t->members->count(),
            ]);

        $allocations = MaterialAllocation::with(['item', 'task'])
            ->where('status', 'em_uso')
            ->orderByDesc('allocated_at')
            ->limit(40)
            ->get()
            ->map(fn($a) => [
                'id'                => $a->id,
                'item'              => $a->item ? ['name' => $a->item->name, 'unit' => $a->item->unit] : null,
                'quantity'          => $a->quantity,
                'allocated_to_type' => $a->allocated_to_type,
                'allocated_to_name' => $a->allocated_to_name,
                'status'            => $a->status,
                'allocated_at'      => $a->allocated_at,
                'task'              => $a->task ? ['id' => $a->task->id, 'title' => $a->task->title] : null,
            ]);

        $users = User::where('is_active', true)
            ->withCount(['tasks as open_tasks' => fn($q) => $q->whereIn('status', ['pending','in_progress'])])
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'open_tasks' => $u->open_tasks,
            ]);

        return Inertia::render('Planeamento/Recursos', [
            'teams'       => $teams,
            'allocations' => $allocations,
            'users'       => $users,
        ]);
    }
}
