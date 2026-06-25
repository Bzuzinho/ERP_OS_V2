<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Department;
use App\Models\Organization;
use App\Models\PermissionAction;
use App\Models\PermissionGrant;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\ServiceArea;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    // ── Páginas principais ─────────────────────────────────────────────────────
    public function index()
    {
        return Inertia::render('Settings/Index', array_merge($this->sharedData(), ['section' => 'geral']));
    }

    public function utilizadores()
    {
        return Inertia::render('Settings/Index', array_merge($this->sharedData(), ['section' => 'utilizadores']));
    }

    public function perfis()
    {
        // Perfis foram fundidos em Permissões — redireciona
        return redirect('/configuracoes/permissoes');
    }

    public function permissoes()
    {
        return Inertia::render('Settings/Permissions', $this->permissaoData());
    }

    private function permissaoData(): array
    {
        return [
            'permRoles'       => Role::where('organization_id', 1)->orderByDesc('level')->get(),
            'permActions'     => PermissionAction::where('organization_id', 1)->orderBy('module')->orderBy('label')->get(),
            'permGrants'      => PermissionGrant::with(['user:id,name,role', 'grantedBy:id,name'])
                ->where('organization_id', 1)
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get(),
            'allUsers'        => User::where('organization_id', 1)->orderBy('name')->get(['id', 'name', 'role']),
            'departments'     => Department::where('organization_id', 1)->orderBy('name')->get(['id', 'name']),
            // Matriz V/E/D por módulo (sistema antigo — agora integrado nos cards de perfil)
            'rolePermissions' => RolePermission::matrix(1),
            'modules'         => RolePermission::modules(),
        ];
    }

    private function sharedData(): array
    {
        $org = Organization::find(1);

        // Contacts sem conta de acesso (para dar acesso a novas pessoas)
        $pessoasWithoutUser = \App\Models\Contact::whereDoesntHave('user')
            ->where('organization_id', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'person_type_id']);

        return [
            'institution'        => $org,
            'users'              => User::with('contact:id,name,email,person_type_id,avatar')
                                        ->where('organization_id', 1)
                                        ->orderBy('name')
                                        ->get(['id','name','email','role','is_active','contact_id','created_at']),
            'pessoasWithoutUser' => $pessoasWithoutUser,
            'rolePermissions'    => RolePermission::matrix(1),
            'modules'            => RolePermission::modules(),
            'roles'              => RolePermission::configurableRoles(),
        ];
    }

    // ── Instituição ───────────────────────────────────────────────────────────
    public function updateInstitution(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:30',
            'address'     => 'nullable|string|max:255',
            'city'        => 'nullable|string|max:100',
            'district'    => 'nullable|string|max:100',
            'county'      => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'nif'         => 'nullable|string|max:20',
            'diggov_code' => 'nullable|string|max:50',
            'website'     => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            // Cores
            'primary_color'   => 'nullable|string|max:7',
            'accent_color'    => 'nullable|string|max:7',
            'sidebar_color'   => 'nullable|string|max:7',
            'header_color'    => 'nullable|string|max:7',
            'page_bg_color'   => 'nullable|string|max:7',
            'card_bg_color'   => 'nullable|string|max:7',
            'heading_color'   => 'nullable|string|max:7',
            'text_color'      => 'nullable|string|max:7',
            'menu_text_color' => 'nullable|string|max:7',
            // Logos
            'logo'          => 'nullable|image|max:2048',
            'logo_secondary'=> 'nullable|image|max:2048',
        ]);

        $org = Organization::findOrFail(1);

        // Campos de texto (excluindo logos — só actualizamos se houver ficheiro)
        $update = array_filter(
            $request->only([
                'name','email','phone','address','city','district','county',
                'postal_code','nif','diggov_code','website','description',
                'primary_color','accent_color',
                'sidebar_color','header_color','page_bg_color','card_bg_color',
                'heading_color','text_color','menu_text_color',
            ]),
            fn ($v) => $v !== null
        );

        // Upload logos
        if ($request->hasFile('logo')) {
            if ($org->logo) Storage::disk('public')->delete($org->logo);
            $update['logo'] = $request->file('logo')->store('organization', 'public');
        }
        if ($request->hasFile('logo_secondary')) {
            if ($org->logo_secondary) Storage::disk('public')->delete($org->logo_secondary);
            $update['logo_secondary'] = $request->file('logo_secondary')->store('organization', 'public');
        }

        $org->update($update);

        return back()->with('message', 'Dados da instituição atualizados.');
    }

    public function removeLogo(Request $request)
    {
        $request->validate(['field' => 'required|in:logo,logo_secondary']);
        $org = Organization::findOrFail(1);
        $field = $request->field;
        if ($org->$field) {
            Storage::disk('public')->delete($org->$field);
            $org->update([$field => null]);
        }
        return back()->with('message', 'Logótipo removido.');
    }

    // ── Permissões por perfil ─────────────────────────────────────────────────
    public function updatePermissions(Request $request)
    {
        $request->validate([
            'permissions'              => 'required|array',
            'permissions.*.role'       => 'required|string',
            'permissions.*.module'     => 'required|string',
            'permissions.*.can_view'   => 'boolean',
            'permissions.*.can_edit'   => 'boolean',
            'permissions.*.can_delete' => 'boolean',
        ]);

        foreach ($request->permissions as $perm) {
            RolePermission::updateOrCreate(
                [
                    'organization_id' => 1,
                    'role'            => $perm['role'],
                    'module'          => $perm['module'],
                ],
                [
                    'can_view'   => $perm['can_view']   ?? true,
                    'can_edit'   => $perm['can_edit']   ?? false,
                    'can_delete' => $perm['can_delete'] ?? false,
                ]
            );
        }

        return back()->with('message', 'Permissões atualizadas.');
    }

    // ── Utilizadores ──────────────────────────────────────────────────────────
    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'password'   => 'required|min:8',
            'role'       => 'required|in:admin,executivo,administrativo,operacional',
        ]);

        $contact = \App\Models\Contact::findOrFail($data['contact_id']);

        // Verificar que o contact ainda não tem conta
        if ($contact->user()->exists()) {
            return back()->withErrors(['error' => 'Esta pessoa já tem conta de acesso.']);
        }

        User::create([
            'name'            => $contact->name,
            'email'           => $contact->email,
            'password'        => $data['password'],
            'role'            => $data['role'],
            'organization_id' => 1,
            'is_active'       => true,
            'contact_id'      => $contact->id,
        ]);

        return back()->with('message', 'Acesso criado para ' . $contact->name . '.');
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'role'      => 'required|in:admin,executivo,administrativo,operacional',
            'is_active' => 'boolean',
            'password'  => 'nullable|min:8',
        ]);

        $user->update([
            'role'      => $data['role'],
            'is_active' => $data['is_active'] ?? $user->is_active,
            ...(!empty($data['password']) ? ['password' => $data['password']] : []),
        ]);

        return back()->with('message', 'Acesso de ' . $user->name . ' atualizado.');
    }

    public function destroyUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'Não podes eliminar a tua própria conta.']);
        }

        try {
            // O contact fica — só se remove a conta de acesso (user.contact_id limpa-se ao apagar)

            // Nullify FK references that don't auto-nullify
            \Illuminate\Support\Facades\DB::table('tickets')->where('created_by', $user->id)->update(['created_by' => null]);
            \Illuminate\Support\Facades\DB::table('tickets')->where('assigned_to', $user->id)->update(['assigned_to' => null]);
            \Illuminate\Support\Facades\DB::table('tasks')->where('created_by', $user->id)->update(['created_by' => null]);
            \Illuminate\Support\Facades\DB::table('tasks')->where('assigned_to', $user->id)->update(['assigned_to' => null]);
            \Illuminate\Support\Facades\DB::table('tasks')->where('validated_by', $user->id)->update(['validated_by' => null]);
            \Illuminate\Support\Facades\DB::table('events')->where('created_by', $user->id)->update(['created_by' => null]);
            \Illuminate\Support\Facades\DB::table('documents')->where('created_by', $user->id)->update(['created_by' => null]);
            \Illuminate\Support\Facades\DB::table('documents')->where('approved_by', $user->id)->update(['approved_by' => null]);
            \Illuminate\Support\Facades\DB::table('operational_plans')->where('created_by', $user->id)->update(['created_by' => null]);
            \Illuminate\Support\Facades\DB::table('operational_plans')->where('manager_id', $user->id)->update(['manager_id' => null]);
            \Illuminate\Support\Facades\DB::table('space_reservations')->where('reviewed_by', $user->id)->update(['reviewed_by' => null]);
            \Illuminate\Support\Facades\DB::table('conversation_participants')->where('user_id', $user->id)->delete();
            \Illuminate\Support\Facades\DB::table('messages')->where('user_id', $user->id)->update(['user_id' => null]);
            \Illuminate\Support\Facades\DB::table('conversations')->where('created_by', $user->id)->update(['created_by' => 1]);

            $user->delete();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Não foi possível eliminar: ' . $e->getMessage()]);
        }

        return back()->with('message', 'Utilizador eliminado.');
    }

    // ── Perfil pessoal → redireciona para a ficha de pessoa ──────────────────
    public function profile()
    {
        $user = Auth::user()->load('contact');

        // Se ainda não tem contact, criar automaticamente a partir dos dados do utilizador
        if (! $user->contact_id) {
            $contact = Contact::create([
                'organization_id' => 1,
                'name'            => $user->name,
                'email'           => $user->email,
                'is_active'       => true,
            ]);
            $user->update(['contact_id' => $contact->id]);
            $user->contact_id = $contact->id;
        }

        return redirect("/pessoas/{$user->contact_id}");
    }

    // updateProfile mantido apenas para compatibilidade (redireciona para pessoa)
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if ($user->contact_id) {
            return redirect("/pessoas/{$user->contact_id}");
        }
        return redirect('/perfil');
    }

    // ── Áreas Funcionais ───────────────────────────────────────────────────────

    public function areas()
    {
        return Inertia::render('Settings/Areas', [
            'serviceAreas' => ServiceArea::where('organization_id', 1)
                ->with('teams:id,name,type')
                ->orderBy('name')
                ->get(),
            'allTeams' => Team::where('organization_id', 1)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id','name','type']),
        ]);
    }

    public function storeArea(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
            'icon'        => 'nullable|string|max:50',
            'is_active'   => 'boolean',
            'team_ids'    => 'nullable|array',
            'team_ids.*'  => 'exists:teams,id',
        ]);

        $teamIds = $data['team_ids'] ?? [];
        unset($data['team_ids']);

        $data['organization_id'] = 1;
        $data['slug']            = Str::slug($data['name']);
        $data['is_active']       = $data['is_active'] ?? true;

        $area = ServiceArea::create($data);
        if ($teamIds) {
            $area->teams()->sync($teamIds);
        }

        return back()->with('message', 'Área funcional criada.');
    }

    public function updateArea(Request $request, ServiceArea $area)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
            'icon'        => 'nullable|string|max:50',
            'is_active'   => 'boolean',
            'team_ids'    => 'nullable|array',
            'team_ids.*'  => 'exists:teams,id',
        ]);

        $teamIds = $data['team_ids'] ?? null;
        unset($data['team_ids']);

        $data['slug'] = Str::slug($data['name']);
        $area->update($data);

        if ($teamIds !== null) {
            $area->teams()->sync($teamIds);
        }

        return back()->with('message', 'Área funcional atualizada.');
    }

    public function destroyArea(ServiceArea $area)
    {
        $area->teams()->detach();
        $area->delete();
        return back()->with('message', 'Área eliminada.');
    }
}
