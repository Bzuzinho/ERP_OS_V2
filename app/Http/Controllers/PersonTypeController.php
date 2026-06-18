<?php

namespace App\Http\Controllers;

use App\Models\PersonType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersonTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/PersonTypes', [
            'types' => PersonType::where('organization_id', 1)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:60',
            'category'   => 'required|in:externo,interno,misto',
            'color'      => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
        ]);
        $data['organization_id'] = 1;
        PersonType::create($data);
        return back()->with('message', 'Tipo criado.');
    }

    public function update(Request $request, PersonType $personType)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:60',
            'category'   => 'required|in:externo,interno,misto',
            'color'      => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
        ]);
        $personType->update($data);
        return back()->with('message', 'Tipo atualizado.');
    }

    public function destroy(PersonType $personType)
    {
        if ($personType->is_system) {
            return back()->withErrors(['msg' => 'Este tipo é de sistema e não pode ser eliminado.']);
        }
        $personType->delete();
        return back()->with('message', 'Tipo eliminado.');
    }
}
