<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('approval_requested_from_id')
                  ->nullable()->after('approved_by')
                  ->constrained('users')->nullOnDelete();
            $table->timestamp('approval_requested_at')->nullable()->after('approval_requested_from_id');
            $table->text('approval_notes')->nullable()->after('approval_requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['approval_requested_from_id']);
            $table->dropColumn(['approval_requested_from_id','approval_requested_at','approval_notes']);
        });
    }
};
