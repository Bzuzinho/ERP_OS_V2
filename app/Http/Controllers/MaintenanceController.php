<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Task;
use App\Models\Team;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Maintenance::with(['space', 'assignedTeam', 'assignee', 'creator'])
            ->where('organization_id', 1);

        if ($request->status)   $query->where('status', $request->status);
        if ($request->type)     $query->where('type', $request->type);
        if ($request->space_id) $query->where('space_id', $request->space_id);

        $maintenances = $query->orderByRaw("CASE status
            WHEN 'pendente'     THEN 1
            WHEN 'em_progresso' THEN 2
            WHEN 'concluida'    THEN 3
            ELSE 4 END")
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn($m) => $this->format($m));

        $spaces = Space::where('is_active', true)->orderBy('name')->get(['id','name','type']);
        $teams  = Team::where('is_active', true)->where('organization_id', 1)->orderBy('name')->get(['id','name','type']);
        $users  = User::where('is_active', true)->orderBy('name')->get(['id','name']);

        return Inertia::render('Manutencoes/Index', compact('maintenances','spaces','teams','users'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:preventiva,corretiva,urgente,periodica',
            'priority'         => 'required|in:baixa,normal,alta,urgente',
            'space_id'         => 'nullable|exists:spaces,id',
            'assigned_team_id' => 'nullable|exists:teams,id',
            'assigned_to'      => 'nullable|exists:users,id',
            'scheduled_at'     => 'nullable|date',
            'estimated_cost'   => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
        ]);

        $maintenance = Maintenance::create(array_merge($data, [
            'organization_id' => 1,
            'created_by'      => Auth::id(),
            'status'          => 'pendente',
        ]));

        // Gerar tarefa automaticamente
        $task = Task::create([
            'organization_id'   => 1,
            'title'             => "Manutenção: {$maintenance->title}",
            'description'       => $maintenance->description,
            'status'            => 'pending',
            'priority'          => $this->mapPriority($maintenance->priority),
            'origin'            => 'manutencao',
            'maintenance_id'    => $maintenance->id,
            'assigned_to'       => $maintenance->assigned_to,
            'team_id'           => $maintenance->assigned_team_id,
            'created_by'        => Auth::id(),
            'due_date'          => $maintenance->scheduled_at,
            'validation_status' => 'pendente',
        ]);

        $maintenance->tasks()->attach($task->id);

        return redirect('/manutencoes')->with('flash', ['success' => "Manutenção criada e tarefa #{$task->id} gerada."]);
    }

    public function show(Maintenance $maintenance)
    {
        $maintenance->load(['space','assignedTeam','assignee','creator','tasks.assignee']);
        $spaces = Space::where('is_active', true)->orderBy('name')->get(['id','name']);
        $teams  = Team::where('is_active', true)->orderBy('name')->get(['id','name']);
        $users  = User::where('is_active', true)->orderBy('name')->get(['id','name']);

        return Inertia::render('Manutencoes/Show', [
            'maintenance' => $this->format($maintenance, detailed: true),
            'spaces' => $spaces,
            'teams'  => $teams,
            'users'  => $users,
        ]);
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:preventiva,corretiva,urgente,periodica',
            'priority'         => 'required|in:baixa,normal,alta,urgente',
            'status'           => 'required|in:pendente,em_progresso,concluida,cancelada',
            'space_id'         => 'nullable|exists:spaces,id',
            'assigned_team_id' => 'nullable|exists:teams,id',
            'assigned_to'      => 'nullable|exists:users,id',
            'scheduled_at'     => 'nullable|date',
            'completed_at'     => 'nullable|date',
            'estimated_cost'   => 'nullable|numeric|min:0',
            'actual_cost'      => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
        ]);

        $maintenance->update($data);
        return back()->with('flash', ['success' => 'Manutenção atualizada.']);
    }

    public function destroy(Maintenance $maintenance)
    {
        $maintenance->delete();
        return redirect('/manutencoes')->with('flash', ['success' => 'Manutenção eliminada.']);
    }

    // ── helpers ──────────────────────────────────────────────

    private function format(Maintenance $m, bool $detailed = false): array
    {
        $base = [
            'id'               => $m->id,
            'title'            => $m->title,
            'description'      => $m->description,
            'type'             => $m->type,
            'status'           => $m->status,
            'priority'         => $m->priority,
            'space'            => $m->space ? ['id'=>$m->space->id,'name'=>$m->space->name] : null,
            'assigned_team'    => $m->assignedTeam ? ['id'=>$m->assignedTeam->id,'name'=>$m->assignedTeam->name] : null,
            'assignee'         => $m->assignee ? ['id'=>$m->assignee->id,'name'=>$m->assignee->name] : null,
            'scheduled_at'     => $m->scheduled_at?->toISOString(),
            'completed_at'     => $m->completed_at?->toISOString(),
            'estimated_cost'   => $m->estimated_cost,
            'actual_cost'      => $m->actual_cost,
            'notes'            => $m->notes,
            'created_at'       => $m->created_at?->toISOString(),
        ];

        if ($detailed) {
            $base['tasks'] = $m->tasks->map(fn($t) => [
                'id'       => $t->id,
                'title'    => $t->title,
                'status'   => $t->status,
                'due_date' => $t->due_date?->toISOString(),
                'assignee' => $t->assignee ? ['name'=>$t->assignee->name] : null,
            ]);
        }

        return $base;
    }

    private function mapPriority(string $p): string
    {
        return match($p) {
            'baixa'  => 'low',
            'alta', 'urgente' => 'high',
            default  => 'medium',
        };
    }
}
