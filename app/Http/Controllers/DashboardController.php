<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeAbsence;
use App\Models\Event;
use App\Models\InventoryItem;
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
        ]);
    }
}
