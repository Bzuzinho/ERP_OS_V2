<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionAction extends Model
{
    protected $fillable = ['organization_id', 'key', 'label', 'module', 'min_level'];

    protected $casts = ['min_level' => 'integer'];
}
