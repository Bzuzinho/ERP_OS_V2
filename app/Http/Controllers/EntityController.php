<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\PersonType;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Gere entidades organizacionais: fornecedores, instituições, parceiros, associações, etc.
 * Filtra contacts onde person_type.category = 'entidade'.
 */
class EntityController extends Controller
{
    private function entidadeTypes()
    {
        return PersonType::where('organization_id', 1)
            ->where('category', 'entidade')
            ->active()->orderBy('sort_order')->get();
    }

    public function index(Request $request)
    {
        $query = Contact::with(['personType'])
            ->withCount(['tickets', 'reservations'])
            ->whereHas('personType', fn($q) => $q->where('category', 'entidade'));

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('nif', 'like', "%$search%")
                  ->orWhere('locality', 'like', "%$search%");
            });
        }

        if ($type = $request->get('type_id')) {
            $query->where('person_type_id', $type);
        }

        $contacts     = $query->orderBy('name')->paginate(30)->withQueryString();
        $entityTypes  = $this->entidadeTypes();

        return Inertia::render('Entidades/Index', [
            'contacts'    => $contacts,
            'entityTypes' => $entityTypes,
            'filters'     => $request->only(['search', 'type_id']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'person_type_id' => 'nullable|exists:person_types,id',
            'email'          => 'nullable|email|max:255',
            'phone'          => 'nullable|string|max:30',
            'mobile'         => 'nullable|string|max:30',
            'nif'            => 'nullable|string|max:20',
            'website'        => 'nullable|url|max:255',
            'address'        => 'nullable|string|max:500',
            'postal_code'    => 'nullable|string|max:20',
            'locality'       => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $data['organization_id'] = 1;
        $contact = Contact::create($data);

        return redirect("/entidades/{$contact->id}")->with('message', 'Entidade criada com sucesso.');
    }

    public function show(Contact $contact)
    {
        $contact->load([
            'personType',
            'tickets'      => fn($q) => $q->latest()->limit(10),
            'reservations' => fn($q) => $q->with('space')->latest()->limit(5),
        ]);

        return Inertia::render('Entidades/Show', [
            'contact'     => $contact,
            'entityTypes' => $this->entidadeTypes(),
        ]);
    }

    public function update(Request $request, Contact $contact)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'person_type_id' => 'nullable|exists:person_types,id',
            'email'          => 'nullable|email|max:255',
            'phone'          => 'nullable|string|max:30',
            'mobile'         => 'nullable|string|max:30',
            'nif'            => 'nullable|string|max:20',
            'website'        => 'nullable|url|max:255',
            'address'        => 'nullable|string|max:500',
            'postal_code'    => 'nullable|string|max:20',
            'locality'       => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $contact->update($data);
        return back()->with('message', 'Entidade atualizada.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect('/entidades')->with('message', 'Entidade eliminada.');
    }
}
