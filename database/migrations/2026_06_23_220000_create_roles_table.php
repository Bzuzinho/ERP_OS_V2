<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('roles')) return;

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id')->default(1);
            $table->string('name');          // "Executivo", "Chefe de Divisão", ...
            $table->string('slug')->unique(); // "executivo", "chefe_divisao", ...
            $table->unsignedInteger('level');// 0–100: nível hierárquico
            $table->string('color')->default('#6b7280');
            $table->boolean('is_system')->default(false); // perfis de sistema não podem ser eliminados
            $table->timestamps();
        });

        // Perfis de sistema por defeito
        DB::table('roles')->insert([
            ['organization_id' => 1, 'name' => 'Administrador', 'slug' => 'admin',          'level' => 100, 'color' => '#dc2626', 'is_system' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'name' => 'Executivo',     'slug' => 'executivo',       'level' => 80,  'color' => '#7c3aed', 'is_system' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'name' => 'Administrativo','slug' => 'administrativo',  'level' => 60,  'color' => '#2563eb', 'is_system' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'name' => 'Operacional',   'slug' => 'operacional',     'level' => 40,  'color' => '#059669', 'is_system' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
