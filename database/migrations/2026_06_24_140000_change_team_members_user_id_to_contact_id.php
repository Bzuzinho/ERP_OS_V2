<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('team_members', 'contact_id')) {
            Schema::table('team_members', function (Blueprint $table) {
                $table->unsignedBigInteger('contact_id')->nullable()->after('team_id');
            });
        }

        // Migrate existing user_id → contact_id via users.contact_id
        DB::statement("
            UPDATE team_members
            SET contact_id = (
                SELECT contact_id FROM users WHERE users.id = team_members.user_id
            )
            WHERE contact_id IS NULL AND user_id IS NOT NULL
        ");

        // Remove rows that couldn't be mapped (user had no contact_id)
        DB::statement("DELETE FROM team_members WHERE contact_id IS NULL");

        // SQLite doesn't support DROP COLUMN with constraints easily,
        // so we recreate the table without user_id
        Schema::table('team_members', function (Blueprint $table) {
            // Drop old unique constraint if it exists
            try { $table->dropUnique(['team_id', 'user_id']); } catch (\Throwable) {}
            try { $table->dropColumn('user_id'); } catch (\Throwable) {}
        });

        // Add new unique constraint
        if (! $this->uniqueExists('team_members', 'team_members_team_id_contact_id_unique')) {
            Schema::table('team_members', function (Blueprint $table) {
                $table->unique(['team_id', 'contact_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            try { $table->dropUnique(['team_id', 'contact_id']); } catch (\Throwable) {}
        });

        if (! Schema::hasColumn('team_members', 'user_id')) {
            Schema::table('team_members', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('team_id');
            });
        }

        // Reverse: contact_id → user_id
        DB::statement("
            UPDATE team_members
            SET user_id = (
                SELECT id FROM users WHERE users.contact_id = team_members.contact_id
            )
            WHERE user_id IS NULL
        ");

        Schema::table('team_members', function (Blueprint $table) {
            try { $table->dropColumn('contact_id'); } catch (\Throwable) {}
        });
    }

    private function uniqueExists(string $table, string $indexName): bool
    {
        $indexes = DB::select("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name=?", [$table, $indexName]);
        return count($indexes) > 0;
    }
};
