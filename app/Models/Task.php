<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id','title','description','status','priority',
        'assigned_to','created_by','due_date','origin',
        'ticket_id','space_reservation_id','event_id','service_area_id',
        'team_id','plan_id','maintenance_id',
        'validation_status','validated_by','validated_at','rejection_reason',
        // Recorrência
        'recurrence','recurrence_ends_at','parent_task_id','occurrence_number',
    ];

    protected $casts = [
        'due_date'           => 'datetime',
        'validated_at'       => 'datetime',
        'recurrence_ends_at' => 'date',
    ];

    const RECURRENCES = ['nenhuma', 'diária', 'semanal', 'quinzenal', 'mensal', 'anual'];

    public const STATUS_PENDING     = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED   = 'completed';
    public const STATUS_CANCELLED   = 'cancelled';

    public const PRIORITY_LOW    = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH   = 'high';

    public const VALIDATION_NA       = 'nao_aplicavel';
    public const VALIDATION_PENDING  = 'pendente';
    public const VALIDATION_APPROVED = 'validado';
    public const VALIDATION_REJECTED = 'rejeitado';

    // ── relações ──────────────────────────────────────────────────────────────
    public function organization() { return $this->belongsTo(Organization::class); }
    public function assignee()     { return $this->belongsTo(User::class, 'assigned_to'); }
    public function creator()      { return $this->belongsTo(User::class, 'created_by'); }
    public function ticket()       { return $this->belongsTo(Ticket::class); }
    public function reservation()  { return $this->belongsTo(SpaceReservation::class, 'space_reservation_id'); }
    public function event()        { return $this->belongsTo(Event::class); }
    public function serviceArea()  { return $this->belongsTo(ServiceArea::class); }
    public function team()         { return $this->belongsTo(Team::class); }
    public function plan()         { return $this->belongsTo(OperationalPlan::class, 'plan_id'); }
    public function maintenance()  { return $this->belongsTo(Maintenance::class); }
    public function validator()    { return $this->belongsTo(User::class, 'validated_by'); }
    public function materials()    { return $this->hasMany(TaskMaterial::class); }
    public function allocations()  { return $this->hasMany(MaterialAllocation::class); }
    public function checklistItems() { return $this->hasMany(TaskChecklistItem::class)->orderBy('sort_order')->orderBy('id'); }

    // Série de recorrência
    public function parentTask()    { return $this->belongsTo(Task::class, 'parent_task_id'); }
    public function occurrences()   { return $this->hasMany(Task::class, 'parent_task_id')->orderBy('occurrence_number'); }

    // ── helpers de recorrência ────────────────────────────────────────────────
    public function isRecurring(): bool
    {
        return $this->recurrence && $this->recurrence !== 'nenhuma';
    }

    public function isSeriesRoot(): bool
    {
        return $this->isRecurring() && is_null($this->parent_task_id);
    }

    /** Calcula a próxima due_date com base no padrão de recorrência */
    public function nextDueDate(): ?Carbon
    {
        if (!$this->due_date || !$this->isRecurring()) return null;

        $next = $this->due_date->copy();

        return match ($this->recurrence) {
            'diária'     => $next->addDay(),
            'semanal'    => $next->addWeek(),
            'quinzenal'  => $next->addWeeks(2),
            'mensal'     => $next->addMonth(),
            'anual'      => $next->addYear(),
            default      => null,
        };
    }

    /** Cria a próxima ocorrência desta tarefa (chamado ao completar) */
    public function createNextOccurrence(): ?Task
    {
        if (!$this->isRecurring()) return null;

        $nextDue = $this->nextDueDate();
        if (!$nextDue) return null;

        // Verificar se a recorrência ainda não terminou
        if ($this->recurrence_ends_at && $nextDue->isAfter($this->recurrence_ends_at)) {
            return null;
        }

        $rootId    = $this->parent_task_id ?? $this->id;
        $nextOccurrence = $this->occurrence_number + 1;

        return Task::create([
            'organization_id'   => $this->organization_id,
            'title'             => $this->title,
            'description'       => $this->description,
            'status'            => 'pending',
            'priority'          => $this->priority,
            'assigned_to'       => $this->assigned_to,
            'created_by'        => $this->created_by,
            'team_id'           => $this->team_id,
            'plan_id'           => $this->plan_id,
            'service_area_id'   => $this->service_area_id,
            'origin'            => $this->origin,
            'due_date'          => $nextDue,
            'recurrence'        => $this->recurrence,
            'recurrence_ends_at'=> $this->recurrence_ends_at,
            'parent_task_id'    => $rootId,
            'occurrence_number' => $nextOccurrence,
            'validation_status' => 'nao_aplicavel',
        ]);
    }
}
