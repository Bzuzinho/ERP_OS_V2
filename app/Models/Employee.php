<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'organization_id', 'contact_id', 'user_id', 'department_id',
        'name', 'email', 'phone', 'mobile', 'nif',
        'employee_number', 'position', 'contract_type',
        'hire_date', 'termination_date', 'status',
        'address', 'postal_code', 'locality', 'birthdate',
        'emergency_contact', 'emergency_phone', 'notes', 'avatar',
    ];

    protected $casts = [
        'hire_date'        => 'date',
        'termination_date' => 'date',
        'birthdate'        => 'date',
    ];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function contact()      { return $this->belongsTo(Contact::class); }
    public function user()         { return $this->belongsTo(User::class); }
    public function department()   { return $this->belongsTo(Department::class); }
    public function absences()     { return $this->hasMany(Absence::class); }
    public function teams()        { return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id'); }

    // Nome vem do contact se existir, senão do campo local
    public function getDisplayNameAttribute(): string
    {
        return $this->contact?->name ?? $this->name ?? '';
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? asset('storage/' . $this->avata