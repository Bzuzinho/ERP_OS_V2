<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['contact','department','user'])->orderBy('name');
        if ($request->filled('department')) $query->where('department_id', $request->department);
        if ($request->filled('status'))     $query->where('status', $request->status);
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(fn($qb) => $qb->where('name','like',"%$q%")->orWhere('email','like',"%$q%")->orWhere('position','like',"%$q%"));
        }

        return Inertia::render('Employees/Index', [
            'employees'   => $query->paginate(25)->withQueryString(),
            'departments' => Department::orderBy('name')->get(['id','name']),
            'filters'     => $request->only(['department','status','search']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Employees/Create', [
            'departments'             => Department::orderBy('name')->get(['id','name']),
            'contactsWithoutEmployee' => Contact::whereDoesntHave('employee')
                ->where('organization_id', 1)
                ->orderBy('name')
                ->get(['id','name','email','nif']),
            'preselectedContactId'    => $request->integer('contact_id') ?: null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'contact_id'      => 'required|exists:contacts,id',
            'department_id'   => 'nullable|exists:departments,id',
            'position'        => 'nullable|string',
            'contract_type'   => 'nullable|string',
            'hire_date'       => 'nullable|date',
            'employee_number' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'emergency_phone'   => 'nullable|string',
            'notes'             => 'nullable|string',
        ]);

        $contact = Contact::findOrFail($data['contact_id']);

        if ($contact->employee()->exists()) {
            return back()->withErrors(['error' => 'Esta pessoa já tem ficha de funcionário.']);
        }

        $employee = Employee::create(array_merge($data, [
            'organization_id' => 1,
            'name'            => $contact->name,
            'email'           => $contact->email,
            'phone'           => $contact->phone,
            'nif'             => $contact->nif,
        ]));

        return redirect("/rh/{$employee->id}")->with('message', 'Funcionário criado.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['contact','department','user','absences' => fn($q) => $q->latest()->limit(10)]);
        return Inertia::render('Employees/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('Employees/Edit', [
            'employee'    => $employee->load(['contact','department']),
            'departments' => Department::orderBy('name')->get(['id','name']),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'nullable|email',
            'phone'           => 'nullable|string',
            'mobile'          => 'nullable|string',
            'department_id'   => 'nullable|exists:departments,id',
            'position'        => 'nullable|string',
            'contract_type'   => 'nullable|string',
            'status'          => 'required|in:ativo,inativo,ferias,ausente',
            'address'         => 'nullable|string',
            'postal_code'     => 'nullable|string',
            'locality'        => 'nullable|string',
            'birthdate'       => 'nullable|date',
            'emergency_contact' => 'nullable|string',
            'emergency_phone'   => 'nullable|string',
            'notes'             => 'nullable|string',
        ]);
        $employee->update($data);
        return back()->with('message', 'Funcionário atualizado.');
    }

    public function storeAbsence(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'type'      =>