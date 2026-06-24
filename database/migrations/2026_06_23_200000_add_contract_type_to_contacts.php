<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('contacts', 'contract_type')) {
            Schema::table('contacts', function (Blueprint $table) {
                $table->string('contract_type')->nullable()->after('employee_status');
            });
        }
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn('contract_type');
        });
    }
};
