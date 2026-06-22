<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketStatusHistory extends Model
{
    protected $table = 'ticket_status_history';
    protected $fillable = ['ticket_id','user_id','contact_id','event_type','from_status','to_status','note'];

    // event_type: criado | estado | tecnico | encaminhamento | tarefa_criada | anexo
    public function ticket()  { return $this->belongsTo(Ticket::class); }
    public function user()    { return $this->belongsTo(User::class); }
    public function contact() { return $this->belongsTo(Contact::class); }
}
