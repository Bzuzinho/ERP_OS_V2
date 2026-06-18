@echo off
REM Junta Operacional - Script de Instalação Rápida para Windows

echo ============================================
echo Junta Operacional - Instalação Rápida
echo ============================================
echo.

REM Verificar se está na pasta correta
if not exist "composer.json" (
    echo Erro: composer.json não encontrado!
    echo Execute este script a partir da pasta raiz do projeto.
    pause
    exit /b 1
)

echo [1/6] Instalando dependências PHP...
call composer install
if errorlevel 1 (
    echo Erro ao instalar dependências PHP!
    pause
    exit /b 1
)
echo ✓ Dependências PHP instaladas!
echo.

echo [2/6] Instalando dependências Node.js...
call npm install
if errorlevel 1 (
    echo Erro ao instalar dependências Node.js!
    pause
    exit /b 1
)
echo ✓ Dependências Node.js instaladas!
echo.

echo [3/6] Copiando arquivo .env...
if not exist ".env" (
    copy .env.example .env
    echo ✓ Arquivo .env criado!
) else (
    echo ✓ Arquivo .env já existe!
)
echo.

echo [4/6] Gerando chave de aplicação...
call php artisan key:generate
echo ✓ Chave gerada!
echo.

echo [5/6] Executando migrações do banco de dados...
call php artisan migrate
if errorlevel 1 (
    echo Erro ao executar migrações!
    pause
    exit /b 1
)
echo ✓ Migrações executadas!
echo.

echo [6/6] Carregando dados de demonstração...
call php artisan db:seed
if errorlevel 1 (
    echo Erro ao executar seeders!
    pause
    exit /b 1
)
echo ✓ Dados de demonstração carregados!
echo.

echo ============================================
echo ✓ Instalação concluída com sucesso!
echo ============================================
echo.
echo Próximos passos:
echo.
echo 1. Abra um terminal e execute:
echo    php artisan serve
echo.
echo 2. Em outro terminal, execute:
echo    npm run dev
echo.
echo 3. Acesse: http://localhost:8000
echo.
echo Credenciais de acesso:
echo Email: admin@junta.local
echo Senha: password
echo.
pause
