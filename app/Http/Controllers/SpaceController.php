<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpaceController extends Controller
{
    /** GET /espacos — vista pública de espaços disponíveis */
    public function index()
    {
        return Inertia::render('Spaces/Index', [
            'spaces' => Space::with(['responsibleUser','responsibleTeam'])
                ->withCount('reservations')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    /** GET /configuracoes/espacos — gestão de espaços em Configurações */
    public function settingsIndex()
    {
        return Inertia::render('Settings/Index', [
            'section' => 'espacos',
            'spaces'  => Space::with(['responsibleUser:id,name','responsibleTeam:id,name'])
                ->withCount('reservations')
                ->orderBy('name')
                ->get(),
            'users'   => User::where('is_active', true)->orderBy('name')->get(['id','name']),
            'teams'   => Team::where('is_active', true)->orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'type'                  => 'required|string|max:100',
            'description'           => 'nullable|string',
            'capacity'              => 'nullable|integer|min:1',
            'location'              => 'nullable|string|max:255',
            'color'                 => 'nullable|string|max:20',
            'is_active'             => 'boolean',
            'is_public'             => 'boolean',
            'responsible_user_id'   => 'nullable|exists:users,id',
            'responsible_team_id'   => 'nullable|exists:teams,id',
            'schedule'              => 'nullable|array',
            'availability_exceptions' => 'nullable|array',
            'requirements'          => 'nullable|string',
            'notes'                 => 'nullable|string',
        ]);
        $data['organization_id'] = 1;
        Space::create($data);
        return back()->with('message', 'Espaço criado.');
    }

    public function update(Request $request, Space $space)
    {
        $data = $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'type'                  => 'sometimes|string|max:100',
            'description'           => 'nullable|string',
            'capacity'              => 'nullable|integer|min:1',
            'location'              => 'nullable|string|max:255',
            'color'                 => 'nullable|string|max:20',
            'is_active'             => 'boolean',
            'is_public'             => 'boolean',
            'responsible_user_id'   => 'nullable|exists:users,id',
            'responsible_team_id'   => 'nullable|exists:teams,id',
            'schedule'              => 'nullable|array',
            'availability_exceptions' => 'nullable|array',
            'requirements'          => 'nullable|string',
            'notes'                 => 'nullable|string',
        ]);
        $space->update($data);
        return back()->with('message', 'Espaço atualizado.');
    }

    public function destroy(Space $space)
    {
        $space->delete();
        return back()->with('message', 'Espaço removido.');
    }
}
