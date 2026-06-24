<?php

namespace App\Services;

use App\Models\PermissionAction;
use App\Models\PermissionGrant;
use App\Models\Role;
use App\Models\User;

class PermissionService
{
    /**
     * Verifica se $user pode executar $actionKey.
     *
     * Camada 1 — Hierarquia de perfil:
     *   nível do perfil do utilizador >= nível mínimo da acção → autorizado
     *
     * Camada 2 — Delegação ad-hoc:
     *   existe um PermissionGrant activo para este utilizador + acção + âmbito → autorizado
     *
     * @param  User        $user
     * @param  string      $actionKey   ex: 'hr.ausencia.aprovar'
     * @param  string|null $scopeType   'global'|'department'|'contact'|'self'
     * @param  int|null    $scopeId     id do dept / contact (null para global/self)
     * @return bool
     */
    public function can(User $user, string $actionKey, ?string $scopeType = null, ?int $scopeId = null): bool
    {
        // ── Camada 1: hierarquia de perfil ──────────────────────────────────
        $userLevel   = Role::levelOf($user->role ?? 'operacional');
        $action      = PermissionAction::where('key', $actionKey)->first();
        $minLevel    = $action?->min_level ?? 100; // acção desconhecida → só admin

        if ($userLevel >= $minLevel) {
            return true;
        }

        // ── Camada 2: delegações ad-hoc ─────────────────────────────────────
        return PermissionGrant::where('user_id', $user->id)
            ->where('action_key', $actionKey)
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->where(function ($q) use ($scopeType, $scopeId) {
                // Grant global aplica-se sempre
                $q->where('scope_type', 'global');

                // Grant de âmbito coincidente
                if ($scopeType && $scopeType !== 'global') {
                    $q->orWhere(fn ($q2) => $q2
                        ->where('scope_type', $scopeType)
                        ->where(fn ($q3) => $q3
                            ->whereNull('scope_id')
                            ->orWhere('scope_id', $scopeId)
                        )
                    );
                }
            })
            ->exists();
    }

    /**
     * Versão estática para uso em controllers sem injectar o service.
     */
    public static function check(User $user, string $actionKey, ?string $scopeType = null, ?int $scopeId = null): bool
    {
        return (new self)->can($user, $actionKey, $scopeType, $scopeId);
    }

    /**
     * Devolve o nível do utilizador autenticado.
     */
    public static function myLevel(): int
    {
        return Role::levelOf(auth()->user()?->role ?? 'operacional');
    }

    /**
     * O utilizador pode delegar uma acção com nível $targetLevel?
     * Regra: só pode delegar acções cujo nível mínimo seja INFERIOR ao seu.
     */
    public static function canDelegate(User $granter, string $actionKey): bool
    {
        $action = PermissionAction::where('key', $actionKey)->first();
        if (!$action) return false;

        $granterLevel = Role::levelOf($granter->role ?? 'operacional');
        // Pode delegar acções de nível abaixo do seu
        return $granterLevel > $action->min_level;
    }
}
