<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAbsence extends Model
{
    protected $fillable = [
        'contact_id', 'approved_by', 'type',
        'start_date', 'end_date', 'days',
        'status', 'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** Labels legíveis para os tipos */
    public static function typeLabel(string $type): string
    {
        return match($type) {
            'férias'               => 'Férias',
            'falta_justificada'    => 'Falta Justificada',
            'falta_injustificada'  => 'Falta Injustificada',
            'doença'               => 'Doença / Baixa',
            'licença_parental'     => 'Licença Parental',
            'licença_paternidade'  => 'Licença Paternidade',
            'outro'                => 'Outro',
            default                => ucfirst($type),
        };
    }
}
