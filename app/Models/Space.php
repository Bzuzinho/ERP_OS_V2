<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Space extends Model
{
    protected $fillable = [
        'organization_id', 'name', 'type', 'description', 'capacity', 'location',
        'amenities', 'image', 'is_active', 'is_public',
        'responsible_user_id', 'responsible_team_id',
        'schedule', 'availability_exceptions', 'requirements', 'notes', 'color',
    ];

    protected $casts = [
        'amenities'               => 'array',
        'schedule'                => 'array',
        'availability_exceptions' => 'array',
        'is_active'               => 'boolean',
        'is_public'               => 'boolean',
    ];

    public function organization()    { return $this->belongsTo(Organization::class); }
    public function reservations()    { return $this->hasMany(SpaceReservation::class); }
    public function events()          { return $this->hasMany(Event::class); }
    public function responsibleUser() { return $this->belongsTo(User::class, 'responsible_user_id'); }
    public function responsibleTeam() { return $this->belongsTo(Team::class, 'responsible_team_id'); }
}
