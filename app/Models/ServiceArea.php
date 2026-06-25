<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceArea extends Model
{
    protected $fillable = ['organization_id','name','slug','description','color','icon','is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function users()        { return $this->belongsToMany(User::class, 'service_area_user'); }
    public function tickets()      { return $this->hasMany(Ticket::class); }
    public function tasks()        { return $this->hasMany(Task::class); }
    /** Equipas associadas a esta área funcional */
    public function teams()        { return $this->belongsToMany(Team::class, 'service_area_team'); }
}
