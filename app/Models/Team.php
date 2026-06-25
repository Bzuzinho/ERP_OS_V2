<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Contact;

class Team extends Model
{
    protected $fillable = [
        'organization_id','name','type','leader_id','description',
        'contact_name','contact_phone','contact_email','is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    /** Líder da equipa */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    /** Membros (pessoas do diretório) */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'team_members', 'team_id', 'contact_id')
                    ->withPivot('role', 'created_at');
    }

    /** Tarefas atribuídas a esta equipa */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'team_id');
    }

    /** Manutenções atribuídas a esta equipa */
    public function maintenances(): HasMany
    {
        return $this->hasMany(Maintenance::class, 'assigned_team_id');
    }

    /** Áreas funcionais a que esta equipa pertence */
    public function serviceAreas(): BelongsToMany
    {
        return $this->belongsToMany(ServiceArea::class, 'service_area_team');
    }

    /** Pedidos (tickets) atribuídos a esta equipa */
    public function tickets(): BelongsToMany
    {
        return $this->belongsToMany(Ticket::class, 'ticket_teams')
                    ->withPivot('assigned_by', 'assigned_at')
                    ->withTimestamps();
    }
}
