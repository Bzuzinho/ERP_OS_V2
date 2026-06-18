@echo off
title JuntaOS - Setup Completo
color 0B

echo.
echo ============================================================
echo  JuntaOS - Setup e Inicializacao
echo ============================================================
echo.

cd /d C:\projetos\ERP_OS_V2\ERP_OS_V2

echo [0/4] A fechar servidores anteriores (se existirem)...
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo OK

echo [1/4] A verificar dependencias PHP...
php -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: PHP nao encontrado. Instale o PHP 8.1+ e adicione ao PATH.
    pause
    exit /b 1
)
echo OK - PHP encontrado.

echo.
echo [2/4] A instalar dependencias PHP (composer)...
composer install --no-interaction
echo OK

echo.
echo [3/4] A executar migrations e dados de demonstracao...
php artisan migrate:fresh --seed --force
echo OK

echo.
echo [4/4] A iniciar servidores...
start "Laravel" cmd /k "php artisan serve --port=8001"
timeout /t 2 /nobreak >nul
start "Vite" cmd /k "npm run dev"

echo.
echo ============================================================
echo  JuntaOS iniciado com sucesso!
echo.
echo  URL: http://localhost:8000
echo.
echo  Credenciais de acesso:
echo    Email:    admin@junta.pt
echo    Password: password
echo ============================================================
echo.
pause
