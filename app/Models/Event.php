<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'organization_id','space_id','space_reservation_id','plan_id','created_by',
        'title','description','starts_at','ends_at','all_day','type','visibility','color','location'
    ];
    protected $casts = ['starts_at' => 'datetime','ends_at' => 'datetime','all_day' => 'boolean'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function space()        { return $this->belongsTo(Space::class); }
    public function reservation()  { return $this->belongsTo(SpaceReservation::class, 'space_reservation_id'); }
    public function plan()         { return $this->belongsTo(OperationalPlan::class, 'plan_id'); }
    public function creator()      { return $this->belongsTo(User::class, 'created_by'); }
    public function tasks()        { return $this->hasMany(Task::class); }
    public function participants() { return $this->hasMany(EventParticipant::class); }
}
