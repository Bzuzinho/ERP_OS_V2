<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Event;
use App\Models\MaterialAllocation;
use App\Models\OperationalPlan;
use App\Models\Space;
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
            ->with(['tasks' => fn($q) => $q->select('id','plan_id','status')])
            ->orderByRaw("CASE status WHEN 'ativo' THEN 0 WHEN 'rascunho' THEN 1 ELSE 2 END")
            ->orderByDesc('planned_start')
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'title'       => $p->title,
                'description' => $p->description,
                'status'      => $p->status,
                'year'        => $p->planned_start?->year ?? now()->year,
                'starts_at'   => $p->planned_start,
                'ends_at'     => $p->planned_end,
                'tasks_count' => $p->tasks_count,
                'progress'    => $p->tasks_count > 0
                    ? (int) round(($p->tasks->where('status','completed')->count() / $p->tasks_count) * 100)
                    : 0,
                'tasks_by_status' => $p->tasks->groupBy('status')->map->count(),
            ]);

        // Global stats for the dashboard header
        $stats = [
            'plans_active'       => OperationalPlan::where('organization_id',1)->where('status','ativo')->count(),
            'tasks_pending'      => Task::where('organization_id',1)->whereIn('status',['pending','in_progress'])->count(),
            'pending_validation' => Task::where('organization_id',1)->where('validation_status','pendente')->count(),
            'space_pending'      => SpaceReservation::where('status','pendente')->count(),
            'events_this_week'   => Event::where('organization_id',1)
                ->whereBetween('starts_at',[now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
        ];

        return Inertia::render('Planeamento/Index', ['plans' => $plans, 'stats' => $stats]);
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
        $plan->load([
            'tasks' => fn($q) => $q->with(['assignee','team','checklistItems'])->orderBy('due_date')->orderByDesc('priority'),
        ]);

        // Only events explicitly linked to this plan
        $events = Event::with(['space','creator'])
            ->where('plan_id', $plan->id)
            ->orderBy('starts_at')
            ->get();

        $tasksByStatus = $plan->tasks->groupBy('status')->map->count();
        $total         = $plan->tasks->count();
        $completed     = $plan->tasks->where('status','completed')->count();

        // ── Requisições do plano ──────────────────────────────────────────────
        // Tasks in this plan pending supervisor validation
        $tasksPendingVal = $plan->tasks
            ->filter(fn($t) => $t->validation_status === 'pendente')
            ->values();

        // Space reservations linked to this plan (by plan_id) OR overlapping the plan period
        $spaceReservations = SpaceReservation::with(['space','contact','user'])
            ->where(function ($q) use ($plan) {
                // Directly linked reservations (regardless of status)
                $q->where('plan_id', $plan->id);
                // OR date-overlap reservations not linked to any plan
                if ($plan->planned_start && $plan->planned_end) {
                    $q->orWhere(function ($q2) use ($plan) {
                        $q2->whereNull('plan_id')
                           ->where('status', 'pendente')
                           ->where('starts_at', '<=', $plan->planned_end)
                           ->where('ends_at',   '>=', $plan->planned_start);
                    });
                }
            })
            ->orderBy('starts_at')
            ->get();

        // ── Recursos do plano ─────────────────────────────────────────────────
        $taskIds = $plan->tasks->pluck('id');
        $teamIds = $plan->tasks->pluck('team_id')->filter()->unique();

        $planTeams = $teamIds->isNotEmpty()
            ? Team::with(['leader','members'])->whereIn('id', $teamIds)->get()
            : collect();

        $planAllocations = $taskIds->isNotEmpty()
            ? MaterialAllocation::with(['item','task'])
                ->whereIn('task_id', $taskIds)
                ->where('status', 'em_uso')
                ->get()
            : collect();

        return Inertia::render('Planeamento/Show', [
            'plan' => array_merge($plan->toArray(), [
                'year'            => $plan->planned_start?->year ?? now()->year,
                'starts_at'       => $plan->planned_start,
                'ends_at'         => $plan->planned_end,
                'progress'        => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'tasks_by_status' => $tasksByStatus,
            ]),
            'events'            => $events,
            'users'             => User::where('is_active',true)->orderBy('name')->get(['id','name']),
            'teams'             => Team::where('is_active',true)->orderBy('name')->get(['id','name']),
            'tasksPendingVal'   => $tasksPendingVal,
            'spaceReservations' => $spaceReservations,
            'planTeams'         => $planTeams,
            'planAllocations'   => $planAllocations,
            'spaces'            => Space::orderBy('name')->get(['id','name']),
        ]);
    }

    public function update(Request $request, OperationalPlan $plan)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date',
            'status'      => 'nullable|in:rascunho,ativo,concluido,cancelado',
        ]);

        $plan->update([
            'title'         => $data['title']     ?? $plan->title,
            'description'   => $data['description'] ?? $plan->description,
            'status'        => $data['status']    ?? $plan->status,
            'planned_start' => $data['starts_at'] ?? $plan->planned_start,
            'planned_end'   => $data['ends_at']   ?? $plan->planned_end,
        ]);

        return back()->with('message', 'Plano atualizado.');
    }

    public function destroy(OperationalPlan $plan)
    {
        $plan->delete();
        return redirect('/planeamento')->with('message', 'Plano eliminado.');
    }

    // ─── Sub-secções ──────────────────────────────────────────────────────────

    public function agenda(Request $request)
    {
        $now   = now();
        $month = $request->get('month', $now->month);
        $year  = $request->get('year',  $now->year);

        // Same data as EventController::index() — the agenda sub-tab IS the main agenda
        $events = Event::with(['space','creator','participants.user','participants.contact','tasks','reservation'])
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

    public function requisicoes()
    {
        $spacePending = SpaceReservation::with(['space','contact','user'])
            ->where('status', 'pendente')
            ->orderBy('starts_at')
            ->get();

        $tasksPendingValidation = Task::with(['assignee','team','materials','plan'])
            ->where('validation_status', 'pendente')
            ->orderBy('due_date')
            ->limit(40)
            ->get();

        return Inertia::render('Planeamento/Requisicoes', [
            'spacePending'           => $spacePending,
            'tasksPendingValidation' => $tasksPendingValidation,
        ]);
    }

    public function recursos()
    {
        $teams = Team::with(['leader','members'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $allocations = MaterialAllocation::with(['item','task'])
            ->where('status', 'em_uso')
            ->orderByDesc('created_at')
            ->limit(40)
            ->get();

        $users = User::where('is_active', true)
            ->withCount([
                'tasks as open_tasks'     => fn($q) => $q->whereIn('status',['pending','in_progress']),
                'tasks as completed_tasks' => fn($q) => $q->where('status','completed'),
            ])
            ->orderBy('name')
            ->get(['id','name','email']);

        return Inertia::render('Planeamento/Recursos', [
            'teams'       => $teams,
            'allocations' => $allocations,
            'users'       => $users,
        ]);
    }
}
