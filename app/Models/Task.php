<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id','title','description','status','priority',
        'assigned_to','created_by','due_date','origin',
        'ticket_id','space_reservation_id','event_id','service_area_id',
        // ── novo ──
        'team_id','plan_id','maintenance_id',
        'validation_status','validated_by','validated_at','rejection_reason',
    ];

    protected $casts = [
        'due_date'     => 'datetime',
        'validated_at' => 'datetime',
    ];

    public const STATUS_PENDING     = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED   = 'completed';
    public const STATUS_CANCELLED   = 'cancelled';

    public const PRIORITY_LOW    = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH   = 'high';

    public const VALIDATION_NA       = 'nao_aplicavel';
    public const VALIDATION_PENDING  = 'pendente';
    public const VALIDATION_APPROVED = 'validado';
    public const VALIDATION_REJECTED = 'rejeitado';

    // ── relações existentes ──
    public function organization() { return $this->belongsTo(Organization::class); }
    public function assignee()     { return $this->belongsTo(User::class, 'assigned_to'); }
    public function creator()      { return $this->belongsTo(User::class, 'created_by'); }
    public function ticket()       { return $this->belongsTo(Ticket::class); }
    public function reservation()  { return $this->belongsTo(SpaceReservation::class, 'space_reservation_id'); }
    public function event()        { return $this->belongsTo(Event::class); }
    public function serviceArea()  { return $this->belongsTo(ServiceArea::class); }

    // ── novas relações ──
    public function team()         { return $this->belongsTo(Team::class); }
    public function plan()         { return $this->belongsTo(OperationalPlan::class, 'plan_id'); }
    public function maintenance()  { return $this->belongsTo(Maintenance::class); }
    public function validator()    { return $this->belongsTo(User::class, 'validated_by'); }
    public function materials()    { return $this->hasMany(TaskMaterial::class); }
    public function allocations()  { return $this->hasMany(MaterialAllocation::class); }
    public function checklistItems() { return $this->hasMany(TaskChecklistItem::class)->orderBy('sort_order')->orderBy('id'); }
}
