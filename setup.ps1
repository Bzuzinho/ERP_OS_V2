# Script de Setup Automático - Junta Operacional (PowerShell)
# Execute: .\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 Junta Operacional - Setup Automático" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (!(Test-Path "composer.json")) {
    Write-Host "✗ composer.json não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script na raiz do projeto." -ForegroundColor Red
    exit 1
}

# 1. Instalar Dependências PHP
Write-Host "➜ Instalando dependências PHP..." -ForegroundColor Yellow
try {
    & composer install --no-interaction
    Write-Host "✓ Dependências PHP instaladas!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao instalar dependências PHP" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Instalar Dependências Node
Write-Host "➜ Instalando dependências Node.js..." -ForegroundColor Yellow
try {
    & npm install
    Write-Host "✓ Dependências Node.js instaladas!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao instalar dependências Node.js" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Configurar .env
Write-Host "➜ Configurando arquivo .env..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Arquivo .env criado!" -ForegroundColor Green
} else {
    Write-Host "✓ Arquivo .env já existe!" -ForegroundColor Green
}
Write-Host ""

# 4. Gerar chave da aplicação
Write-Host "➜ Gerando chave de aplicação..." -ForegroundColor Yellow
try {
    & php artisan key:generate --quiet
    Write-Host "✓ Chave gerada!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao gerar chave" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Executar migrações
Write-Host "➜ Executando migrações do banco de dados..." -ForegroundColor Yellow
try {
    & php artisan migrate --force --quiet
    Write-Host "✓ Migrações executadas!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao executar migrações" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Rodar seeders
Write-Host "➜ Carregando dados de demonstração..." -ForegroundColor Yellow
try {
    & php artisan db:seed --force --quiet
    Write-Host "✓ Dados de demo carregados!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao executar seeders" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. Build do frontend
Write-Host "➜ Fazendo build dos assets..." -ForegroundColor Yellow
try {
    & npm run build
    Write-Host "✓ Assets compilados!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao compilar assets" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Green
Write-Host "✓ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Aplicação pronta para uso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o desenvolvimento:"
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "    php artisan serve"
Write-Host ""
Write-Host "  Terminal 2 (Frontend - opcional):" -ForegroundColor Cyan
Write-Host "    npm run dev"
Write-Host ""
Write-Host "Acesse: http://localhost:8000"
Write-Host ""
Write-Host "Credenciais:"
Write-Host "  Email: admin@junta.local"
Write-Host "  Senha: password"
Write-Host ""
Write-Host "Documentação: START_HERE.md"
Write-Host ""
