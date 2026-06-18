<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpaceController extends Controller
{
    public function index()
    {
        return Inertia::render('Spaces/Index', [
            'spaces' => Space::withCount('reservations')->orderBy('name')->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string',
            'description' => 'nullable|string',
            'capacity'    => 'nullable|integer',
            'location'    => 'nullable|string',
            'is_public'   => 'boolean',
        ]);
        $data['organization_id'] = 1;
        Space::create($data);
        return back()->with('message', 'Espaço criado.');
    }

    public function update(Request $request, Space $space)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string',
            'description' => 'nullable|string',
            'capacity'    => 'nullable|integer',
            'location'    => 'nullable|string',
            'is_active'   => 'boolean',
            'is_public'   => 'boolean',
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
