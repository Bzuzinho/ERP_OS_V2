<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'organization_id', 'user_id', 'person_type_id', 'department_id',
        'name', 'email', 'phone', 'mobile', 'nif', 'website',
        'address', 'postal_code', 'locality', 'birthdate',
        'type', 'notes', 'avatar', 'is_active',
        // Campos de funcionário (quando aplicável)
        'employee_number', 'position', 'hire_date', 'termination_date',
        'employee_status', 'contract_type', 'emergency_contact', 'emergency_phone',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'birthdate'        => 'date',
        'hire_date'        => 'date',
        'termination_date' => 'date',
    ];

    protected $appends = ['avatar_url', 'initials'];

    public function organization() { return $this->belongsTo(Organization::class); }
    // Conta de acesso: User que tem este contact_id
    public function user()         { return $this->hasOne(User::class, 'contact_id'); }
    // Compat legado (contacts.user_id ainda existe durante transição)
    public function userLegacy()   { return $this->belongsTo(User::class, 'user_id'); }
    public function personType()   { return $this->belongsTo(PersonType::class); }
    public function department()   { return $this->belongsTo(Department::class); }
    public function tickets()      { return $this->hasMany(Ticket::class); }
    public function reservations() { return $this->hasMany(SpaceReservation::class); }
    // Ficha de funcionário ligada a este contact
    public function employee()     { return $this->hasOne(Employee::class, 'contact_id'); }
    // Registos RH (ausências, férias, licenças)
    public function absences()     { return $this->hasMany(EmployeeAbsence::class); }

    public function isEmployee(): bool
    {
        return (bool) ($this->hire_date || $this->employee_number || $this->position);
    }

    public function getDisplayTypeAttribute(): string
    {
        return $this->personType?->name ?? $this->type ?? 'outro';
    }

    public function getDisplayColorAttribute(): string
    {
        return $this->personType?->color ?? '#6b7280';
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    public function getInitialsAttribute(): string
    {
        $parts = explode(' ', trim($this->name));
        if (count($parts) >= 2) return strtoupper($parts[0][0] . $parts[count($parts)-1][0]);
        return strtoupper(substr($this->name, 0, 2));
    }
}
