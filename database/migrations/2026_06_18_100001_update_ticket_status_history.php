<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_status_history', function (Blueprint $table) {
            $table->string('event_type')->default('estado')->after('ticket_id');
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_status_history', function (Blueprint $table) {
            $table->dropColumn(['event_type','contact_id']);
        });
    }
};
