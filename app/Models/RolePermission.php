<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    protected $fillable = [
        'organization_id', 'role', 'module',
        'can_view', 'can_edit', 'can_delete',
    ];

    protected $casts = [
        'can_view'   => 'boolean',
        'can_edit'   => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Módulos disponíveis no sistema.
     */
    public static function modules(): array
    {
        return [
            'dashboard'   => 'Dashboard',
            'tarefas'     => 'Tarefas',
            'tickets'     => 'Pedidos / Tickets',
            'agenda'      => 'Agenda',
            'planeamento' => 'Planeamento',
            'documentos'  => 'Documentos',
            'inventario'  => 'Inventário',
            'pessoas'     => 'Pessoas',
            'entidades'   => 'Entidades',
            'equipas'     => 'Equipas',
            'relatorios'  => 'Relatórios',
            'chat'        => 'Chat',
        ];
    }

    /**
     * Perfis configuráveis (admin é sempre total e não editável).
     */
    public static function configurableRoles(): array
    {
        return ['executivo', 'administrativo', 'operacional'];
    }

    /**
     * Carrega a matriz completa de permissões para a organização,
     * preenchendo valores por omissão onde não existem registos.
     */
    public static function matrix(int $orgId = 1): array
    {
        $rows = self::where('organization_id', $orgId)->get()
            ->keyBy(fn ($r) => "{$r->role}:{$r->module}");

        $defaults = [
            'executivo'      => ['can_view' => true,  'can_edit' => true,  'can_delete' => false],
            'administrativo' => ['can_view' => true,  'can_edit' => true,  'can_delete' => false],
            'operacional'    => ['can_view' => true,  'can_edit' => false, 'can_delete' => false],
        ];

        $matrix = [];
        foreach (self::configurableRoles() as $role) {
            foreach (array_keys(self::modules()) as $module) {
                $key = "{$role}:{$module}";
                $row = $rows[$key] ?? null;
                $matrix[$role][$module] = [
                    'can_view'   => $row ? $row->can_view   : ($defaults[$role]['can_view']   ?? true),
                    'can_edit'   => $row ? $row->can_edit   : ($defaults[$role]['can_edit']   ?? false),
                    'can_delete' => $row ? $row->can_delete : ($defaults[$role]['can_delete'] ?? false),
                ];
            }
        }

        return $matrix;
    }
}
