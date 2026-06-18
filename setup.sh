#!/bin/bash

# Script de Setup Automático - Junta Operacional
# Execute: bash setup.sh

set -e  # Parar em caso de erro

echo "=================================================="
echo "🚀 Junta Operacional - Setup Automático"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir sucesso
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Função para imprimir erro
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Função para imprimir info
info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Verificar se está na pasta correta
if [ ! -f "composer.json" ]; then
    error "composer.json não encontrado! Execute este script na raiz do projeto."
fi

# 1. Instalar Dependências PHP
info "Instalando dependências PHP..."
if composer install --no-interaction; then
    success "Dependências PHP instaladas!"
else
    error "Erro ao instalar dependências PHP"
fi
echo ""

# 2. Instalar Dependências Node
info "Instalando dependências Node.js..."
if npm install; then
    success "Dependências Node.js instaladas!"
else
    error "Erro ao instalar dependências Node.js"
fi
echo ""

# 3. Configurar .env
info "Configurando arquivo .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    success "Arquivo .env criado!"
else
    success "Arquivo .env já existe!"
fi
echo ""

# 4. Gerar chave da aplicação
info "Gerando chave de aplicação..."
if php artisan key:generate --quiet; then
    success "Chave gerada!"
else
    error "Erro ao gerar chave"
fi
echo ""

# 5. Executar migrações
info "Executando migrações do banco de dados..."
if php artisan migrate --force --quiet; then
    success "Migrações executadas!"
else
    error "Erro ao executar migrações"
fi
echo ""

# 6. Rodar seeders
info "Carregando dados de demonstração..."
if php artisan db:seed --force --quiet; then
    success "Dados de demo carregados!"
else
    error "Erro ao executar seeders"
fi
echo ""

# 7. Build do frontend
info "Fazendo build dos assets..."
if npm run build; then
    success "Assets compilados!"
else
    error "Erro ao compilar assets"
fi
echo ""

echo "=================================================="
echo -e "${GREEN}✓ Setup concluído com sucesso!${NC}"
echo "=================================================="
echo ""
echo "🎉 Aplicação pronta para uso!"
echo ""
echo "Para iniciar o desenvolvimento:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    php artisan serve"
echo ""
echo "  Terminal 2 (Frontend - opcional):"
echo "    npm run dev"
echo ""
echo "Acesse: http://localhost:8000"
echo ""
echo "Credenciais:"
echo "  Email: admin@junta.local"
echo "  Senha: password"
echo ""
echo "Documentação: START_HERE.md"
echo ""
