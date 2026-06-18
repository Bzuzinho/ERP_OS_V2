<?php

namespace App\Http\Middleware;

use App\Models\NotificationRecipient;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'unreadNotifications' => fn () => $request->user()
                ? NotificationRecipient::where('user_id', $request->user()->id)
                    ->whereNull('read_at')
                    ->count()
                : 0,
        ];
    }
}
