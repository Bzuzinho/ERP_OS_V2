<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\PermissionAction;
use App\Models\PermissionGrant;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PermissionController extends Controller
{
    private function adminOnly(): void
    {
        abort_if(auth()->user()?->role !== 'admin', 403);
    }

    // ── Perfis (Roles) ───────────────────────────────────────────────────────

    public function storeRole(Request $request)
    {
        $this->adminOnly();

        $data = $request->validate([
            'name'  => 'required|string|max:60',
            'level' => 'required|integer|min:1|max:99', // 100 reservado para admin
            'color' => 'nullable|string|max:20',
        ]);

        $data['slug']            = Str::slug($data['name'], '_');
        $data['organization_id'] = 1;
        $data['is_system']       = false;

        // Garantir slug único
        $base = $data['slug'];
        $i    = 1;
        while (Role::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $base . '_' . $i++;
        }

        Role::create($data);
        return back()->with('message', 'Perfil criado.');
    }

    public function updateRole(Request $request, Role $role)
    {
        $this->adminOnly();
        abort_if($role->slug === 'admin' && $request->input('level') != 100, 403,
            'O perfil Admin não pode ter o nível alterado.');

        $data = $request->validate([
            'name'                       => 'required|string|max:60',
            'level'                      => 'required|integer|min:1|max:' . ($role->slug === 'admin' ? 100 : 99),
            'color'                      => 'nullable|string|max:20',
            'module_permissions'         => 'nullable|array',
            'module_permissions.*.can_view'   => 'boolean',
            'module_permissions.*.can_edit'   => 'boolean',
            'module_permissions.*.can_delete' => 'boolean',
        ]);

        $role->update([
            'name'  => $data['name'],
            'level' => $data['level'],
            'color' => $data['color'],
        ]);

        // Guardar permissões por módulo (só para perfis não-admin)
        if ($role->slug !== 'admin' && !empty($data['module_permissions'])) {
            foreach ($data['module_permissions'] as $module => $perms) {
                RolePermission::updateOrCreate(
                    ['organization_id' => 1, 'role' => $role->slug, 'module' => $module],
                    [
                        'can_view'   => (bool) ($perms['can_view']   ?? true),
                        'can_edit'   => (bool) ($perms['can_edit']   ?? false),
                        'can_delete' => (bool) ($perms['can_delete'] ?? false),
                    ]
                );
            }
        }

        return back()->with('message', 'Perfil actualizado.');
    }

    public function destroyRole(Role $role)
    {
        $this->adminOnly();
        abort_if($role->is_system, 403, 'Perfis de sistema não podem ser eliminados.');
        $role->delete();
        return back()->with('message', 'Perfil eliminado.');
    }

    // ── Acções (PermissionActions) ───────────────────────────────────────────

    public function updateAction(Request $request, PermissionAction $action)
    {
        $this->adminOnly();

        $data = $request->validate([
            'min_level' => 'required|integer|min:0|max:100',
        ]);

        $action->update($data);
        return back()->with('message', 'Nível mínimo actualizado.');
    }

    // ── Delegações ad-hoc (PermissionGrants) ────────────────────────────────

    public function storeGrant(Request $request)
    {
        $granter = auth()->user();

        $data = $request->validate([
            'user_id'    => 'required|exists:users,id',
            'action_key' => 'required|exists:permission_actions,key',
            'scope_type' => 'required|in:global,department,contact,self',
            'scope_id'   => 'nullable|integer',
            'expires_at' => 'nullable|date|after:today',
            'notes'      => 'nullable|string|max:500',
        ]);

        // Verificar que o concedente pode delegar esta acção
        abort_if(!PermissionService::canDelegate($granter, $data['action_key']), 403,
            'Não tens nível suficiente para delegar esta acção.');

        // Não pode delegar a alguém com nível >= ao seu
        $target      = User::find($data['user_id']);
        $granterLevel = \App\Models\Role::levelOf($granter->role);
        $targetLevel  = \App\Models\Role::levelOf($target->role);
        abort_if($targetLevel >= $granterLevel, 403,
            'Só podes delegar a utilizadores com nível inferior ao teu.');

        $data['granted_by']      = $granter->id;
        $data['organization_id'] = 1;
        $data['is_active']       = true;

        PermissionGrant::create($data);
        return back()->with('message', 'Delegação criada.');
    }

    public function updateGrant(Request $request, PermissionGrant $grant)
    {
        $granter = auth()->user();
        abort_if($grant->granted_by !== $granter->id && $granter->role !== 'admin', 403);

        $data = $request->validate([
            'expires_at' => 'nullable|date',
            'notes'      => 'nullable|string|max:500',
            'is_active'  => 'boolean',
        ]);

        $grant->update($data);
        return back()->with('message', 'Delegação actualizada.');
    }

    public function destroyGrant(PermissionGrant $grant)
    {
        $granter = auth()->user();
        abort_if($grant->granted_by !== $granter->id && $granter->role !== 'admin', 403);

        $grant->delete();
        return back()->with('message', 'Delegação removida.');
    }
}
