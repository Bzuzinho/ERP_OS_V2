<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Ticket extends Model
{
    protected $fillable = [
        'organization_id','reference','title','description','status','public_status',
        'priority','origin','source_type','contact_id','created_by','assigned_to',
        'service_area_id','project_id','team_id','resolved_at','closed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at'   => 'datetime',
    ];

    public const STATUSES = ['aberto','em_analise','em_progresso','aguarda_resposta','resolvido','encerrado'];
    public const PRIORITIES = ['baixa','normal','alta','urgente'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($ticket) {
            if (empty($ticket->reference)) {
                $ticket->reference = 'T-' . strtoupper(Str::random(6));
            }
        });
    }

    public function organization() { return $this->belongsTo(Organization::class); }
    public function contact() { return $this->belongsTo(Contact::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function serviceArea() { return $this->belongsTo(ServiceArea::class); }
    public function comments() { return $this->hasMany(TicketComment::class); }
    public function attachments() { return $this->morphMany(Attachment::class, 'attachable'); }
    public function tasks() { return $this->hasMany(Task::class); }
    public function statusHistory() { return $this->hasMany(TicketStatusHistory::class); }
    public function team() { return $this->belongsTo(Team::class); }
    public function project() { return $this->belongsTo(OperationalPlan::class, 'project_id'); }
}
