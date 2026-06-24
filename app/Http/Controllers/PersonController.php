<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Department;
use App\Models\EmployeeAbsence;
use App\Models\PersonType;
use App\Models\User;
use App\Services\PermissionService;
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
            // Campos de funcionário
            'employee_number'  => 'nullable|string|max:50',
            'position'         => 'nullable|string|max:100',
            'department_id'    => 'nullable|exists:departments,id',
            'hire_date'        => 'nullable|date',
            'termination_date' => 'nullable|date',
            'contract_type'    => 'nullable|string|max:50',
            'emergency_contact'=> 'nullable|string|max:255',
            'emergency_phone'  => 'nullable|string|max:30',
        ]);

        $data['organization_id'] = 1;
        $data['employee_status'] = 'disponível'; // padrão — actualizado automaticamente pelos registos RH
        $contact = Contact::create($data);

        return redirect("/pessoas/{$contact->id}")->with('message', 'Pessoa criada com sucesso.');
    }

    public function show(Contact $contact)
    {
        $contact->load([
            'personType', 'user', 'employee.department', 'department',
            'tickets'      => fn($q) => $q->latest()->limit(10),
            'reservations' => fn($q) => $q->latest()->limit(5),
            'absences'     => fn($q) => $q->orderBy('start_date', 'desc'),
        ]);

        return Inertia::render('Pessoas/Show', [
            'contact'     => $contact,
            'personTypes' => $this->pessoaTypes(),
            'departments' => Department::where('organization_id', 1)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // ── Registos RH (ausências / férias) ─────────────────────────────────────

    /**
     * Recalcula a disponibilidade do funcionário com base nos registos RH aprovados.
     * Se hoje cai dentro de um período aprovado → disponibilidade = tipo da ausência.
     * Caso contrário → 'disponível'.
     */
    private function recalcAvailability(Contact $contact): void
    {
        $today = now()->toDateString();

        $active = $contact->absences()
            ->where('status', 'aprovado')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date',   '>=', $today)
            ->orderBy('start_date', 'desc')
            ->first();

        $contact->update(['employee_status' => $active ? $active->type : 'disponível']);
    }

    public function storeAbsence(Request $request, Contact $contact)
    {
        $data = $request->validate([
            'type'       => 'required|string',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'days'       => 'nullable|integer|min:1',
            'status'     => 'nullable|in:pendente,aprovado,rejeitado',
            'notes'      => 'nullable|string',
        ]);

        $data['contact_id'] = $contact->id;
        $data['status']     = $data['status'] ?? 'pendente';

        EmployeeAbsence::create($data);
        $this->recalcAvailability($contact);

        return back()->with('message', 'Registo criado.');
    }

    public function updateAbsence(Request $request, Contact $contact, EmployeeAbsence $absence)
    {
        abort_if($absence->contact_id !== $contact->id, 403);

        $data = $request->validate([
            'type'       => 'required|string',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'days'       => 'nullable|integer|min:1',
            'status'     => 'nullable|in:pendente,aprovado,rejeitado',
            'notes'      => 'nullable|string',
        ]);

        $absence->update($data);
        $this->recalcAvailability($contact);

        return back()->with('message', 'Registo actualizado.');
    }

    public function destroyAbsence(Contact $contact, EmployeeAbsence $absence)
    {
        abort_if($absence->contact_id !== $contact->id, 403);
        $absence->delete();
        $this->recalcAvailability($contact);
        return back()->with('message', 'Registo eliminado.');
    }

    /** Aprovação rápida via sino — requer permissão hr.ausencia.aprovar */
    public function approveAbsence(EmployeeAbsence $absence)
    {
        abort_if(!PermissionService::check(auth()->user(), 'hr.ausencia.aprovar'), 403, 'Sem permissão.');
        $absence->update(['status' => 'aprovado', 'approved_by' => auth()->id()]);
        $this->recalcAvailability($absence->contact);
        return back()->with('message', 'Ausência aprovada.');
    }

    public function rejectAbsence(EmployeeAbsence $absence)
    {
        abort_if(!PermissionService::check(auth()->user(), 'hr.ausencia.rejeitar'), 403, 'Sem permissão.');
        $absence->update(['status' => 'rejeitado']);
        $this->recalcAvailability($absence->contact);
        return back()->with('message', 'Ausência rejeitada.');
    }

    // ── Conta de acesso ───────────────────────────────────────────────────────

    /** Cria nova conta de acesso para esta pessoa */
    public function createUserAccount(Request $request, Contact $contact)
    {
        if ($contact->user()->exists()) {
            return back()->withErrors(['error' => 'Esta pessoa já tem conta de acesso.']);
        }

        if (!$contact->email) {
            return back()->withErrors(['error' => 'A pessoa não tem email definido. Adiciona um email primeiro.']);
        }

        $request->validate([
            'password' => 'required|min:8',
            'role'     => 'required|in:admin,executivo,administrativo,operacional',
        ]);

        // Verificar se o email já está em uso por outro user
        if (User::where('email', $contact->email)->exists()) {
            return back()->withErrors(['error' => 'Este email já está em uso por outra conta.']);
        }

        User::create([
            'name'            => $contact->name,
            'email'           => $contact->email,
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
            // Campos de funcionário (guardados directamente em contacts)
            'employee_number'  => 'nullable|string|max:50',
            'position'         => 'nullable|string|max:100',
            'department_id'    => 'nullable|exists:departments,id',
            'hire_date'        => 'nullable|date',
            'termination_date' => 'nullable|date',
            'employee_status'  => 'nullable|string|max:50',
            'contract_type'    => 'nullable|string|max:50',
            'emergency_contact'=> 'nullable|string|max:255',
            'emergency_phone'  => 'nullable|string|max:30',
        ]);

        $contact->update($data);

        // Sincronizar conta de acesso (nome + email são sempre os mesmos da pessoa)
        if ($user = $contact->fresh()->user) {
            $user->update([
                'name'  => $contact->name,
                'email' => $contact->email ?? $user->email,
            ]);
        }

        // Sincronizar ficha de funcionário (cópia de nome + email + telefone)
        if ($employee = $contact->fresh()->employee) {
            $employee->update([
                'name'  => $contact->name,
                'email' => $contact->email  ?? $employee->email,
                'phone' => $contact->phone  ?? $employee->phone,
            ]);
        }

        return back()->with('message', 'Pessoa atualizada.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect('/pessoas')->with('message', 'Pessoa eliminada.');
    }
}
