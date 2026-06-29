<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeAbsence;
use App\Models\Event;
use App\Models\InventoryItem;
use App\Models\OperationalPlan;
use App\Models\SpaceReservation;
use App\Models\Task;
use App\Models\Ticket;
use App\Services\PermissionService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'tickets' => [
                'total'        => Ticket::count(),
                'aberto'       => Ticket::where('status','aberto')->count(),
                'em_progresso' => Ticket::where('status','em_progresso')->count(),
                'resolvido'    => Ticket::where('status','resolvido')->count(),
            ],
            'tasks' => [
                'total'        => Task::count(),
                'pending'      => Task::where('status','pending')->count(),
                'in_progress'  => Task::where('status','in_progress')->count(),
                'completed'    => Task::where('status','completed')->count(),
            ],
            'reservations' => [
                'total'    => SpaceReservation::count(),
                'pendente' => SpaceReservation::where('status','pendente')->count(),
                'aprovada' => SpaceReservation::where('status','aprovada')->count(),
            ],
            'inventory' => [
                'low_stock' => InventoryItem::whereRaw('current_stock <= min_stock')->count(),
            ],
            'plans' => [
                'total'      => OperationalPlan::count(),
                'em_execucao'=> OperationalPlan::where('status','em_execução')->count(),
                'aprovado'   => OperationalPlan::where('status','aprovado')->count(),
                'concluido'  => OperationalPlan::where('status','concluído')->count(),
            ],
        ];

        $recentTickets = Ticket::with(['contact','serviceArea','assignee'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $upcomingEvents = Event::with(['space'])
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->limit(5)
            ->get();

        $pendingReservations = SpaceReservation::with(['space','contact'])
            ->where('status','pendente')
            ->orderBy('starts_at')
            ->limit(5)
            ->get();

        $activePlans = OperationalPlan::with(['serviceArea','manager'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => fn ($q) => $q->where('status','completed')])
            ->whereIn('status', ['aprovado','em_execução'])
            ->orderByRaw("CASE WHEN status = 'em_execução' THEN 0 ELSE 1 END")
            ->orderBy('planned_end')
            ->limit(8)
            ->get()
            ->map(function ($p) {
                $total     = $p->tasks_count ?? 0;
                $done      = $p->completed_tasks_count ?? 0;
                $progress  = $total > 0 ? (int) round(($done / $total) * 100) : ($p->progress ?? 0);
                return [
                    'id'           => $p->id,
                    'title'        => $p->title,
                    'status'       => $p->status,
                    'progress'     => $progress,
                    'planned_end'  => $p->planned_end?->format('Y-m-d'),
                    'service_area' => $p->serviceArea?->name,
                    'manager'      => $p->manager?->name,
                    'tasks_total'  => $total,
                    'tasks_done'   => $done,
                ];
            });

        $user = auth()->user();
        $canApproveAbsences = $user && PermissionService::check($user, 'hr.ausencia.aprovar');

        $pendingAbsences = $canApproveAbsences
            ? EmployeeAbsence::with(['contact:id,name,position,department_id', 'contact.department:id,name'])
                ->where('status', 'pendente')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
            : collect();

        return Inertia::render('Dashboard', [
            'stats'               => $stats,
            'recentTickets'       => $recentTickets,
            'upcomingEvents'      => $upcomingEvents,
            'pendingReservations' => $pendingReservations,
            'pendingAbsences'     => $pendingAbsences,
            'canApproveAbsences'  => $canApproveAbsences,
            'activePlans'         => $activePlans,
        ]);
    }
}
