<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'conversation_id', 'user_id', 'body', 'type',
        'parent_message_id', 'is_edited',
        'linked_task_id', 'linked_ticket_id',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
    ];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo         { return $this->belongsTo(User::class); }
    public function parent(): BelongsTo       { return $this->belongsTo(Message::class, 'parent_message_id'); }
    public function replies(): HasMany        { return $this->hasMany(Message::class, 'parent_message_id'); }
    public function attachments(): HasMany    { return $this->hasMany(MessageAttachment::class); }
    public function linkedTask(): BelongsTo   { return $this->belongsTo(Task::class, 'linked_task_id'); }
    public function linkedTicket(): BelongsTo { return $this->belongsTo(Ticket::class, 'linked_ticket_id'); }
}
