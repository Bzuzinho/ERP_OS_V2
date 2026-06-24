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
        'organization_id','avatar','role','contact_id',
    ];

    protected $hidden = ['password','remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    public function organization() { return $this->belongsTo(Organization::class); }
    // Pessoa principal: users.contact_id → contacts.id
    public function contact() { return $this->belongsTo(Contact::class); }
    // Compat legado: employee ligado via user_id
    public function employee() { return $this->hasOne(Employee::class); }
    public function tasks() { return $this->hasMany(Task::class, 'assigned_to'); }
    public function assignedTickets() { return $this->hasMany(Ticket::class, 'assigned_to'); }
    public function serviceAreas() { return $this->belongsToMany(ServiceArea::class, 'service_area_user'); }
    public function notificationRecipients() { return $this->hasMany(NotificationRecipient::class); }

    // Chat
    public function conversations() {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
                    ->withPivot('is_admin', 'last_read_at', 'joined_at');
    }
    public function messages() { return $this->hasMany(Message::class); }
    public function pushSubscriptions() { return $this->hasMany(PushSubscription::class); }

    public function unreadNotificationsCount(): int
    {
        return $this->notificationRecipients()->whereNull('read_at')->count();
    }

    public function unreadMessagesCount(): int
    {
        return Conversation::whereHas('participants', fn($q) => $q->where('user_id', $this->id))
            ->get()
            ->sum(fn($c) => $c->load(['participantRecords', 'messages'])->unreadCount($this->id));
    }
}
