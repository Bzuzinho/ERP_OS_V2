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

        // Events linked to this plan (by plan_id on tasks, or events that overlap plan dates)
        $events = Event::with(['space','creator'])
            ->where('organization_id', 1)
            ->when($plan->planned_start && $plan->planned_end, fn($q) =>
                $q->where('starts_at', '>=', $plan->planned_start)
                  ->where('starts_at', '<=', $plan->planned_end)
            )
            ->orderBy('starts_at')
            ->limit(20)
            ->get();

        $tasksByStatus = $plan->tasks->groupBy('status')->map->count();
        $total         = $plan->tasks->count();
        $completed     = $plan->tasks->where('status','completed')->count();

        return Inertia::render('Planeamento/Show', [
            'plan' => array_merge($plan->toArray(), [
                'year'            => $plan->planned_start?->year ?? now()->year,
                'starts_at'       => $plan->planned_start,
                'ends_at'         => $plan->planned_end,
                'progress'        => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'tasks_by_status' => $tasksByStatus,
            ]),
            'events'   => $events,
            'users'    => User::where('is_active',true)->orderBy('name')->get(['id','name']),
            'teams'    => Team::where('is_active',true)->orderBy('name')->get(['id','name']),
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

    public function agenda()
    {
        $events = Event::with(['space','creator','participants'])
            ->where('organization_id', 1)
            ->where('starts_at', '>=', now()->startOfDay())
            ->orderBy('starts_at')
            ->limit(60)
            ->get();

        $reservations = SpaceReservation::with(['space','contact','user'])
            ->whereIn('status', ['pendente','aprovada'])
            ->where('starts_at', '>=', now()->startOfDay())
            ->orderBy('starts_at')
            ->limit(30)
            ->get();

        // Tasks with upcoming due dates (next 30 days)
        $tasksDue = Task::with(['assignee','plan'])
            ->where('organization_id', 1)
            ->whereNotIn('status', ['completed','cancelled'])
            ->whereBetween('due_date', [now(), now()->addDays(30)])
            ->orderBy('due_date')
            ->limit(30)
            ->get();

        return Inertia::render('Planeamento/Agenda', [
            'events'       => $events,
            'reservations' => $reservations,
            'tasksDue'     => $tasksDue,
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
        $teams = Team::with(['leader','members.user'])
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
