<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'organization_id','reference','title','tema','department','description',
        'status','public_status','priority','origin','ticket_type',
        'contact_id','created_by','assigned_to',
        'service_area_id','team_id','project_id',
        'validation_status','cancellation_reason',
        'resolved_at','closed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at'   => 'datetime',
    ];

    public const STATUSES = [
        'aberto','em_analise','em_progresso','com_tarefas',
        'aguarda_resposta','resolvido','encerrado','cancelado',
    ];

    public const STATUS_LABELS = [
        'aberto'           => 'Aberto',
        'em_analise'       => 'Em análise',
        'em_progresso'     => 'Em progresso',
        'com_tarefas'      => 'Com tarefas',
        'aguarda_resposta' => 'Aguarda resposta',
        'resolvido'        => 'Resolvido',
        'encerrado'        => 'Encerrado',
        'cancelado'        => 'Cancelado',
    ];

    public const PRIORITIES = ['baixa','normal','alta','urgente'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($ticket) {
            if (empty($ticket->reference)) {
                $year  = date('Y');
                $count = static::whereYear('created_at', $year)->count() + 1;
                $ticket->reference = 'JFD-' . $year . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
            }
            // Log creation in history
            static::created(function ($t) {
                $t->statusHistory()->create([
                    'user_id'     => auth()->id(),
                    'event_type'  => 'criado',
                    'from_status' => null,
                    'to_status'   => $t->status,
                    'note'        => 'Pedido criado.',
                ]);
                $t->statusHistory()->create([
                    'user_id'     => auth()->id(),
                    'event_type'  => 'estado',
                    'from_status' => null,
                    'to_status'   => $t->status,
                    'note'        => 'Estado inicial do pedido.',
                ]);
            });
        });
    }

    public function organization() { return $this->belongsTo(Organization::class); }
    public function contact()      { return $this->belongsTo(Contact::class); }
    public function creator()      { return $this->belongsTo(User::class, 'created_by'); }
    public function assignee()     { return $this->belongsTo(User::class, 'assigned_to'); }
    public function serviceArea()  { return $this->belongsTo(ServiceArea::class); }
    /** @deprecated Use teams() M2M. team_id mantido para retrocompatibilidade. */
    public function team()         { return $this->belongsTo(Team::class); }
    /** Equipas atribuídas a este pedido (M2M) */
    public function teams()        { return $this->belongsToMany(Team::class, 'ticket_teams')->withPivot('assigned_by','assigned_at')->withTimestamps(); }
    public function project()      { return $this->belongsTo(OperationalPlan::class, 'project_id'); }
    public function comments()     { return $this->hasMany(TicketComment::class)->orderBy('created_at'); }
    public function attachments()  { return $this->morphMany(Attachment::class, 'attachable'); }
    public function tasks()        { return $this->hasMany(Task::class); }
    public function statusHistory(){ return $this->hasMany(TicketStatusHistory::class)->orderByDesc('created_at'); }
}
