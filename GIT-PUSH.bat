@echo off
title JuntaOS — Git Push
cd /d "%~dp0"

echo ========================================
echo  JuntaOS — Commit e Push para GitHub
echo ========================================
echo.

:: Verificar se git está instalado
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Git nao encontrado no PATH.
    echo Instale em: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Mostrar estado atual
echo Ficheiros alterados:
echo.
git status --short
echo.

:: Pedir mensagem de commit
set /p MSG="Mensagem do commit (Enter para usar data/hora): "
if "%MSG%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set HOJE=%%c-%%b-%%a
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA=%%a%%b
    set MSG=update %HOJE% %HORA%
)

echo.
echo A fazer commit: "%MSG%"
echo.

git add .
git commit -m "%MSG%"

if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Nada para fazer commit ou erro no commit.
    pause
    exit /b 0
)

echo.
echo A fazer push para GitHub...
git push

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Push falhou. Verifique a ligacao e credenciais GitHub.
    echo Dica: git push --force   (se for o primeiro push)
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Push concluido com sucesso!
echo  https://github.com/Bzuzinho/ERP_OS_V2
echo ========================================
echo.
pause
