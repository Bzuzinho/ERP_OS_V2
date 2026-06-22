FROM php:8.3-cli-alpine

# Dependências do sistema
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    nodejs \
    npm \
    unzip \
    curl

# Extensões PHP
RUN docker-php-ext-configure gd --with-jpeg \
 && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        gd \
        zip \
        intl \
        bcmath \
        mbstring \
        tokenizer \
        ctype \
        xml \
        fileinfo

# Composer (oficial)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Camadas de cache: dependências antes do código
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --prefer-dist

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Código da aplicação
COPY . .

# Build dos assets Vite
RUN npm run build

# Descobrir packages Laravel
RUN php artisan package:discover --ansi 2>/dev/null || true

# Permissões
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD php artisan migrate --force \
 && (php artisan storage:link --force 2>/dev/null || true) \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
