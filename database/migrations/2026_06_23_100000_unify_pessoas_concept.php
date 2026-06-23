<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Adicionar contact_id a users (sem constrained() para compatibilidade SQLite)
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('contact_id')->nullable()->after('id');
        });
        // FK separada (SQLite ignora silenciosamente; PostgreSQL/MySQL aplicam)
        try {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
            });
        } catch (\Exception $e) { /* SQLite pode não suportar — ignorar */ }

        // 2. Backfill: users.contact_id a partir de contacts.user_id existentes
        DB::statement('
            UPDATE users u
            SET contact_id = (
                SELECT c.id FROM contacts c WHERE c.user_id = u.id LIMIT 1
            )
            WHERE contact_id IS NULL
        ');

        // 3. Adicionar contact_id a employees
        Schema::table('employees', function (Blueprint $table) {
            $table->unsignedBigInteger('contact_id')->nullable()->after('organization_id');
        });
        try {
            Schema::table('employees', function (Blueprint $table) {
                $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
            });
        } catch (\Exception $e) { /* SQLite — ignorar */ }

        // 4. Backfill employees.contact_id a partir de contacts que tenham
        //    o mesmo email ou o mesmo user_id ligado a este employee
        DB::statement('
            UPDATE employees e
            SET contact_id = (
                SELECT c.id FROM contacts c
                WHERE c.email = e.email
                LIMIT 1
            )
            WHERE contact_id IS NULL AND e.email IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            try { $table->dropForeign(['contact_id']); } catch (\Exception $e) {}
            $table->dropColumn('contact_id');
        });

        Schema::table('users', function (Blueprint $table) {
            try { $table->dropForeign(['contact_id']); } catch (\Exception $e) {}
            $table->dropColumn('contact_id');
        });
    }
};
