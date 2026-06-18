<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonType extends Model
{
    protected $fillable = [
        'organization_id', 'name', 'category', 'color', 'icon',
        'sort_order', 'is_active', 'is_system',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
