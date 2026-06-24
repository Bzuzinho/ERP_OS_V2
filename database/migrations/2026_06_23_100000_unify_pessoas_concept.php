<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Adicionar contact_id a users (guarda-se contra duplicate column)
        if (!Schema::hasColumn('users', 'contact_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('contact_id')->nullable()->after('id');
            });
            try {
                Schema::table('users', function (Blueprint $table) {
                    $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
                });
            } catch (\Exception $e) { /* SQLite — ignorar */ }
        }

        // 2. Backfill: users.contact_id a partir de contacts.user_id existentes
        DB::statement('
            UPDATE users
            SET contact_id = (
                SELECT id FROM contacts WHERE contacts.user_id = users.id LIMIT 1
            )
            WHERE contact_id IS NULL
        ');

        // 3. Adicionar contact_id a employees
        if (!Schema::hasColumn('employees', 'contact_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->unsignedBigInteger('contact_id')->nullable()->after('organization_id');
            });
            try {
                Schema::table('employees', function (Blueprint $table) {
                    $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
                });
            } catch (\Exception $e) { /* SQLite — ignorar */ }
        }

        // 4. Backfill employees.contact_id a partir de contacts que tenham
        //    o mesmo email ou o mesmo user_id ligado a este employee
        DB::statement('
            UPDATE employees
            SET contact_id = (
                SELECT id FROM contacts
                WHERE contacts.email = employees.email
                LIMIT 1
            )
            WHERE contact_id IS NULL AND employees.email IS NOT NULL
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
