<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['department','user'])->orderBy('name');
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

    public function create()
    {
        return Inertia::render('Employees/Create', [
            'departments' => Department::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'nullable|email',
            'phone'           => 'nullable|string',
            'mobile'          => 'nullable|string',
            'department_id'   => 'nullable|exists:departments,id',
            'position'        => 'nullable|string',
            'contract_type'   => 'nullable|string',
            'hire_date'       => 'nullable|date',
            'employee_number' => 'nullable|string',
            'nif'             => 'nullable|string',
            'address'         => 'nullable|string',
            'postal_code'     => 'nullable|string',
            'locality'        => 'nullable|string',
            'birthdate'       => 'nullable|date',
            'emergency_contact' => 'nullable|string',
            'emergency_phone'   => 'nullable|string',
            'notes'             => 'nullable|string',
        ]);
        $data['organization_id'] = 1;
        $employee = Employee::create($data);
        return redirect("/rh/{$employee->id}")->with('message', 'Funcionário criado.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['department','user','absences' => fn($q) => $q->latest()->limit(10)]);
        return Inertia::render('Employees/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('Employees/Edit', [
            'employee'    => $employee->load('department'),
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
            'type'      => 'required|in:ferias,doenca,formacao,outro',
            'starts_at' => 'required|date',
            'ends_at'   => 'required|date|after_or_equal:starts_at',
            'notes'     => 'nullable|string',
        ]);
        $data['employee_id']     = $employee->id;
        $data['organization_id'] = 1;
        Absence::create($data);
        return back()->with('message', 'Ausencia registada.');
    }
}
