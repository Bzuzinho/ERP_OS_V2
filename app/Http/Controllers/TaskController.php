<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\MaterialAllocation;
use App\Models\OperationalPlan;
use App\Models\ServiceArea;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Models\TaskMaterial;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['assignee','serviceArea','ticket','team','plan','checklistItems'])
            ->orderBy('due_date')
            ->orderByDesc('created_at');

        if ($request->filled('status'))            $query->where('status', $request->status);
        if ($request->filled('priority'))          $query->where('priority', $request->priority);
        if ($request->filled('validation_status')) $query->where('validation_status', $request->validation_status);
        if ($request->filled('team_id'))           $query->where('team_id', $request->team_id);
        if ($request->filled('assigned_to'))       $query->where('assigned_to', $request->assigned_to);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('title','like',"%$s%")->orWhere('description','like',"%$s%"));
        }

        return Inertia::render('Tasks/Index', [
            'tasks'   => $query->paginate(25)->withQueryString(),
            'filters' => $request->only(['status','priority','validation_status','team_id','assigned_to','search']),
            'users'   => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'teams'   => Team::where('is_active', true)->orderBy('name')->get(['id','name','type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Tasks/Create', [
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'teams'        => Team::where('is_active', true)->orderBy('name')->get(['id','name','type']),
            'plans'        => OperationalPlan::where('organization_id', 1)
                                ->whereIn('status', ['rascunho','ativo'])
                                ->orderBy('title')->get(['id','title']),
            'inventory'    => InventoryItem::where('is_active', true)->orderBy('name')
                                ->get(['id','name','unit','item_type','current_stock']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'status'            => 'required|in:pending,in_progress,completed,cancelled',
            'priority'          => 'required|in:low,medium,high',
            'assigned_to'       => 'nullable|exists:users,id',
            'team_id'           => 'nullable|exists:teams,id',
            'plan_id'           => 'nullable|exists:operational_plans,id',
            'due_date'          => 'nullable|date',
            'service_area_id'   => 'nullable|exists:service_areas,id',
            'validation_status'  => 'in:nao_aplicavel,pendente,validado,rejeitado',
            'recurrence'         => 'nullable|in:nenhuma,diária,semanal,quinzenal,mensal,anual',
            'recurrence_ends_at' => 'nullable|date',
            'checklist'          => 'nullable|array',
            'checklist.*.title' => 'required|string|max:255',
            'materials'         => 'nullable|array',
            'materials.*.inventory_item_id' => 'exists:inventory_items,id',
            'materials.*.quantity'          => 'numeric|min:0.001',
            'materials.*.usage_type'        => 'in:consumido,utilizado,alocado',
        ]);

        DB::transaction(function () use ($validated) {
            $taskData = array_diff_key($validated, array_flip(['materials','checklist']));
            $task = Task::create(array_merge($taskData, [
                'created_by'      => Auth::id(),
                'organization_id' => 1,
            ]));

            foreach ($validated['checklist'] ?? [] as $i => $item) {
                TaskChecklistItem::create([
                    'task_id'    => $task->id,
                    'title'      => $item['title'],
                    'sort_order' => $i,
                ]);
            }

            foreach ($validated['materials'] ?? [] as $m) {
                TaskMaterial::create(array_merge($m, ['task_id' => $task->id]));
            }
        });

        return redirect('/tarefas')->with('message', 'Tarefa criada com sucesso.');
    }

    public function show(Task $task)
    {
        $task->load([
            'assignee','serviceArea','ticket','team','plan',
            'materials.item','allocations.item',
            'checklistItems','creator','validator',
        ]);

        return Inertia::render('Tasks/Show', [
            'task'      => $task,
            'users'     => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'inventory' => InventoryItem::where('is_active', true)->orderBy('name')
                            ->get(['id','name','unit','item_type','current_stock']),
        ]);
    }

    public function edit(Task $task)
    {
        return Inertia::render('Tasks/Edit', [
            'task'         => $task->load(['materials.item','checklistItems']),
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'teams'        => Team::where('is_active', true)->orderBy('name')->get(['id','name','type']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'plans'        => OperationalPlan::where('organization_id', 1)
                                ->whereIn('status', ['rascunho','ativo'])
                                ->orderBy('title')->get(['id','title']),
            'inventory'    => InventoryItem::where('is_active', true)->orderBy('name')
                                ->get(['id','name','unit','item_type','current_stock']),
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'             => 'sometimes|string|max:255',
            'description'       => 'nullable|string',
            'status'            => 'sometimes|in:pending,in_progress,completed,cancelled',
            'priority'          => 'sometimes|in:low,medium,high',
            'assigned_to'       => 'nullable|exists:users,id',
            'team_id'           => 'nullable|exists:teams,id',
            'plan_id'           => 'nullable|exists:operational_plans,id',
            'due_date'          => 'nullable|date',
            'service_area_id'   => 'nullable|exists:service_areas,id',
            'validation_status'  => 'sometimes|in:nao_aplicavel,pendente,validado,rejeitado',
            'rejection_reason'   => 'nullable|string',
            'recurrence'         => 'sometimes|in:nenhuma,diária,semanal,quinzenal,mensal,anual',
            'recurrence_ends_at' => 'nullable|date',
        ]);

        $wasCompleted = $task->status === 'completed';
        $task->update($validated);

        // Se acabou de ser marcada como completa e é recorrente → criar próxima ocorrência
        if (!$wasCompleted && $task->fresh()->status === 'completed' && $task->isRecurring()) {
            $task->createNextOccurrence();
        }

        return back()->with('message', 'Tarefa atualizada.');
    }

    // ─── Checklist ────────────────────────────────────────────────────────────

    public function storeChecklistItem(Request $request, Task $task)
    {
        $data = $request->validate(['title' => 'required|string|max:255']);
        $max = $task->checklistItems()->max('sort_order') ?? -1;
        TaskChecklistItem::create([
            'task_id'    => $task->id,
            'title'      => $data['title'],
            'sort_order' => $max + 1,
        ]);
        return back()->with('message', 'Item adicionado.');
    }

    public function toggleChecklistItem(Task $task, TaskChecklistItem $item)
    {
        abort_unless($item->task_id === $task->id, 403);
        $nowCompleted = !$item->is_completed;
        $item->update([
            'is_completed' => $nowCompleted,
            'completed_by' => $nowCompleted ? Auth::id() : null,
            'completed_at' => $nowCompleted ? now() : null,
        ]);

        // Auto-complete task when all checklist items are done
        if ($nowCompleted) {
            $allDone = $task->checklistItems()->where('is_completed', false)->doesntExist();
            if ($allDone && $task->status !== 'completed') {
                $task->update(['status' => 'completed']);
                // Se é tarefa recorrente, criar próxima ocorrência
                if ($task->isRecurring()) {
                    $task->createNextOccurrence();
                }
            }
        }

        return back();
    }

    public function destroyChecklistItem(Task $task, TaskChecklistItem $item)
    {
        abort_unless($item->task_id === $task->id, 403);
        $item->delete();
        return back()->with('message', 'Item removido.');
    }

    public function updateChecklistItem(Request $request, Task $task, TaskChecklistItem $item)
    {
        abort_unless($item->task_id === $task->id, 403);
        $data = $request->validate(['title' => 'required|string|max:255']);
        $item->update($data);
        return back()->with('message', 'Item atualizado.');
    }

    // ─── Validação ────────────────────────────────────────────────────────────

    public function approveTask(Request $request, Task $task)
    {
        $request->validate([
            'action'           => 'required|in:validado,rejeitado',
            'rejection_reason' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $task) {
            $task->update([
                'validation_status' => $request->action,
                'validated_by'      => Auth::id(),
                'validated_at'      => now(),
                'rejection_reason'  => $request->action === 'rejeitado' ? $request->rejection_reason : null,
            ]);

            if ($request->action === 'validado') {
                foreach ($task->materials as $tm) {
                    $item = $tm->item;
                    if (!$item) continue;
                    if ($tm->usage_type === 'consumido' && $item->isConsumivel()) {
                        $item->decrement('current_stock', $tm->quantity);
                        InventoryMovement::create([
                            'inventory_item_id' => $item->id,
                            'organization_id'   => 1,
                            'user_id'           => Auth::id(),
                            'type'              => 'saida',
                            'quantity'          => $tm->quantity,
                            'notes'             => "Tarefa #{$task->id}: {$task->title}",
                            'occurred_at'       => now(),
                        ]);
                    } elseif (in_array($tm->usage_type, ['utilizado','alocado']) && $item->isReutilizavel()) {
                        MaterialAllocation::create([
                            'inventory_item_id' => $item->id,
                            'allocated_to_type' => $task->team_id ? 'team' : 'user',
                            'allocated_to_id'   => $task->team_id ?? $task->assigned_to,
                            'quantity'          => $tm->quantity,
                            'status'            => 'em_uso',
                            'task_id'           => $task->id,
                            'created_by'        => Auth::id(),
                        ]);
                    }
                }
            }
        });

        return back()->with('message',
            $request->action === 'validado' ? 'Tarefa validada.' : 'Tarefa rejeitada.'
        );
    }

    public function addMaterial(Request $request, Task $task)
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity'          => 'required|numeric|min:0.001',
            'usage_type'        => 'required|in:consumido,utilizado,alocado',
            'notes'             => 'nullable|string',
        ]);
        TaskMaterial::updateOrCreate(
            ['task_id' => $task->id, 'inventory_item_id' => $data['inventory_item_id']],
            $data + ['task_id' => $task->id]
        );
        return back()->with('message', 'Material adicionado.');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return redirect('/tarefas')->with('message', 'Tarefa eliminada.');
    }
}
