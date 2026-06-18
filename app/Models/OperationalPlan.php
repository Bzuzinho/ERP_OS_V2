<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationalPlan extends Model
{
    protected $fillable = [
        'organization_id','created_by','manager_id','service_area_id',
        'title','description','year','status','progress','budget',
        'planned_start','planned_end','starts_at','ends_at',
        'is_recurring','recurrence_pattern',
    ];

    protected $casts = [
        'planned_start' => 'date',
        'planned_end'   => 'date',
        'starts_at'     => 'date',
        'ends_at'       => 'date',
        'is_recurring'  => 'boolean',
        'progress'      => 'integer',
        'budget'        => 'decimal:2',
    ];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function creator()      { return $this->belongsTo(User::class, 'created_by'); }
    public function manager()      { return $this->belongsTo(User::class, 'manager_id'); }
    public function serviceArea()  { return $this->belongsTo(ServiceArea::class); }

    /** Tarefas ligadas via plan_id */
    public function tasks()        { return $this->hasMany(Task::class, 'plan_id'); }

    /** Pedidos agrupados neste projeto */
    public function tickets()      { return $this->hasMany(Ticket::class, 'project_id'); }

    /** Calcula progresso com base nas tarefas */
    public function computedProgress(): int
    {
        $total = $this->tasks()->count();
        if ($total === 0) return $this->progress ?? 0;
        $done = $this->tasks()->where('status', 'completed')->count();
        return (int) round(($done / $total) * 100);
    }
}
