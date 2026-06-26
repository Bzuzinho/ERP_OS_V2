<?php

namespace App\Http\Controllers;

use App\Models\NotificationRecipient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $items = NotificationRecipient::with('notification')
            ->where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->paginate(30);

        $unread = NotificationRecipient::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $items,
            'unreadCount'   => $unread,
        ]);
    }

    public function markRead(NotificationRecipient $recipient)
    {
        abort_unless($recipient->user_id === auth()->id(), 403);
        $recipient->update(['read_at' => now()]);
        return back();
    }

    public function markAllRead()
    {
        $cleared = NotificationRecipient::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        return response()->json(['ok' => true, 'cleared' => $cleared]);
    }

    public function unreadCount()
    {
        $count = NotificationRecipient::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();
        return response()->json(['count' => $count]);
    }

    // Últimas 10 notificações não lidas para o dropdown do sino
    public function recentes()
    {
        $items = NotificationRecipient::with('notification')
            ->where('user_id', auth()->id())
            ->whereNull('read_at')
            ->orderByDesc('created_at')
            ->take(10)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'title'      => $r->notification?->title,
                'message'    => $r->notification?->message,
                'action_url' => $r->notification?->action_url,
                'type'       => $r->notification?->type,
                'created_at' => $r->created_at?->diffForHumans(),
            ]);

        return response()->json($items);
    }

    // Marcar uma notificação como lida via AJAX (sem redirect)
    public function markReadJson(NotificationRecipient $recipient)
    {
        abort_unless($recipient->user_id === auth()->id(), 403);
        $recipient->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }
}
