<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    protected $fillable = ['organization_id','inventory_item_id','user_id','type','quantity','notes','occurred_at'];
    protected $casts = ['occurred_at' => 'datetime','quantity' => 'float'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function item() { return $this->belongsTo(InventoryItem::class, 'inventory_item_id'); }
    public function user() { return $this->belongsTo(User::class); }
}
