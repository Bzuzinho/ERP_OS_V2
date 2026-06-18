# ⚡ Quick Start - Junta Operacional

Instalar e rodar a aplicação em 3 minutos.

## ⏱️ 1 minuto: Instalação

```bash
cd C:\projetos\ERP_OS_V2\ERP_OS_V2

# Opção A: Usar script automático (RECOMENDADO para Windows)
INSTALL.bat

# Opção B: Comandos manuais
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

## ⏱️ 2 minuto: Iniciar Servidores

**Terminal 1:**
```bash
php artisan serve
```

**Terminal 2:**
```bash
npm run dev
```

## ⏱️ 3 minuto: Acessar

```
http://localhost:8000
```

## 🔑 Login

- Email: `admin@junta.local`
- Senha: `password`

---

Está pronto! Para mais detalhes, veja:
- [SETUP.md](./SETUP.md) - Instalação detalhada
- [README.md](./README.md) - Documentação completa
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento
