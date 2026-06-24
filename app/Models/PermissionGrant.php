<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionGrant extends Model
{
    protected $fillable = [
        'organization_id', 'user_id', 'granted_by', 'action_key',
        'scope_type', 'scope_id', 'expires_at', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user()      { return $this->belongsTo(User::class); }
    public function grantedBy() { return $this->belongsTo(User::class, 'granted_by'); }
    public function action()    { return $this->belongsTo(PermissionAction::class, 'action_key', 'key'); }
}
