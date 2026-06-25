<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportData extends Command
{
    protected $signature   = 'app:export-data {--output=database/export.json : Caminho do ficheiro de saída}';
    protected $description = 'Exporta todos os dados da BD local para JSON (para migrar para produção)';

    // Tabelas exportadas por esta ordem (respeita FK dependencies)
    private array $tables = [
        'organizations',
        'person_types',
        'departments',
        'service_areas',
        'contacts',
        'users',
        'roles',
        'role_permissions',
        'permission_actions',
        'permission_grants',
        'teams',
        'team_members',
        'service_area_team',
        'spaces',
        'space_reservations',
        'tickets',
        'ticket_comments',
        'ticket_teams',
        'tasks',
        'task_checklist_items',
        'operational_plans',
        'events',
        'event_participants',
        'documents',
        'employee_absences',
        'inventory_categories',
        'inventory_items',
        'inventory_movements',
        'material_loans',
        'material_requisitions',
        'conversations',
        'conversation_participants',
        'messages',
        'message_attachments',
        'push_subscriptions',
        'migrations',
    ];

    public function handle(): int
    {
        $output = $this->option('output');
        $export = ['exported_at' => now()->toIso8601String(), 'tables' => []];
        $total  = 0;

        foreach ($this->tables as $table) {
            if (! Schema::hasTable($table)) {
                $this->line("  <comment>skip</comment>  $table (não existe)");
                continue;
            }

            $rows = DB::table($table)->get()->toArray();
            $rows = array_map(fn($r) => (array) $r, $rows);

            $export['tables'][$table] = $rows;
            $count = count($rows);
            $total += $count;

            $this->line("  <info>✔</info>  $table ($count registos)");
        }

        file_put_contents(base_path($output), json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->newLine();
        $this->info("✅ Exportados $total registos → $output");
        $this->line("   Faz commit deste ficheiro e corre  php artisan app:import-data  no Railway.");

        return self::SUCCESS;
    }
}
