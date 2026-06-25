<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskChecklistItem extends Model
{
    protected $fillable = [
        'task_id','title','is_completed','completed_by','completed_at','sort_order',
        'requires_validation','validation_status','validated_by','validated_at','rejection_reason',
    ];

    protected $casts = [
        'is_completed'        => 'boolean',
        'requires_validation' => 'boolean',
        'completed_at'        => 'datetime',
        'validated_at'        => 'datetime',
    ];

    public function task()        { return $this->belongsTo(Task::class); }
    public function completedBy() { return $this->belongsTo(User::class, 'completed_by'); }
    public function validator()   { return $this->belongsTo(User::class, 'validated_by'); }
}
