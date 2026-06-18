<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with(['leader', 'members'])
            ->where('organization_id', 1)
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id'            => $t->id,
                'name'          => $t->name,
                'type'          => $t->type,
                'description'   => $t->description,
                'is_active'     => $t->is_active,
                'leader'        => $t->leader ? ['id'=>$t->leader->id,'name'=>$t->leader->name] : null,
                'contact_name'  => $t->contact_name,
                'contact_phone' => $t->contact_phone,
                'contact_email' => $t->contact_email,
                'members_count' => $t->members->count(),
                'members'       => $t->members->map(fn($u) => [
                    'id'   => $u->id,
                    'name' => $u->name,
                    'role' => $u->pivot->role,
                ]),
            ]);

        $users = User::where('is_active', true)
            ->orderBy('name')
            ->get(['id','name','role','department']);

        return Inertia::render('Equipas/Index', compact('teams', 'users'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'type'          => 'required|in:interna,externa',
            'leader_id'     => 'nullable|exists:users,id',
            'description'   => 'nullable|string',
            'contact_name'  => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email|max:255',
        ]);

        $team = Team::create(array_merge($data, ['organization_id' => 1]));

        // Adicionar membros iniciais (apenas equipas internas)
        if ($request->has('member_ids') && $data['type'] === 'interna') {
            foreach ($request->member_ids as $uid) {
                $team->members()->syncWithoutDetaching([$uid => ['role' => 'membro']]);
            }
        }

        return redirect('/equipas')->with('flash', ['success' => "Equipa \"{$team->name}\" criada."]);
    }

    public function show(Team $team)
    {
        $team->load(['leader', 'members', 'tasks.assignee', 'maintenances.space']);

        $users = User::where('is_active', true)->orderBy('name')->get(['id','name','department']);

        return Inertia::render('Equipas/Show', [
            'team'  => [
                'id'            => $team->id,
                'name'          => $team->name,
                'type'          => $team->type,
                'description'   => $team->description,
                'is_active'     => $team->is_active,
                'leader'        => $team->leader ? ['id'=>$team->leader->id,'name'=>$team->leader->name] : null,
                'contact_name'  => $team->contact_name,
                'contact_phone' => $team->contact_phone,
                'contact_email' => $team->contact_email,
                'members'       => $team->members->map(fn($u) => [
                    'id'   => $u->id,
                    'name' => $u->name,
                    'role' => $u->pivot->role,
                    'department' => $u->department,
                ]),
                'tasks_count'        => $team->tasks->count(),
                'maintenances_count' => $team->maintenances->count(),
            ],
            'users' => $users,
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'type'          => 'required|in:interna,externa',
            'leader_id'     => 'nullable|exists:users,id',
            'description'   => 'nullable|string',
            'contact_name'  => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email|max:255',
            'is_active'     => 'boolean',
        ]);
        $team->update($data);
        return back()->with('flash', ['success' => 'Equipa atualizada.']);
    }

    public function addMember(Request $request, Team $team)
    {
        $request->validate(['user_id' => 'required|exists:users,id', 'role' => 'in:membro,lider,supervisor']);
        $team->members()->syncWithoutDetaching([
            $request->user_id => ['role' => $request->role ?? 'membro'],
        ]);
        return back()->with('flash', ['success' => 'Membro adicionado.']);
    }

    public function removeMember(Request $request, Team $team)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);
        $team->members()->detach($request->user_id);
        return back()->with('flash', ['success' => 'Membro removido.']);
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return redirect('/equipas')->with('flash', ['success' => 'Equipa eliminada.']);
    }
}
