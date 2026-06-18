@echo off
title JuntaOS - Iniciar Servidores
color 0A

echo.
echo ============================================================
echo  JuntaOS - Servidores de Desenvolvimento
echo ============================================================
echo.

cd /d C:\projetos\ERP_OS_V2\ERP_OS_V2

REM --- Verificar PHP ---
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] PHP nao encontrado no PATH!
    echo.
    echo Solucao: adicione o PHP ao PATH do Windows, por exemplo:
    echo   C:\php  ou  C:\xampp\php  ou  C:\laragon\bin\php\php8.x
    echo.
    pause
    exit /b 1
)

REM --- Verificar Node/npm ---
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js / npm nao encontrado no PATH!
    echo Instale em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo PHP encontrado:
php -r "echo PHP_VERSION . PHP_EOL;"

echo.
echo A abrir janela do Laravel (porta 8001)...
start "Laravel - JuntaOS [porta 8001]" cmd /k "cd /d C:\projetos\ERP_OS_V2\ERP_OS_V2 & echo Iniciando Laravel... & php artisan serve --port=8001 & pause"

timeout /t 3 /nobreak >nul

echo A abrir janela do Vite (assets)...
start "Vite - JuntaOS [assets]" cmd /k "cd /d C:\projetos\ERP_OS_V2\ERP_OS_V2 & echo Iniciando Vite... & npm run dev & pause"

echo.
echo ============================================================
echo  Servidores a iniciar em janelas separadas!
echo.
echo  URL:      http://localhost:8001
echo  Login:    admin@junta.pt
echo  Password: password
echo ============================================================
echo.
pause
