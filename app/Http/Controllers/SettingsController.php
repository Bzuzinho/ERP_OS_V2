<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\RolePermission;
use App\Models\User;
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
        return Inertia::render('Settings/Index', array_merge($this->sharedData(), ['section' => 'perfis']));
    }

    private function sharedData(): array
    {
        $org = Organization::find(1);

        // Pessoas sem conta de acesso (para o selector no UserForm)
        $linkedContactIds = \App\Models\Contact::whereNotNull('user_id')->pluck('user_id');
        $pessoasWithoutUser = \App\Models\Contact::whereNull('user_id')
            ->whereHas('personType', fn($q) => $q->where('category', 'pessoa'))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'person_type_id']);

        return [
            'institution'       => $org,
            'users'             => User::with('contact:id,user_id,name,person_type_id')
                                       ->orderBy('name')
                                       ->get(['id','name','email','role','is_active','created_at']),
            'pessoasWithoutUser'=> $pessoasWithoutUser,
            'rolePermissions'   => RolePermission::matrix(1),
            'modules'           => RolePermission::modules(),
            'roles'             => RolePermission::configurableRoles(),
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
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|min:8',
            'role'       => 'required|in:admin,executivo,administrativo,operacional',
            'contact_id' => 'nullable|exists:contacts,id',
        ]);

        $user = User::create([
            'name'            => $data['name'],
            'email'           => $data['email'],
            'password'        => Hash::make($data['password']),
            'role'            => $data['role'],
            'organization_id' => 1,
            'is_active'       => true,
        ]);

        // Ligar à pessoa se indicada
        if (!empty($data['contact_id'])) {
            \App\Models\Contact::where('id', $data['contact_id'])
                ->whereNull('user_id')
                ->update(['user_id' => $user->id]);
        }

        return back()->with('message', 'Utilizador criado com sucesso.');
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,'.$user->id,
            'role'       => 'required|in:admin,executivo,administrativo,operacional',
            'is_active'  => 'boolean',
            'password'   => 'nullable|min:8',
            'contact_id' => 'nullable|exists:contacts,id',
        ]);

        $user->update([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'role'      => $data['role'],
            'is_active' => $data['is_active'] ?? $user->is_active,
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

        // Gerir ligação à pessoa
        $contactId = $data['contact_id'] ?? null;
        $currentContact = $user->contact; // hasOne via user_id

        if ($contactId && (!$currentContact || $currentContact->id != $contactId)) {
            // Desligar o anterior se existir
            if ($currentContact) $currentContact->update(['user_id' => null]);
            // Ligar ao novo (só se ainda não estiver ligado a outro user)
            \App\Models\Contact::where('id', $contactId)
                ->whereNull('user_id')
                ->update(['user_id' => $user->id]);
        } elseif (!$contactId && $currentContact) {
            // Campo limpo = desligar
            $currentContact->update(['user_id' => null]);
        }

        return back()->with('message', 'Utilizador atualizado.');
    }

    public function destroyUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'Não podes eliminar a tua própria conta.']);
        }
        $user->delete();
        return back()->with('message', 'Utilizador eliminado.');
    }

    // ── Perfil pessoal ────────────────────────────────────────────────────────
    public function profile()
    {
        return Inertia::render('Perfil/Index', ['user' => Auth::user()]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,'.$user->id,
            'phone'    => 'nullable|string|max:30',
            'password' => 'nullable|min:8|confirmed',
        ]);

        $user->update([
            'name'  => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? $user->phone,
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

        return back()->with('message', 'Perfil atualizado com sucesso.');
    }
}
