<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'users' => User::orderBy('name')->get(['id','name','email','role','is_active','created_at']),
        ]);
    }

    public function users()
    {
        return Inertia::render('Settings/Users', [
            'users' => User::orderBy('name')->get(['id','name','email','role','is_active','created_at']),
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role'     => 'required|in:admin,executivo,administrativo,operacional',
        ]);

        User::create([
            'name'            => $data['name'],
            'email'           => $data['email'],
            'password'        => Hash::make($data['password']),
            'role'            => $data['role'],
            'organization_id' => 1,
            'is_active'       => true,
        ]);

        return back()->with('message', 'Utilizador criado com sucesso.');
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,'.$user->id,
            'role'      => 'required|in:admin,executivo,administrativo,operacional',
            'is_active' => 'boolean',
            'password'  => 'nullable|min:8',
        ]);

        $user->update([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'role'      => $data['role'],
            'is_active' => $data['is_active'] ?? $user->is_active,
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

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
