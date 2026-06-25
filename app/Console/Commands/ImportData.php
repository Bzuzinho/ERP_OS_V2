<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportData extends Command
{
    protected $signature   = 'app:import-data
                                {--input=database/export.json : Caminho do ficheiro de dados}
                                {--fresh : Apaga todos os dados antes de importar}
                                {--skip-migrations : Não importar tabela migrations}';
    protected $description = 'Importa dados do JSON de exportação para a BD actual (produção)';

    public function handle(): int
    {
        $input = $this->option('input');
        $path  = base_path($input);

        if (! file_exists($path)) {
            $this->error("Ficheiro não encontrado: $path");
            return self::FAILURE;
        }

        $export = json_decode(file_get_contents($path), true);

        if (! isset($export['tables'])) {
            $this->error('Formato inválido.');
            return self::FAILURE;
        }

        $this->info('Fonte: ' . ($export['exported_at'] ?? 'desconhecida'));
        $this->newLine();

        if ($this->option('fresh')) {
            if (! $this->confirm('⚠️  Apagar TODOS os dados existentes antes de importar?')) {
                return self::FAILURE;
            }
        }

        // Desligar verificação de FK durante a importação
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('SET session_replication_role = replica;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }

        $total = 0;
        $errors = [];

        foreach ($export['tables'] as $table => $rows) {
            if ($this->option('skip-migrations') && $table === 'migrations') {
                continue;
            }

            if (! Schema::hasTable($table)) {
                $this->line("  <comment>skip</comment>  $table (tabela não existe nesta BD)");
                continue;
            }

            if (empty($rows)) {
                $this->line("  <comment>vazio</comment> $table");
                continue;
            }

            try {
                if ($this->option('fresh')) {
                    DB::table($table)->truncate();
                }

                // Inserir em lotes de 100
                $chunks = array_chunk($rows, 100);
                foreach ($chunks as $chunk) {
                    DB::table($table)->upsert(
                        $chunk,
                        ['id'],             // conflict key
                        array_keys($chunk[0]) // columns to update
                    );
                }

                $count = count($rows);
                $total += $count;
                $this->line("  <info>✔</info>  $table ($count)");

            } catch (\Throwable $e) {
                $errors[] = "$table: " . $e->getMessage();
                $this->line("  <error>✗</error>  $table — " . $e->getMessage());
            }
        }

        // Restaurar FK
        if ($driver === 'pgsql') {
            DB::statement('SET session_replication_role = DEFAULT;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        }

        // Repor sequences PostgreSQL para evitar conflitos de ID
        if ($driver === 'pgsql') {
            $this->resetSequences($export['tables']);
        }

        $this->newLine();

        if ($errors) {
            $this->warn(count($errors) . ' tabela(s) com erro:');
            foreach ($errors as $e) {
                $this->line("  $e");
            }
        }

        $this->info("✅ Importados $total registos.");

        return self::SUCCESS;
    }

    private function resetSequences(array $tables): void
    {
        $this->line('  <comment>→ Repor sequences PostgreSQL...</comment>');

        foreach ($tables as $table => $rows) {
            if (! Schema::hasTable($table) || empty($rows)) continue;

            // Verificar se tem coluna 'id'
            $cols = Schema::getColumnListing($table);
            if (! in_array('id', $cols)) continue;

            try {
                DB::statement("SELECT setval(pg_get_serial_sequence('{$table}', 'id'), COALESCE((SELECT MAX(id) FROM \"{$table}\"), 0) + 1, false)");
            } catch (\Throwable) {
                // Tabela sem sequence (pivot tables, etc.) — ignorar
            }
        }
    }
}
