<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Maintenance extends Model
{
    protected $fillable = [
        'organization_id','space_id','title','description','type','status','priority',
        'assigned_team_id','assigned_to','created_by',
        'scheduled_at','completed_at','estimated_cost','actual_cost','notes',
    ];

    protected $casts = [
        'scheduled_at'  => 'datetime',
        'completed_at'  => 'datetime',
        'estimated_cost'=> 'decimal:2',
        'actual_cost'   => 'decimal:2',
    ];

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function assignedTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'assigned_team_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'maintenance_tasks', 'maintenance_id', 'task_id');
    }
}
