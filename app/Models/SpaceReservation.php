<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpaceReservation extends Model
{
    protected $fillable = [
        'organization_id', 'plan_id', 'space_id', 'contact_id', 'user_id',
        'title', 'purpose', 'starts_at', 'ends_at', 'expected_attendees',
        'status', 'rejection_reason', 'reviewed_by', 'reviewed_at',
        'escalated_to_id', 'escalated_at', 'escalation_notes',
    ];

    protected $casts = [
        'starts_at'     => 'datetime',
        'ends_at'       => 'datetime',
        'reviewed_at'   => 'datetime',
        'escalated_at'  => 'datetime',
    ];

    public function organization()  { return $this->belongsTo(Organization::class); }
    public function plan()          { return $this->belongsTo(OperationalPlan::class); }
    public function space()         { return $this->belongsTo(Space::class); }
    public function contact()       { return $this->belongsTo(Contact::class); }
    public function user()          { return $this->belongsTo(User::class); }
    public function reviewer()      { return $this->belongsTo(User::class, 'reviewed_by'); }
    public function escalatedTo()   { return $this->belongsTo(User::class, 'escalated_to_id'); }
    public function event()         { return $this->hasOne(Event::class, 'space_reservation_id'); }
    public function tasks()         { return $this->hasMany(Task::class); }
}
