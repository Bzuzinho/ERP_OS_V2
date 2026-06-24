<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['organization_id', 'name', 'slug', 'level', 'color', 'is_system'];

    protected $casts = ['is_system' => 'boolean', 'level' => 'integer'];

    /** Nível numérico do slug de um user (fallback se não estiver na tabela) */
    public static function levelOf(string $slug): int
    {
        static $cache = [];
        if (!isset($cache[$slug])) {
            $cache[$slug] = static::where('slug', $slug)->value('level')
                ?? match($slug) {
                    'admin'          => 100,
                    'executivo'      => 80,
                    'administrativo' => 60,
                    default          => 40,
                };
        }
        return $cache[$slug];
    }
}
