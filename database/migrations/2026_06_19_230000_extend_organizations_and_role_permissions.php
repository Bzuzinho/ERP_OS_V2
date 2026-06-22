<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Adicionar colunas à tabela organizations ──────────────────────────
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('website')->nullable()->after('nif');
            $table->string('district')->nullable()->after('city');
            $table->string('county')->nullable()->after('district');
            $table->string('logo_secondary')->nullable()->after('logo');
            $table->string('primary_color')->default('#4f46e5')->after('description');
            $table->string('accent_color')->default('#7c3aed')->after('primary_color');
            $table->string('diggov_code')->nullable()->after('nif'); // código DigGov
        });

        // ── Tabela de permissões por perfil ───────────────────────────────────
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id')->default(1);
            $table->string('role', 50);        // admin, executivo, administrativo, operacional
            $table->string('module', 60);      // tarefas, tickets, agenda, ...
            $table->boolean('can_view')->default(true);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();

            $table->unique(['organization_id', 'role', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'website', 'district', 'county', 'logo_secondary',
                'primary_color', 'accent_color', 'diggov_code',
            ]);
        });
    }
};
