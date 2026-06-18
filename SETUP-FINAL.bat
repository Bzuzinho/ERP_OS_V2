@echo off
title Junta Operacional - Setup Final
color 0A
cls

echo.
echo ============================================================================
echo   JUNTA OPERACIONAL - SETUP FINAL (Tudo vai ser instalado automaticamente)
echo ============================================================================
echo.

cd /d "%~dp0"

echo [1/5] Removendo caches antigos...
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist vendor rmdir /s /q vendor >nul 2>&1
del package-lock.json >nul 2>&1
del composer.lock >nul 2>&1
echo     OK!
echo.

echo [2/5] Instalando dependencias PHP...
call composer install --no-interaction >nul 2>&1
if errorlevel 1 goto :error
echo     OK!
echo.

echo [3/5] Instalando dependencias Node...
call cmd /c npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 goto :error
echo     OK!
echo.

echo [4/5] Configurando e migrando banco de dados...
copy .env.example .env >nul 2>&1
call php artisan key:generate --quiet
call php artisan migrate:fresh --seed --force --quiet
if errorlevel 1 goto :error
echo     OK!
echo.

echo [5/5] Compilando assets...
call cmd /c npm run build >nul 2>&1
echo     OK!
echo.

cls
color 0B
echo.
echo ============================================================================
echo   ✓ SETUP CONCLUIDO COM SUCESSO!
echo ============================================================================
echo.
echo.
echo   🚀 PRONTO PARA DESENVOLVIMENTO!
echo.
echo.
echo   Abra DOIS TERMINAIS na pasta do projeto:
echo.
echo   ┌─ Terminal 1 (Backend/API) ────────────────────────────────────┐
echo   │ $ php artisan serve                                            │
echo   │ Acesso: http://localhost:8000                                  │
echo   └────────────────────────────────────────────────────────────────┘
echo.
echo   ┌─ Terminal 2 (Frontend/Vite) ──────────────────────────────────┐
echo   │ $ npm run dev                                                  │
echo   │ Hot reload: http://localhost:5173                              │
echo   └────────────────────────────────────────────────────────────────┘
echo.
echo.
echo   CREDENCIAIS DE LOGIN:
echo   ├─ Email: admin@junta.local
echo   └─ Senha: password
echo.
echo.
echo   DOCUMENTAÇÃO:
echo   ├─ START_HERE.md     (Guia rápido)
echo   ├─ DEVELOPMENT.md    (Como desenvolver)
echo   └─ ARCHITECTURE.md   (Visão técnica)
echo.
echo.
color 0A
pause
