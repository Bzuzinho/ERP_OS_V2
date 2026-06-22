# Deploy no Railway — JuntaOS

## Pré-requisitos
- Conta em [railway.app](https://railway.app) (gratuita)
- Git instalado e repositório inicializado
- GitHub com o código do projecto

---

## Passo 1 — Preparar o repositório

```bash
# Na pasta do projecto
git init                          # se ainda não fizeste
git add .
git commit -m "chore: configuração Railway"
git remote add origin https://github.com/SEU_USER/juntaos.git
git push -u origin main
```

---

## Passo 2 — Criar projecto no Railway

1. Acede a [railway.app](https://railway.app) → **New Project**
2. Escolhe **Deploy from GitHub repo** → selecciona o repositório
3. Railway detecta o `nixpacks.toml` automaticamente

---

## Passo 3 — Adicionar PostgreSQL

1. No painel do projecto → **+ New** → **Database** → **Add PostgreSQL**
2. Railway cria o PostgreSQL e injeta `DATABASE_URL` automaticamente

---

## Passo 4 — Variáveis de ambiente

No Railway → selecciona o serviço da app → **Variables** → adiciona:

| Variável | Valor |
|---|---|
| `APP_NAME` | `Junta Operacional` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | *(ver abaixo)* |
| `APP_URL` | `https://juntaos.up.railway.app` *(URL que Railway te dá)* |
| `SESSION_DRIVER` | `cookie` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `sync` |
| `LOG_CHANNEL` | `stderr` |

### Gerar APP_KEY

```bash
# No teu terminal local:
php artisan key:generate --show
# Copia o resultado (base64:xxx...) e cola no Railway como APP_KEY
```

> **DATABASE_URL** já é injetado pelo Railway automaticamente — não precisas de adicionar DB_* manualmente.

---

## Passo 5 — Domínio

No Railway → serviço → **Settings** → **Networking** → **Generate Domain**

Atualiza `APP_URL` com o domínio gerado.

---

## Deploy automático

A partir daqui, cada `git push origin main` faz deploy automático.

---

## Notas importantes

### Uploads de ficheiros (logos, etc.)
O filesystem do Railway é **efémero** — ficheiros guardados em `storage/app/public` perdem-se entre deploys. Para persistência de uploads:
- Usa **Cloudflare R2** (gratuito até 10GB) ou **AWS S3**
- Instala `league/flysystem-aws-s3-v3` e configura `FILESYSTEM_DISK=s3`

### Seeder inicial
Após o primeiro deploy, podes correr o seeder via Railway Shell:
```bash
php artisan db:seed --class=DatabaseSeeder
```

### Sessões
`SESSION_DRIVER=cookie` é suficiente para esta app e não requer tabela de sessões.

### Cache
`CACHE_STORE=database` requer a tabela `cache` — cria-a com:
```bash
php artisan cache:table
php artisan migrate --force
```
Ou usa `CACHE_STORE=array` (sem persistência, mas mais simples).
