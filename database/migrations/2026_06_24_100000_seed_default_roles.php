<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Só insere se a tabela estiver vazia para esta organização
        if (DB::table('roles')->where('organization_id', 1)->count() > 0) return;

        $now = now();
        DB::table('roles')->insert([
            [
                'organization_id' => 1,
                'name'            => 'Administrador',
                'slug'            => 'admin',
                'level'           => 100,
                'color'           => '#dc2626',
                'is_system'       => 1,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
            [
                'organization_id' => 1,
                'name'            => 'Executivo',
                'slug'            => 'executivo',
                'level'           => 80,
                'color'           => '#7c3aed',
                'is_system'       => 1,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
            [
                'organization_id' => 1,
                'name'            => 'Administrativo',
                'slug'            => 'administrativo',
                'level'           => 60,
                'color'           => '#2563eb',
                'is_system'       => 1,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
            [
                'organization_id' => 1,
                'name'            => 'Operacional',
                'slug'            => 'operacional',
                'level'           => 40,
                'color'           => '#059669',
                'is_system'       => 1,
                'created_at'      => $now,
                'updated_at'      => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('roles')->where('organization_id', 1)->whereIn('slug', [
            'admin', 'executivo', 'administrativo', 'operacional',
        ])->delete();
    }
};
