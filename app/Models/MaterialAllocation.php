<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialAllocation extends Model
{
    protected $table = 'material_allocations';

    protected $fillable = [
        'inventory_item_id','allocated_to_type','allocated_to_id','allocated_to_name',
        'quantity','status','task_id','notes','allocated_at','returned_at','created_by',
    ];

    protected $casts = [
        'allocated_at' => 'datetime',
        'returned_at'  => 'datetime',
        'quantity'     => 'decimal:3',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Resolve o alocatário polimórfico (user | team | department) */
    public function getAllocateeAttribute(): ?string
    {
        if ($this->allocated_to_name) return $this->allocated_to_name;
        return match($this->allocated_to_type) {
            'user'       => User::find($this->allocated_to_id)?->name,
            'team'       => Team::find($this->allocated_to_id)?->name,
            'department' => Department::find($this->allocated_to_id)?->name,
            default      => null,
        };
    }
}
