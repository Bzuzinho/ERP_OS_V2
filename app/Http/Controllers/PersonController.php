<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Department;
use App\Models\PersonType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

/**
 * Gere pessoas naturais: munícipes, funcionários, constituintes, voluntários, etc.
 * Filtra contacts onde person_type.category = 'pessoa' (ou sem tipo = legado).
 */
class PersonController extends Controller
{
    private function pessoaTypes()
    {
        return PersonType::where('organization_id', 1)
            ->where('category', 'pessoa')
            ->active()->orderBy('sort_order')->get();
    }

    public function index(Request $request)
    {
        $query = Contact::with(['personType', 'user', 'department'])
            ->withCount('tickets')
            ->where(function ($q) {
                $q->whereHas('personType', fn($q2) => $q2->where('category', 'pessoa'))
                  ->orWhereNull('person_type_id');
            });

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('nif', 'like', "%$search%")
                  ->orWhere('position', 'like', "%$search%");
            });
        }

        if ($type = $request->get('type_id')) {
            $query->where('person_type_id', $type);
        }

        if ($request->get('active_only') === '1') {
            $query->where(function ($q) {
                $q->whereNull('employee_status')
                  ->orWhere('employee_status', 'ativo');
            });
        }

        $contacts    = $query->orderBy('name')->paginate(30)->withQueryString();
        $personTypes = $this->pessoaTypes();
        $departments = Department::where('organization_id', 1)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Pessoas/Index', [
            'contacts'    => $contacts,
            'personTypes' => $personTypes,
            'departments' => $departments,
            'filters'     => $request->only(['search', 'type_id', 'active_only']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'person_type_id'   => 'nullable|exists:person_types,id',
            'email'            => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:30',
            'mobile'           => 'nullable|string|max:30',
            'nif'              => 'nullable|string|max:20',
            'address'          => 'nullable|string|max:500',
            'postal_code'      => 'nullable|string|max:20',
            'locality'         => 'nullable|string|max:100',
            'birthdate'        => 'nullable|date',
            'notes'            => 'nullable|string',
            // Funcionário
            'employee_number'  => 'nullable|string|max:50',
            'position'         => 'nullable|string|max:100',
            'department_id'    => 'nullable|exists:departments,id',
            'hire_date'        => 'nullable|date',
            'termination_date' => 'nullable|date',
            'employee_status'  => 'nullable|in:ativo,inativo,férias,ausente',
            'contract_type'    => 'nullable|string|max:50',
            'emergency_contact'=> 'nullable|string|max:255',
            'emergency_phone'  => 'nullable|string|max:30',
        ]);

        $data['organization_id'] = 1;
        $contact = Contact::create($data);

        return redirect("/pessoas/{$contact->id}")->with('message', 'Pessoa criada com sucesso.');
    }

    public function show(Contact $contact)
    {
        $contact->load([
            'personType', 'user', 'employee.department', 'department',
            'tickets'      => fn($q) => $q->latest()->limit(10),
            'reservations' => fn($q) => $q->latest()->limit(5),
        ]);

        return Inertia::render('Pessoas/Show', [
            'contact'     => $contact,
            'personTypes' => $this->pessoaTypes(),
            'departments' => Department::where('organization_id', 1)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // ── Conta de acesso ───────────────────────────────────────────────────────

    /** Cria nova conta de acesso para esta pessoa */
    public function createUserAccount(Request $request, Contact $contact)
    {
        if ($contact->user()->exists()) {
            return back()->withErrors(['error' => 'Esta pessoa já tem conta de acesso.']);
        }

        $request->validate([
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role'     => 'required|in:admin,executivo,administrativo,operacional',
        ]);

        User::create([
            'name'            => $contact->name,
            'email'           => $request->email,
            'password'        => Hash::make($request->password),
            'role'            => $request->role,
            'organization_id' => 1,
            'is_active'       => true,
            'contact_id'      => $contact->id,
        ]);

        return back()->with('message', 'Conta de acesso criada com sucesso.');
    }

    /** Remove a conta de acesso desta pessoa */
    public function unlinkUser(Contact $contact)
    {
        $user = $contact->user;
        if (!$user) return back()->withErrors(['error' => 'Sem conta de acesso.']);

        $user->delete();
        return back()->with('message', 'Conta de acesso removida.');
    }

    /** Actualiza role/is_active/password do user desta pessoa */
    public function updateUserAccount(Request $request, Contact $contact)
    {
        $user = $contact->user;
        if (!$user) return back()->withErrors(['error' => 'Sem conta de acesso.']);

        $data = $request->validate([
            'role'      => 'required|in:admin,executivo,administrativo,operacional',
            'is_active' => 'boolean',
            'password'  => 'nullable|min:8',
        ]);

        $user->update([
            'role'      => $data['role'],
            'is_active' => $data['is_active'] ?? $user->is_active,
            ...(!empty($data['password']) ? ['password' => Hash::make($data['password'])] : []),
        ]);

        return back()->with('message', 'Acesso atualizado.');
    }

    public function update(Request $request, Contact $contact)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'person_type_id'   => 'nullable|exists:person_types,id',
            'email'            => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:30',
            'mobile'           => 'nullable|string|max:30',
            'nif'              => 'nullable|string|max:20',
            'address'          => 'nullable|string|max:500',
            'postal_code'      => 'nullable|string|max:20',
            'locality'         => 'nullable|string|max:100',
            'birthdate'        => 'nullable|date',
            'notes'            => 'nullable|string',
            'is_active'        => 'boolean',
            'employee_number'  => 'nullable|string|max:50',
            'position'         => 'nullable|string|max:100',
            'department_id'    => 'nullable|exists:departments,id',
            'hire_date'        => 'nullable|date',
            'termination_date' => 'nullable|date',
            'employee_status'  => 'nullable|in:ativo,inativo,férias,ausente',
            'contract_type'    => 'nullable|string|max:50',
            'emergency_contact'=> 'nullable|string|max:255',
            'emergency_phone'  => 'nullable|string|max:30',
        ]);

        $contact->update($data);
        return back()->with('message', 'Pessoa atualizada.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect('/pessoas')->with('message', 'Pessoa eliminada.');
    }
}
                                                                                         