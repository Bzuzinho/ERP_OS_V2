<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with(['leader', 'members.personType'])
            ->where('organization_id', 1)
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id'            => $t->id,
                'name'          => $t->name,
                'type'          => $t->type,
                'description'   => $t->description,
                'is_active'     => $t->is_active,
                'leader'        => $t->leader ? ['id' => $t->leader->id, 'name' => $t->leader->name] : null,
                'contact_name'  => $t->contact_name,
                'contact_phone' => $t->contact_phone,
                'contact_email' => $t->contact_email,
                'members_count' => $t->members->count(),
                'members'       => $t->members->map(fn($c) => [
                    'id'   => $c->id,
                    'name' => $c->name,
                    'role' => $c->pivot->role,
                ]),
            ]);

        // Líder precisa de conta de utilizador
        $users = User::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        // Membros = todos os contacts activos do diretório
        $contacts = $this->contactsList();

        return Inertia::render('Equipas/Index', compact('teams', 'users', 'contacts'));
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

        if ($request->has('member_ids')) {
            foreach ($request->member_ids as $cid) {
                $team->members()->syncWithoutDetaching([$cid => ['role' => 'membro']]);
            }
        }

        return redirect('/equipas')->with('flash', ['success' => "Equipa \"{$team->name}\" criada."]);
    }

    public function show(Team $team)
    {
        $team->load(['leader', 'members.personType', 'tasks.assignee', 'maintenances.space']);

        $users    = User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'department']);
        $contacts = $this->contactsList();

        return Inertia::render('Equipas/Show', [
            'team' => [
                'id'            => $team->id,
                'name'          => $team->name,
                'type'          => $team->type,
                'description'   => $team->description,
                'is_active'     => $team->is_active,
                'leader'        => $team->leader ? ['id' => $team->leader->id, 'name' => $team->leader->name] : null,
                'contact_name'  => $team->contact_name,
                'contact_phone' => $team->contact_phone,
                'contact_email' => $team->contact_email,
                'members'       => $team->members->map(fn($c) => [
                    'id'       => $c->id,
                    'name'     => $c->name,
                    'role'     => $c->pivot->role,
                    'position' => $c->position,
                    'type'     => $c->personType?->name,
                ]),
                'tasks_count' => $team->tasks->count(),
                'tasks'       => $team->tasks->map(fn($t) => [
                    'id'       => $t->id,
                    'title'    => $t->title,
                    'status'   => $t->status,
                    'assignee' => $t->assignee ? ['name' => $t->assignee->name] : null,
                ]),
            ],
            'users'    => $users,
            'contacts' => $contacts,
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
        $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'role'       => 'in:membro,lider,supervisor',
        ]);
        $team->members()->syncWithoutDetaching([
            $request->contact_id => ['role' => $request->role ?? 'membro'],
        ]);
        return back()->with('flash', ['success' => 'Membro adicionado.']);
    }

    public function removeMember(Request $request, Team $team)
    {
        $request->validate(['contact_id' => 'required|exists:contacts,id']);
        $team->members()->detach($request->contact_id);
        return back()->with('flash', ['success' => 'Membro removido.']);
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return redirect('/equipas')->with('flash', ['success' => 'Equipa eliminada.']);
    }

    private function contactsList(): \Illuminate\Support\Collection
    {
        return Contact::with('personType')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'position', 'person_type_id'])
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'position' => $c->position,
                'type'     => $c->personType?->name,
            ]);
    }
}
