<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryCategory extends Model
{
    protected $fillable = ['organization_id','name','description'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function items() { return $this->hasMany(InventoryItem::class); }
}
