<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name','email','password','phone','department','is_active',
        'organization_id','avatar','role',
    ];

    protected $hidden = ['password','remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function employee() { return $this->hasOne(Employee::class); }
    public function contact() { return $this->hasOne(Contact::class); }
    public function tasks() { return $this->hasMany(Task::class, 'assigned_to'); }
    public function assignedTickets() { return $this->hasMany(Ticket::class, 'assigned_to'); }
    public function serviceAreas() { return $this->belongsToMany(ServiceArea::class, 'service_area_user'); }
    public function notificationRecipients() { return $this->hasMany(NotificationRecipient::class); }

    public function unreadNotificationsCount(): int
    {
        return $this->notificationRecipients()->whereNull('read_at')->count();
    }
}
