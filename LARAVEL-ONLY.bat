@echo off
title Laravel - JuntaOS porta 8001
color 0A

cd /d C:\projetos\ERP_OS_V2\ERP_OS_V2

echo ============================================================
echo  A verificar PHP...
echo ============================================================
where php
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] PHP nao esta no PATH!
    echo Adicione a pasta do PHP ao PATH do Windows e tente novamente.
    pause
    exit /b
)

echo.
echo Versao PHP:
php -r "echo PHP_VERSION_ID >= 80100 ? 'OK - ' . PHP_VERSION . PHP_EOL : 'AVISO: PHP ' . PHP_VERSION . ' pode nao ser compativel' . PHP_EOL;"

echo.
echo ============================================================
echo  A limpar cache do Laravel...
echo ============================================================
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo.
echo ============================================================
echo  A iniciar servidor em http://localhost:8001
echo  Pressione Ctrl+C para parar.
echo ============================================================
echo.
php artisan serve --host=127.0.0.1 --port=8001
pause
