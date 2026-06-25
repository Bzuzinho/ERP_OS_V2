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
        NotificationRecipient::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        return back()->with('message', 'Todas marcadas como lidas.');
    }

    public function unreadCount()
    {
        $count = NotificationRecipient::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();
        return response()->json(['count' => $count]);
    }
}
