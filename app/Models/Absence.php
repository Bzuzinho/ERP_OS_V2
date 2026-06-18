<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $fillable = ['employee_id','organization_id','type','starts_at','ends_at','notes','status'];
    protected $casts = ['starts_at' => 'date','ends_at' => 'date'];

    public function employee() { return $this->belongsTo(Employee::class); }
    public function organization() { return $this->belongsTo(Organization::class); }
}
