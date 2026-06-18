<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskMaterial extends Model
{
    protected $table = 'task_materials';

    protected $fillable = [
        'task_id','inventory_item_id','quantity','usage_type','notes',
    ];

    protected $casts = ['quantity' => 'decimal:3'];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
