<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConversationController extends Controller
{
    // ── Lista de conversas ────────────────────────────────────────────────────
    public function index()
    {
        $user   = Auth::user();
        $userId = $user->id;
        $isAdmin = $user->role === 'admin';

        $query = Conversation::with([
            'participants',
            'participantRecords',
            'latestMessage.user',
            'latestMessage.attachments',
        ])->orderByDesc('last_message_at');

        if (!$isAdmin) {
            $query->whereHas('participants', fn($q) => $q->where('user_id', $userId));
        }

        $conversations = $query->get()
            ->map(fn($c) => $this->formatConversation($c, $userId, $isAdmin));

        $users = User::where('is_active', true)
            ->where('id', '!=', $userId)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'avatar']);

        return Inertia::render('Chat/Index', [
            'conversations'   => $conversations,
            'users'           => $users,
            'activeId'        => null,
            'isAdmin'         => $isAdmin,
        ]);
    }

    // ── Abrir conversa ────────────────────────────────────────────────────────
    public function show(Conversation $conversation)
    {
        $user    = Auth::user();
        $userId  = $user->id;
        $isAdmin = $user->role === 'admin';
        $isParticipant = $conversation->participants()->where('user_id', $userId)->exists();

        // Admins podem ver qualquer conversa; outros só as suas
        abort_unless($isParticipant || $isAdmin, 403);

        // Marcar como lido (só se for participante)
        if ($isParticipant) {
            $conversation->participantRecords()
                ->where('user_id', $userId)
                ->update(['last_read_at' => now()]);
        }

        // Mensagens (últimas 100)
        $messages = $conversation->messages()
            ->with(['user', 'attachments', 'parent.user', 'linkedTask', 'linkedTicket'])
            ->latest()
            ->limit(100)
            ->get()
            ->reverse()
            ->values();

        // Lista de conversas (sidebar)
        $convQuery = Conversation::with(['participants', 'participantRecords', 'latestMessage.user', 'latestMessage.attachments'])
            ->orderByDesc('last_message_at');

        if (!$isAdmin) {
            $convQuery->whereHas('participants', fn($q) => $q->where('user_id', $userId));
        }

        $conversations = $convQuery->get()
            ->map(fn($c) => $this->formatConversation($c, $userId, $isAdmin));

        $users = User::where('is_active', true)
            ->where('id', '!=', $userId)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'avatar']);

        return Inertia::render('Chat/Index', [
            'conversations'      => $conversations,
            'users'              => $users,
            'activeId'           => $conversation->id,
            'activeConversation' => $this->formatConversation($conversation->load('participants', 'participantRecords'), $userId, $isAdmin),
            'messages'           => $messages,
            'isAdmin'            => $isAdmin,
        ]);
    }

    // ── Criar conversa ────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'type'       => 'required|in:direct,group',
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'name'       => 'nullable|string|max:100',
            'avatar_color' => 'nullable|string|max:7',
        ]);

        $userId  = Auth::id();
        $userIds = array_unique(array_merge([$userId], $request->user_ids));

        // Para direct: verificar se já existe
        if ($request->type === 'direct' && count($userIds) === 2) {
            $other = collect($userIds)->firstWhere(fn($id) => $id !== $userId);
            $existing = Conversation::where('type', 'direct')
                ->whereHas('participants', fn($q) => $q->where('user_id', $userId))
                ->whereHas('participants', fn($q) => $q->where('user_id', $other))
                ->whereHas('participantRecords', fn($q) => $q->selectRaw('count(*) = 2'))
                ->first();

            if ($existing) {
                return redirect("/chat/{$existing->id}");
            }
        }

        DB::transaction(function () use ($request, $userIds, $userId, &$conversation) {
            $conversation = Conversation::create([
                'organization_id' => 1,
                'type'            => $request->type,
                'name'            => $request->type === 'group' ? ($request->name ?? 'Novo grupo') : null,
                'avatar_color'    => $request->avatar_color ?? '#6366f1',
                'created_by'      => $userId,
                'last_message_at' => now(),
            ]);

            foreach ($userIds as $uid) {
                ConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'user_id'         => $uid,
                    'is_admin'        => $uid === $userId,
                    'joined_at'       => now(),
                ]);
            }

            // Mensagem de sistema
            Message::create([
                'conversation_id' => $conversation->id,
                'user_id'         => $userId,
                'body'            => $request->type === 'group'
                    ? 'Grupo criado'
                    : 'Conversa iniciada',
                'type'            => 'system',
            ]);
        });

        return redirect("/chat/{$conversation->id}");
    }

    // ── Actualizar grupo ──────────────────────────────────────────────────────
    public function update(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->type === 'group', 400);
        $request->validate([
            'name'         => 'sometimes|string|max:100',
            'avatar_color' => 'sometimes|string|max:7',
            'add_users'    => 'nullable|array',
            'add_users.*'  => 'exists:users,id',
            'remove_users' => 'nullable|array',
            'remove_users.*' => 'exists:users,id',
        ]);

        $conversation->update($request->only('name', 'avatar_color'));

        foreach ($request->add_users ?? [] as $uid) {
            ConversationParticipant::firstOrCreate([
                'conversation_id' => $conversation->id,
                'user_id'         => $uid,
            ], ['joined_at' => now()]);
        }

        if ($request->remove_users) {
            $conversation->participantRecords()
                ->whereIn('user_id', $request->remove_users)
                ->delete();
        }

        return back()->with('message', 'Grupo actualizado.');
    }

    // ── Apagar grupo ──────────────────────────────────────────────────────────
    public function destroy(Conversation $conversation)
    {
        abort_unless($conversation->type === 'group', 400);

        // Só o criador ou admins da conversa podem apagar
        $userId = Auth::id();
        $isAdmin = $conversation->participantRecords()
            ->where('user_id', $userId)
            ->where('is_admin', true)
            ->exists();

        abort_unless($isAdmin || $conversation->created_by === $userId, 403);

        // Apagar anexos do storage
        foreach ($conversation->messages as $msg) {
            foreach ($msg->attachments as $att) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($att->path);
            }
        }

        $conversation->delete();

        return redirect('/chat')->with('message', 'Grupo apagado.');
    }

    // ── Enviar mensagem ───────────────────────────────────────────────────────
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $userId = Auth::id();
        abort_unless($conversation->participants()->where('user_id', $userId)->exists(), 403);

        $request->validate([
            'body'              => 'nullable|string|max:4000',
            'type'              => 'in:text,image,file,audio',
            'parent_message_id' => 'nullable|exists:messages,id',
            'files'             => 'nullable|array',
            'files.*'           => 'file|max:51200', // 50 MB
        ]);

        abort_if(!$request->body && !$request->hasFile('files'), 422);

        $type = $request->type ?? 'text';
        if ($request->hasFile('files')) {
            $first = $request->file('files')[0];
            $mime  = $first->getMimeType();
            $type  = match(true) {
                str_starts_with($mime, 'image/') => 'image',
                str_starts_with($mime, 'audio/') => 'audio',
                default                          => 'file',
            };
            if (count($request->file('files')) > 1) $type = 'file';
        }

        DB::transaction(function () use ($request, $conversation, $userId, $type, &$message) {
            $message = Message::create([
                'conversation_id'   => $conversation->id,
                'user_id'           => $userId,
                'body'              => $request->body,
                'type'              => $type,
                'parent_message_id' => $request->parent_message_id,
            ]);

            foreach ($request->file('files') ?? [] as $file) {
                $path = $file->store("chat/{$conversation->id}", 'public');
                MessageAttachment::create([
                    'message_id'    => $message->id,
                    'original_name' => $file->getClientOriginalName(),
                    'filename'      => basename($path),
                    'mime_type'     => $file->getMimeType(),
                    'size'          => $file->getSize(),
                    'path'          => $path,
                ]);
            }

            $conversation->update(['last_message_at' => now()]);
        });

        $message->load(['user', 'attachments', 'parent.user']);

        return response()->json($message);
    }

    // ── Buscar novas mensagens (polling) ──────────────────────────────────────
    public function poll(Request $request, Conversation $conversation)
    {
        $user          = Auth::user();
        $userId        = $user->id;
        $isAdmin       = $user->role === 'admin';
        $isParticipant = $conversation->participants()->where('user_id', $userId)->exists();

        abort_unless($isParticipant || $isAdmin, 403);

        $since = $request->since; // timestamp ISO

        $messages = $conversation->messages()
            ->with(['user', 'attachments', 'parent.user', 'linkedTask', 'linkedTicket'])
            ->when($since, fn($q) => $q->where('created_at', '>', $since))
            ->orderBy('created_at')
            ->get();

        // Só marca como lido se for participante (admin observador não marca)
        if ($isParticipant) {
            $conversation->participantRecords()
                ->where('user_id', $userId)
                ->update(['last_read_at' => now()]);
        }

        return response()->json([
            'messages' => $messages,
            'unread'   => $user->unreadMessagesCount(),
        ]);
    }

    // ── Apagar mensagem ───────────────────────────────────────────────────────
    public function destroyMessage(Conversation $conversation, Message $message)
    {
        abort_unless($message->user_id === Auth::id(), 403);
        $message->delete();
        return response()->json(['ok' => true]);
    }

    // ── Criar tarefa a partir de mensagem ─────────────────────────────────────
    public function messageToTask(Request $request, Conversation $conversation, Message $message)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'priority'   => 'in:low,medium,high',
            'due_date'   => 'nullable|date',
            'assigned_to'=> 'nullable|exists:users,id',
        ]);

        $task = Task::create([
            'organization_id' => 1,
            'title'           => $request->title,
            'description'     => $message->body,
            'status'          => 'pending',
            'priority'        => $request->priority ?? 'medium',
            'due_date'        => $request->due_date,
            'assigned_to'     => $request->assigned_to,
            'created_by'      => Auth::id(),
            'origin'          => 'chat',
        ]);

        $message->update(['linked_task_id' => $task->id]);

        return response()->json(['task_id' => $task->id, 'task' => $task]);
    }

    // ── Criar pedido a partir de mensagem ─────────────────────────────────────
    public function messageToTicket(Request $request, Conversation $conversation, Message $message)
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'priority' => 'in:low,medium,high',
        ]);

        $year  = now()->year;
        $count = Ticket::whereYear('created_at', $year)->count() + 1;
        $ref   = 'JFD-' . $year . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);

        $ticket = Ticket::create([
            'organization_id' => 1,
            'reference'       => $ref,
            'title'           => $request->title,
            'description'     => $message->body,
            'status'          => 'open',
            'priority'        => $request->priority ?? 'medium',
            'created_by'      => Auth::id(),
            'origin'          => 'chat',
        ]);

        $message->update(['linked_ticket_id' => $ticket->id]);

        return response()->json(['ticket_id' => $ticket->id, 'ticket' => $ticket]);
    }

    // ── Subscrever push notifications ─────────────────────────────────────────
    public function subscribePush(Request $request)
    {
        $request->validate([
            'endpoint'   => 'required|url',
            'p256dh_key' => 'required|string',
            'auth_key'   => 'required|string',
        ]);

        Auth::user()->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'p256dh_key' => $request->p256dh_key,
                'auth_key'   => $request->auth_key,
                'user_agent' => $request->userAgent(),
            ]
        );

        return response()->json(['ok' => true]);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private function formatConversation(Conversation $c, int $userId, bool $isAdmin = false): array
    {
        $latest  = $c->latestMessage;
        $isParticipant = $c->participants->contains('id', $userId);
        $unread  = ($isParticipant) ? $c->unreadCount($userId) : 0;
        $others  = $isParticipant
            ? $c->participants->where('id', '!=', $userId)->values()
            : $c->participants->values();
        $display = $c->type === 'group'
            ? ($c->name ?? 'Grupo')
            : ($others->first()?->name ?? 'Conversa');

        return [
            'id'           => $c->id,
            'type'         => $c->type,
            'name'         => $display,
            'avatar_color' => $c->avatar_color,
            'participants' => $c->participants->map(fn($u) => [
                'id'       => $u->id,
                'name'   => $u->name,
                'avatar' => $u->avatar,
            ]),
            'others'         => $others->map(fn($u) => ['id' => $u->id, 'name' => $u->name, 'avatar' => $u->avatar]),
            'latest_message' => $latest ? [
                'body'       => $latest->deleted_at ? '🗑 Mensagem apagada' : ($latest->body ?? '📎 Anexo'),
                'type'       => $latest->type,
                'user_name'  => $latest->user?->name,
                'created_at' => $latest->created_at,
            ] : null,
            'unread_count'    => $unread,
            'last_message_at' => $c->last_message_at,
            'is_observer'     => $isAdmin && !$isParticipant,
        ];
    }
}
