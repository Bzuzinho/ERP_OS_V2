<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('ticket_id')->nullable()->after('organization_id')->constrained()->nullOnDelete();
            $table->foreignId('space_reservation_id')->nullable()->after('ticket_id')->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->after('space_reservation_id')->constrained()->nullOnDelete();
            $table->foreignId('service_area_id')->nullable()->after('event_id')->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->after('assigned_to')->constrained('users')->nullOnDelete();
            $table->enum('origin', ['ticket','reservation','event','plan','manual'])->default('manual')->after('priority');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['organization_id','ticket_id','space_reservation_id','event_id','service_area_id','created_by']);
            $table->dropColumn(['organization_id','ticket_id','space_reservation_id','event_id','service_area_id','created_by','origin']);
        });
    }
};
