<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'organization_id','created_by','title','description','type','visibility',
        'filename','original_name','mime_type','file_size','is_approved','approved_at','approved_by','meeting_date'
    ];
    protected $casts = ['is_approved' => 'boolean','approved_at' => 'datetime','meeting_date' => 'date'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }
}
