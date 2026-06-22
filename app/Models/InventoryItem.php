<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'organization_id','inventory_category_id','supplier_id',
        'name','reference','barcode','description','subcategory',
        'item_type','unit',
        'current_stock','min_stock','max_stock',
        'location','is_active',
        'serial_number','purchase_date','purchase_price',
        'condition','quality_grade','quality_notes',
    ];

    protected $casts = [
        'current_stock'  => 'float',
        'min_stock'      => 'float',
        'max_stock'      => 'float',
        'is_active'      => 'boolean',
        'purchase_date'  => 'date',
        'purchase_price' => 'decimal:2',
    ];

    // item_type: consumivel | reutilizavel | equipamento | epi
    public function isConsumivel():   bool { return $this->item_type === 'consumivel'; }
    public function isReutilizavel(): bool { return $this->item_type === 'reutilizavel'; }
    public function isEquipamento():  bool { return $this->item_type === 'equipamento'; }
    public function isEpi():          bool { return $this->item_type === 'epi'; }

    public function isLowStock():     bool { return $this->current_stock <= $this->min_stock; }
    public function isOutOfStock():   bool { return $this->current_stock <= 0; }
    public function stockPercent():   float
    {
        if (!$this->max_stock) return 100;
        return min(100, round(($this->current_stock / $this->max_stock) * 100));
    }

    public function organization() { return $this->belongsTo(Organization::class); }
    public function category()     { return $this->belongsTo(InventoryCategory::class, 'inventory_category_id'); }
    public function supplier()     { return $this->belongsTo(Contact::class, 'supplier_id'); }
    public function movements()    { return $this->hasMany(InventoryMovement::class); }
    public function taskUsages()   { return $this->hasMany(TaskMaterial::class, 'inventory_item_id'); }
    public function allocations()  { return $this->hasMany(MaterialAllocation::class, 'inventory_item_id'); }
    public function loans()        { return $this->hasMany(MaterialLoan::class); }
    public function requisitions() { return $this->hasMany(MaterialRequisition::class); }

    public function activeLoans()
    {
        return $this->hasMany(MaterialLoan::class)->where('status', 'activo');
    }
    public function activeAllocations()
    {
        return $this->hasMany(MaterialAllocation::class, 'inventory_item_id')->where('status', 'em_uso');
    }
}
