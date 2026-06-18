<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Event;
use App\Models\InventoryItem;
use App\Models\SpaceReservation;
use App\Models\Task;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '30');
        $from = now()->subDays((int)$period);

        $tickets = [
            'total'        => Ticket::count(),
            'period'       => Ticket::where('created_at', '>=', $from)->count(),
            'by_status'    => Ticket::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'by_priority'  => Ticket::selectRaw('priority, count(*) as total')->groupBy('priority')->pluck('total', 'priority'),
            'resolved_period' => Ticket::whereIn('status', ['resolvido','encerrado'])->where('updated_at', '>=', $from)->count(),
        ];

        $tasks = [
            'total'      => Task::count(),
            'completed'  => Task::where('status', 'completed')->count(),
            'overdue'    => Task::where('status', '!=', 'completed')->whereNotNull('due_date')->where('due_date', '<', now())->count(),
            'by_status'  => Task::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
        ];

        $reservations = [
            'total'    => SpaceReservation::count(),
            'approved' => SpaceReservation::where('status', 'aprovada')->count(),
            'pending'  => SpaceReservation::where('status', 'pendente')->count(),
            'period'   => SpaceReservation::where('created_at', '>=', $from)->count(),
        ];

        $inventory = [
            'total_items' => InventoryItem::count(),
            'low_stock'   => InventoryItem::whereRaw('current_stock <= min_stock')->count(),
            'out_of_stock'=> InventoryItem::where('current_stock', 0)->count(),
        ];

        $hr = [
            'total_employees' => Employee::count(),
            'active'          => Employee::where('status', 'ativo')->count(),
        ];

        return Inertia::render('Relatorios/Index', [
            'tickets'      => $tickets,
            'tasks'        => $tasks,
            'reservations' => $reservations,
            'inventory'    => $inventory,
            'hr'           => $hr,
            'period'       => $period,
        ]);
    }
}
