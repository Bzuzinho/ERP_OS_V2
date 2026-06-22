<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Conversation extends Model
{
    protected $fillable = [
        'organization_id', 'type', 'name', 'avatar_color',
        'created_by', 'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
                    ->withPivot('is_admin', 'last_read_at', 'joined_at');
    }

    public function participantRecords(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /** Nome a mostrar para um utilizador (para directs usa o nome do outro participante) */
    public function displayName(int $forUserId): string
    {
        if ($this->type === 'group') {
            return $this->name ?? 'Grupo';
        }
        $other = $this->participants->firstWhere('id', '!=', $forUserId);
        return $other?->name ?? 'Conversa';
    }

    /** Número de mensagens não lidas para um utilizador */
    public function unreadCount(int $userId): int
    {
        $participant = $this->participantRecords->firstWhere('user_id', $userId);
        if (!$participant) return 0;
        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->when($participant->last_read_at, fn($q) => $q->where('created_at', '>', $participant->last_read_at))
            ->count();
    }
}
