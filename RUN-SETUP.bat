@echo off
REM Junta Operacional - Setup Automático Completo
setlocal enabledelayedexpansion

echo.
echo ================================================
echo  Junta Operacional - Setup Automático
echo ================================================
echo.

REM Verificar se está na pasta correta
if not exist "composer.json" (
    echo Erro: composer.json nao encontrado!
    echo Execute este script a partir da pasta raiz do projeto.
    pause
    exit /b 1
)

REM 1. Limpar composer.lock antigo
echo [1/7] Limpando cache do Composer...
if exist "composer.lock" (
    del composer.lock
    echo. Arquivo composer.lock removido.
)
echo.

REM 2. Instalar Dependências PHP
echo [2/7] Instalando dependencias PHP...
call composer install --no-interaction
if errorlevel 1 (
    echo Erro ao instalar dependencias PHP!
    pause
    exit /b 1
)
echo Sucesso - Dependencias PHP instaladas!
echo.

REM 3. Instalar Dependências Node
echo [3/7] Instalando dependencias Node.js...
call npm install
if errorlevel 1 (
    echo Erro ao instalar dependencias Node.js!
    pause
    exit /b 1
)
echo Sucesso - Dependencias Node.js instaladas!
echo.

REM 4. Configurar .env
echo [4/7] Configurando arquivo .env...
if not exist ".env" (
    copy .env.example .env
    echo Sucesso - Arquivo .env criado!
) else (
    echo. Arquivo .env ja existe!
)
echo.

REM 5. Gerar chave de aplicacao
echo [5/7] Gerando chave de aplicacao...
call php artisan key:generate
if errorlevel 1 (
    echo Erro ao gerar chave!
    pause
    exit /b 1
)
echo Sucesso - Chave gerada!
echo.

REM 6. Executar migrações
echo [6/7] Executando migracoes do banco de dados...
call php artisan migrate --force
if errorlevel 1 (
    echo Erro ao executar migracoes!
    pause
    exit /b 1
)
echo Sucesso - Migracoes executadas!
echo.

REM 7. Rodar seeders
echo [7/7] Carregando dados de demonstracao...
call php artisan db:seed --force
if errorlevel 1 (
    echo Erro ao executar seeders!
    pause
    exit /b 1
)
echo Sucesso - Dados de demo carregados!
echo.

echo ================================================
echo  SETUP CONCLUIDO COM SUCESSO!
echo ================================================
echo.
echo Aplicacao pronta para desenvolvimento!
echo.
echo PROXIMOS PASSOS:
echo.
echo 1. Abra um NOVO PowerShell/CMD nesta pasta
echo.
echo 2. Terminal 1 - Rodar servidor Laravel:
echo    php artisan serve
echo.
echo 3. Terminal 2 (novo) - Rodar Vite (frontend):
echo    npm run dev
echo.
echo 4. Acesse no navegador:
echo    http://localhost:8000
echo.
echo CREDENCIAIS DE LOGIN:
echo    Email: admin@junta.local
echo    Senha: password
echo.
echo Para mais informacoes, leia:
echo    START_HERE.md
echo.
pause
