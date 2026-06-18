<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['organization_id','name','description','is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function employees() { return $this->hasMany(Employee::class); }
}
