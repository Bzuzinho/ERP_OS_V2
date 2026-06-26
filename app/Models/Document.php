<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'organization_id','created_by','title','description','type','visibility',
        'filename','original_name','mime_type','file_size',
        'is_approved','approved_at','approved_by',
        'approval_requested_from_id','approval_requested_at','approval_notes',
        'meeting_date',
    ];
    protected $casts = [
        'is_approved'            => 'boolean',
        'approved_at'            => 'datetime',
        'approval_requested_at'  => 'datetime',
        'meeting_date'           => 'date',
    ];
    protected $appends = ['file_url'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }
    public function approvalRequestedFrom() { return $this->belongsTo(User::class, 'approval_requested_from_id'); }

    public function getFileUrlAttribute(): ?string
    {
        if (!$this->filename) return null;
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->filename);
    }
}
