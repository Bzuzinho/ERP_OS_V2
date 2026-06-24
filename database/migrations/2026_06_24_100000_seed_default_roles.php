<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A tabela roles pode ter sido criada por uma versão anterior (Spatie ou outro)
        // com schema diferente. Adicionar colunas que faltam.
        Schema::table('roles', function (Blueprint $table) {
            if (!Schema::hasColumn('roles', 'organization_id')) {
                $table->unsignedBigInteger('organization_id')->default(1)->after('id');
            }
            if (!Schema::hasColumn('roles', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }
            if (!Schema::hasColumn('roles', 'level')) {
                $table->unsignedInteger('level')->default(40)->after('slug');
            }
            if (!Schema::hasColumn('roles', 'color')) {
                $table->string('color')->default('#6b7280')->after('level');
            }
            if (!Schema::hasColumn('roles', 'is_system')) {
                $table->boolean('is_system')->default(false)->after('color');
            }
        });

        // Apagar registos legados (sem slug, da versão antiga)
        DB::table('roles')->whereNull('slug')->orWhere('slug', '')->delete();

        // Só insere se a tabela estiver vazia para esta organização
        if (DB::table('roles')->where('organization_id', 1)->count() > 0) return;

        $now = now();
        DB::table('roles')->insert([
            ['organization_id' => 1, 'name' => 'Administrador',  'slug' => 'admin',          'guard_name' => 'web', 'level' => 100, 'color' => '#dc2626', 'is_system' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['organization_id' => 1, 'name' => 'Executivo',      'slug' => 'executivo',      'guard_name' => 'web', 'level' => 80,  'color' => '#7c3aed', 'is_system' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['organization_id' => 1, 'name' => 'Administrativo', 'slug' => 'administrativo', 'guard_name' => 'web', 'level' => 60,  'color' => '#2563eb', 'is_system' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['organization_id' => 1, 'name' => 'Operacional',    'slug' => 'operacional',    'guard_name' => 'web', 'level' => 40,  'color' => '#059669', 'is_system' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        DB::table('roles')->where('organization_id', 1)->whereIn('slug', [
            'admin', 'executivo', 'administrativo', 'operacional',
        ])->delete();
    }
};
