<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'organization_id','inventory_category_id','name','reference','description',
        'item_type','unit','current_stock','min_stock','location','is_active',
        'serial_number','purchase_date','purchase_price','condition',
    ];

    protected $casts = [
        'current_stock'  => 'float',
        'min_stock'      => 'float',
        'is_active'      => 'boolean',
        'purchase_date'  => 'date',
        'purchase_price' => 'decimal:2',
    ];

    // item_type: consumivel | reutilizavel | equipamento
    public function isConsumivel(): bool  { return $this->item_type === 'consumivel'; }
    public function isReutilizavel(): bool { return $this->item_type === 'reutilizavel'; }
    public function isEquipamento(): bool  { return $this->item_type === 'equipamento'; }
    public function isLowStock(): bool     { return $this->current_stock <= $this->min_stock; }

    public function organization() { return $this->belongsTo(Organization::class); }
    public function category()     { return $this->belongsTo(InventoryCategory::class, 'inventory_category_id'); }
    public function movements()    { return $this->hasMany(InventoryMovement::class); }
    public function taskUsages()   { return $this->hasMany(TaskMaterial::class, 'inventory_item_id'); }
    public function allocations()  { return $this->hasMany(MaterialAllocation::class, 'inventory_item_id'); }

    /** Alocações activas (reutilizável em uso) */
    public function activeAllocations()
    {
        return $this->hasMany(MaterialAllocation::class, 'inventory_item_id')
                    ->where('status', 'em_uso');
    }
}
