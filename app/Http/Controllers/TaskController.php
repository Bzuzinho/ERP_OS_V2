<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\MaterialAllocation;
use App\Models\NotificationRecipient;
use App\Models\OperationalPlan;
use App\Models\ServiceArea;
use App\Models\SystemNotification;
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

        $planId = $validated['plan_id'] ?? null;
        $redirect = $planId ? "/planeamento/{$planId}" : '/tarefas';
        return redirect($redirect)->with('message', 'Tarefa criada com sucesso.');
    }

    public function show(Task $task)
    {
        $task->load([
            'assignee','serviceArea','ticket','team','plan',
            'materials.item','allocations.item',
            'checklistItems.completedBy','checklistItems.validator',
            'creator','validator',
        ]);

        return Inertia::render('Tasks/Show', [
            'task'         => $task,
            'users'        => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'serviceAreas' => ServiceArea::where('is_active', true)->get(['id','name']),
            'teams'        => Team::where('is_active', true)->orderBy('name')->get(['id','name','type']),
            'inventory'    => InventoryItem::where('is_active', true)->orderBy('name')
                                ->get(['id','name','unit','item_type','current_stock']),
        ]);
    }

    // PATCH /tarefas/{task}/atribuicao
    public function updateAssignment(Request $request, Task $task)
    {
        $data = $request->validate([
            'service_area_id' => 'nullable|exists:service_areas,id',
            'team_id'         => 'nullable|exists:teams,id',
            'assigned_to'     => 'nullable|exists:users,id',
        ]);
        $task->update($data);
        return back()->with('message', 'Atribuição actualizada.');
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

        return redirect("/tarefas/{$task->id}")->with('message', 'Tarefa atualizada.');
    }

    // ─── Checklist ────────────────────────────────────────────────────────────

    public function storeChecklistItem(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'               => 'required|string|max:255',
            'requires_validation' => 'boolean',
        ]);
        $max = $task->checklistItems()->max('sort_order') ?? -1;
        TaskChecklistItem::create([
            'task_id'             => $task->id,
            'title'               => $data['title'],
            'sort_order'          => $max + 1,
            'requires_validation' => $data['requires_validation'] ?? false,
        ]);
        return back()->with('message', 'Item adicionado.');
    }

    public function toggleChecklistItem(Task $task, TaskChecklistItem $item)
    {
        abort_unless($item->task_id === $task->id, 403);

        // Item com validação obrigatória — fluxo especial
        if ($item->requires_validation) {
            if (is_null($item->validation_status) || $item->validation_status === 'rejeitado') {
                // Submeter para validação
                $item->update([
                    'validation_status' => 'pendente',
                    'is_completed'      => false,
                    'rejection_reason'  => null,
                ]);
                $this->notifyChecklistValidation($task, $item);
            } elseif ($item->validation_status === 'pendente') {
                // Cancelar submissão → volta ao estado inicial
                $item->update(['validation_status' => null]);
            }
            // Se já aprovado, clique não faz nada (só o validador pode reverter)
            return back();
        }

        // Item normal — toggle simples
        $nowCompleted = !$item->is_completed;
        $item->update([
            'is_completed' => $nowCompleted,
            'completed_by' => $nowCompleted ? Auth::id() : null,
            'completed_at' => $nowCompleted ? now() : null,
        ]);

        // Actualiza status da tarefa sempre (marcar E desmarcar afecta progresso)
        $this->checkAutoComplete($task);

        return back();
    }

    // POST /tarefas/{task}/checklist/{item}/validar
    public function validateChecklistItem(Request $request, Task $task, TaskChecklistItem $item)
    {
        abort_unless($item->task_id === $task->id, 403);

        $data = $request->validate([
            'action'           => 'required|in:aprovado,rejeitado',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        if ($data['action'] === 'aprovado') {
            $item->update([
                'validation_status' => 'aprovado',
                'is_completed'      => true,
                'completed_by'      => Auth::id(),
                'completed_at'      => now(),
                'validated_by'      => Auth::id(),
                'validated_at'      => now(),
                'rejection_reason'  => null,
            ]);
            $this->checkAutoComplete($task);
        } else {
            $item->update([
                'validation_status' => 'rejeitado',
                'is_completed'      => false,
                'validated_by'      => Auth::id(),
                'validated_at'      => now(),
                'rejection_reason'  => $data['rejection_reason'],
            ]);
            // Rejeição pode ter baixado o progresso (ex: já estava aprovado antes)
            $this->checkAutoComplete($task);
        }

        return back()->with('message', $data['action'] === 'aprovado' ? 'Item aprovado.' : 'Item rejeitado.');
    }

    /**
     * Actualiza o estado da tarefa com base no progresso do checklist:
     *   0 concluídos      → pending
     *   alguns concluídos → in_progress
     *   todos concluídos  → completed
     * Se não houver checklist, não altera o estado.
     */
    private function checkAutoComplete(Task $task): void
    {
        // Recarregar contagens directamente da BD para evitar cache de relações
        $total     = $task->checklistItems()->count();
        $completed = $task->checklistItems()->where('is_completed', true)->count();

        if ($total === 0) return; // sem checklist, não interfere

        if ($completed === 0) {
            // Nenhum item concluído → pendente
            if ($task->status !== 'pending') {
                $task->update(['status' => 'pending']);
            }
        } elseif ($completed < $total) {
            // Parcialmente concluído → em progresso
            if ($task->status !== 'in_progress') {
                $task->update(['status' => 'in_progress']);
            }
        } else {
            // Todos concluídos → concluída
            if ($task->status !== 'completed') {
                $task->update(['status' => 'completed']);
                if ($task->isRecurring()) {
                    $task->createNextOccurrence();
                }
            }
        }
    }

    private function notifyChecklistValidation(Task $task, TaskChecklistItem $item): void
    {
        $recipients = collect([$task->created_by, $task->assigned_to])
            ->filter()
            ->unique()
            ->reject(fn($id) => $id === Auth::id())
            ->values();

        if ($recipients->isEmpty()) return;

        $notif = SystemNotification::create([
            'organization_id' => $task->organization_id ?? 1,
            'type'            => 'checklist_validation',
            'title'           => 'Item de checklist aguarda validação',
            'message'         => "O item \"{$item->title}\" na tarefa \"{$task->title}\" aguarda validação.",
            'notifiable_type' => TaskChecklistItem::class,
            'notifiable_id'   => $item->id,
            'action_url'      => "/tarefas/{$task->id}",
            'priority'        => 'normal',
        ]);

        foreach ($recipients as $userId) {
            NotificationRecipient::create([
                'system_notification_id' => $notif->id,
                'user_id'                => $userId,
            ]);
        }
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
