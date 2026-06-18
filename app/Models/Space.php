<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Space extends Model
{
    protected $fillable = ['organization_id','name','type','description','capacity','location','amenities','image','is_active','is_public'];
    protected $casts = ['amenities' => 'array','is_active' => 'boolean','is_public' => 'boolean'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function reservations() { return $this->hasMany(SpaceReservation::class); }
    public function events() { return $this->hasMany(Event::class); }
}
