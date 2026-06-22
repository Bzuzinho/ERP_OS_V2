<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('sidebar_color', 20)->default('#0f172a')->after('accent_color');
            $table->string('header_color',  20)->default('#ffffff')->after('sidebar_color');
            $table->string('page_bg_color', 20)->default('#f9fafb')->after('header_color');
            $table->string('card_bg_color', 20)->default('#ffffff')->after('page_bg_color');
            $table->string('heading_color', 20)->default('#111827')->after('card_bg_color');
            $table->string('text_color',    20)->default('#374151')->after('heading_color');
            $table->string('menu_text_color',20)->default('#94a3b8')->after('text_color');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'sidebar_color','header_color','page_bg_color',
                'card_bg_color','heading_color','text_color','menu_text_color',
            ]);
        });
    }
};
