<?php

namespace App\Http\Middleware;

use App\Models\ConversationParticipant;
use App\Models\EmployeeAbsence;
use App\Models\NotificationRecipient;
use App\Models\Organization;
use App\Models\RolePermission;
use App\Models\TaskChecklistItem;
use App\Services\PermissionService;
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

            'auth' => fn () => [
                'user' => $user ? array_merge($user->toArray(), [
                    'contact_avatar_url' => $user->contact?->avatar_url,
                ]) : null,
            ],

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

            // Itens de checklist que aguardam validação do utilizador actual
            'pendingChecklistValidations' => fn () => $user
                ? TaskChecklistItem::where('validation_status', 'pendente')
                    ->whereHas('task', fn ($q) =>
                        $q->where('created_by', $user->id)
                          ->orWhere('assigned_to', $user->id)
                    )
                    ->with(['task:id,title'])
                    ->orderByDesc('updated_at')
                    ->take(10)
                    ->get()
                    ->map(fn ($item) => [
                        'id'      => $item->id,
                        'title'   => $item->title,
                        'task_id' => $item->task_id,
                        'task'    => $item->task?->title,
                    ])
                    ->values()
                : [],

            // Aprovações pendentes de registos RH — visíveis para quem tem permissão
            'pendingApprovals' => fn () => ($user && PermissionService::check($user, 'hr.ausencia.aprovar'))
                ? EmployeeAbsence::with(['contact:id,name'])
                    ->where('status', 'pendente')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(fn ($a) => [
                        'id'         => $a->id,
                        'contact_id' => $a->contact_id,
                        'person'     => $a->contact?->name,
                        'type'       => $a->type,
                        'start_date' => $a->start_date?->format('d/m/Y'),
                        'end_date'   => $a->end_date?->format('d/m/Y'),
                        'days'       => $a->days,
                        'notes'      => $a->notes,
                    ])
                : [],

            'vapidPublicKey' => config('vapid.public_key', ''),

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
