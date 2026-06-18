<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\PersonType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::with(['personType', 'user'])
            ->withCount('tickets');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('nif', 'like', "%$search%");
            });
        }

        if ($type = $request->get('type_id')) {
            $query->where('person_type_id', $type);
        }

        if ($request->get('has_user') === '1') {
            $query->whereNotNull('user_id');
        }

        $contacts = $query->orderBy('name')->paginate(25)->withQueryString();
        $personTypes = PersonType::where('organization_id', 1)
            ->active()->orderBy('sort_order')->get();

        return Inertia::render('Municipes/Index', [
            'contacts'    => $contacts,
            'personTypes' => $personTypes,
            'filters'     => $request->only(['search', 'type_id', 'has_user']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Municipes/Create', [
            'personTypes' => PersonType::where('organization_id', 1)
                ->active()->orderBy('sort_order')->get(),
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
            'address'        => 'nullable|string|max:500',
            'postal_code'    => 'nullable|string|max:20',
            'locality'       => 'nullable|string|max:100',
            'birthdate'      => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $data['organization_id'] = 1;
        $contact = Contact::create($data);

        return redirect("/municipes/{$contact->id}")->with('message', 'Pessoa criada com sucesso.');
    }

    public function show(Contact $contact)
    {
        $contact->load(['personType', 'user', 'tickets' => fn($q) => $q->latest()->limit(10)]);

        return Inertia::render('Municipes/Show', [
            'contact' => $contact,
        ]);
    }

    public function edit(Contact $contact)
    {
        return Inertia::render('Municipes/Edit', [
            'contact'     => $contact->load('personType'),
            'personTypes' => PersonType::where('organization_id', 1)
                ->active()->orderBy('sort_order')->get(),
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
            'address'        => 'nullable|string|max:500',
            'postal_code'    => 'nullable|string|max:20',
            'locality'       => 'nullable|string|max:100',
            'birthdate'      => 'nullable|date',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $contact->update($data);
        return back()->with('message', 'Pessoa atualizada.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect('/municipes')->with('message', 'Pessoa eliminada.');
    }
}
