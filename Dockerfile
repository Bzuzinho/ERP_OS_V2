FROM php:8.3-cli-alpine

# v2 — sem extensoes built-in (tokenizer/ctype/fileinfo ja incluidas no PHP)
# Dependências do sistema para extensões PHP
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    nodejs \
    npm \
    unzip \
    curl \
    git

# Extensões PHP (tokenizer, ctype, fileinfo já vêm embutidas no php:8.3)
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        gd \
        zip \
        intl \
        bcmath \
        mbstring \
        xml

# Composer oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Camadas de cache — dependências antes do código-fonte
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --no-scripts \
        --prefer-dist

COPY package.json package-lock.json ./
RUN npm ci

# Código da aplicação
COPY . .

# Build dos assets Vite
RUN npm run build

# Descobrir packages Laravel
RUN composer run-script post-autoload-dump 2>/dev/null || true

# Permissões de storage
RUN mkdir -p storage/framework/{cache,sessions,views} \
             storage/logs \
             bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD sh -c "php artisan migrate --force \
 && (php artisan storage:link --force 2>/dev/null || true) \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"
