<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    protected $fillable = ['organization_id','attachable_type','attachable_id','user_id','filename','original_name','mime_type','size','disk','visibility'];
    protected $appends  = ['url'];

    public function attachable() { return $this->morphTo(); }
    public function user() { return $this->belongsTo(User::class); }
    public function organization() { return $this->belongsTo(Organization::class); }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->filename);
    }
}
