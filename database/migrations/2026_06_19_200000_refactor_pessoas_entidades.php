<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Adicionar campos de funcionário à tabela contacts ─────────────────
        Schema::table('contacts', function (Blueprint $table) {
            if (!Schema::hasColumn('contacts', 'hire_date'))
                $table->date('hire_date')->nullable();
            if (!Schema::hasColumn('contacts', 'termination_date'))
                $table->date('termination_date')->nullable();
            if (!Schema::hasColumn('contacts', 'employee_number'))
                $table->string('employee_number')->nullable();
            if (!Schema::hasColumn('contacts', 'position'))
                $table->string('position')->nullable();
            if (!Schema::hasColumn('contacts', 'department_id'))
                $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            if (!Schema::hasColumn('contacts', 'employee_status'))
                $table->string('employee_status')->nullable(); // ativo|inativo|férias|ausente
            if (!Schema::hasColumn('contacts', 'emergency_contact'))
                $table->string('emergency_contact')->nullable();
            if (!Schema::hasColumn('contacts', 'emergency_phone'))
                $table->string('emergency_phone')->nullable();
            if (!Schema::hasColumn('contacts', 'website'))
                $table->string('website')->nullable();
        });

        // ── Converter categorias existentes: externo/interno → pessoa ─────────
        DB::statement("UPDATE person_types SET category = 'pessoa' WHERE category IN ('externo', 'interno')");

        // ── Semear tipos padrão (se não existirem) ────────────────────────────
        $now   = now();
        $orgId = 1;

        $defaults = [
            // Pessoas naturais
            ['name' => 'Munícipe',              'category' => 'pessoa',   'color' => '#2563eb', 'sort_order' => 1,  'is_system' => true],
            ['name' => 'Funcionário',            'category' => 'pessoa',   'color' => '#059669', 'sort_order' => 2,  'is_system' => true],
            ['name' => 'Presidente',             'category' => 'pessoa',   'color' => '#7c3aed', 'sort_order' => 3,  'is_system' => true],
            ['name' => 'Vereador',               'category' => 'pessoa',   'color' => '#0891b2', 'sort_order' => 4,  'is_system' => true],
            ['name' => 'Membro da Assembleia',   'category' => 'pessoa',   'color' => '#6366f1', 'sort_order' => 5,  'is_system' => true],
            ['name' => 'Voluntário',             'category' => 'pessoa',   'color' => '#f59e0b', 'sort_order' => 6,  'is_system' => false],
            // Entidades organizacionais
            ['name' => 'Fornecedor',             'category' => 'entidade', 'color' => '#dc2626', 'sort_order' => 10, 'is_system' => true],
            ['name' => 'Instituição',            'category' => 'entidade', 'color' => '#7c3aed', 'sort_order' => 11, 'is_system' => true],
            ['name' => 'Parceiro',               'category' => 'entidade', 'color' => '#0891b2', 'sort_order' => 12, 'is_system' => true],
            ['name' => 'Associação',             'category' => 'entidade', 'color' => '#059669', 'sort_order' => 13, 'is_system' => true],
            ['name' => 'Empresa',                'category' => 'entidade', 'color' => '#6b7280', 'sort_order' => 14, 'is_system' => false],
        ];

        foreach ($defaults as $tipo) {
            DB::table('person_types')->updateOrInsert(
                ['organization_id' => $orgId, 'name' => $tipo['name']],
                array_merge($tipo, [
                    'organization_id' => $orgId,
                    'is_active'       => true,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ])
            );
        }
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $cols = ['hire_date','termination_date','employee_number','position',
                     'department_id','employee_status','emergency_contact','emergency_phone','website'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('contacts', $col)) $table->dropColumn($col);
            }
        });
    }
};
