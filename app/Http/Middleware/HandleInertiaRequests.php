<?php

namespace App\Http\Middleware;

use App\Models\ConversationParticipant;
use App\Models\NotificationRecipient;
use App\Models\Organization;
use App\Models\RolePermission;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $user = $request->user();
        $org  = $user ? Organization::find(1) : null;

        return [
            ...parent::share($request),

            'auth' => ['user' => $user],

            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error'   => fn () => $request->session()->get('error'),
            ],

            // Dados da instituicao partilhados globalmente
            'organization' => fn () => $org ? [
                'name'            => $org->name,
                'logo'            => $org->logo           ? Storage::disk('public')->url($org->logo)           : null,
                'logo_secondary'  => $org->logo_secondary ? Storage::disk('public')->url($org->logo_secondary) : null,
                'primary_color'   => $org->primary_color   ?? '#4f46e5',
                'accent_color'    => $org->accent_color    ?? '#7c3aed',
                'sidebar_color'   => $org->sidebar_color   ?? '#0f172a',
                'header_color'    => $org->header_color    ?? '#ffffff',
                'page_bg_color'   => $org->page_bg_color   ?? '#f9fafb',
                'card_bg_color'   => $org->card_bg_color   ?? '#ffffff',
                'heading_color'   => $org->heading_color   ?? '#111827',
                'text_color'      => $org->text_color      ?? '#374151',
                'menu_text_color' => $org->menu_text_color ?? '#94a3b8',
            ] : null,

            // Permissoes do utilizador (null = admin, acesso total)
            'userPermissions' => fn () => $user && $user->role !== 'admin'
                ? RolePermission::where('organization_id', 1)
                    ->where('role', $user->role)
                    ->get(['module', 'can_view', 'can_edit', 'can_delete'])
                    ->keyBy('module')
                    ->map(fn ($r) => [
                        'can_view'   => (bool) $r->can_view,
                        'can_edit'   => (bool) $r->can_edit,
                        'can_delete' => (bool) $r->can_delete,
                    ])
                : null,

            'unreadNotifications' => fn () => $user
                ? NotificationRecipient::where('user_id', $user->id)
                    ->whereNull('read_at')
                    ->count()
                : 0,

            'unreadMessages' => fn () => $user
                ? ConversationParticipant::where('user_id', $user->id)
                    ->with(['conversation.messages' => function ($q) use ($user) {
                        $q->where('user_id', '!=', $user->id)->whereNull('deleted_at');
                    }])
                    ->get()
                    ->sum(function ($cp) {
                        return $cp->conversation
                            ? $cp->conversation->messages
                                ->filter(fn ($m) =>
                                    !$cp->last_read_at ||
                                    Carbon::parse($m->created_at)->gt($cp->last_read_at)
                                )
                                ->count()
                            : 0;
                    })
                : 0,
        ];
    }
}
