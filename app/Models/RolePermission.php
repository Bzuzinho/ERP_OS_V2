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
     * Perfis configuráveis — todos excepto admin.
     * Usa a tabela roles dinamicamente; fallback para slugs fixos.
     */
    public static function configurableRoles(): array
    {
        try {
            $slugs = Role::where('organization_id', 1)
                ->where('slug', '!=', 'admin')
                ->orderByDesc('level')
                ->pluck('slug')
                ->toArray();

            return $slugs ?: ['executivo', 'administrativo', 'operacional'];
        } catch (\Exception $e) {
            return ['executivo', 'administrativo', 'operacional'];
        }
    }

    /**
     * Matriz completa de permissões por perfil e módulo.
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
                $def = $defaults[$role] ?? ['can_view' => true, 'can_edit' => false, 'can_delete' => false];
                $matrix[$role][$module] = [
                    'can_view'   => $row ? (bool) $row->can_view   : $def['can_view'],
                    'can_edit'   => $row ? (bool) $row->can_edit   : $def['can_edit'],
                    'can_delete' => $row ? (bool) $row->can_delete : $def['can_delete'],
                ];
            }
        }

        return $matrix;
    }
}
