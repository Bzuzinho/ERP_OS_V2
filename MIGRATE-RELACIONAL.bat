@echo off
echo ============================================================
echo  JuntaOS -- Migracao Relacional
echo ============================================================
echo.
cd /d "%~dp0"

echo A correr migracoes...
php artisan migrate --path=database/migrations/2026_06_17_000001_create_teams_table.php --force
php artisan migrate --path=database/migrations/2026_06_17_000002_create_maintenances_table.php --force
php artisan migrate --path=database/migrations/2026_06_17_000003_create_task_materials_table.php --force
php artisan migrate --path=database/migrations/2026_06_17_000004_alter_existing_tables_relational.php --force

echo.
echo A limpar cache...
php artisan config:clear
php artisan route:clear

echo.
echo ============================================================
echo  CONCLUIDO!
echo  Novos modulos: /equipas  /manutencoes
echo  Inventario com tipos, tarefas com validacao
echo ============================================================
pause
