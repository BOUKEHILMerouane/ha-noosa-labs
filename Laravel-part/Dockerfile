# Stage 1: Build PHP dependencies with Composer
FROM composer:2 AS vendor

WORKDIR /app

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --no-progress --prefer-dist

# Copy the rest of the application
COPY . .

# Stage 2: PHP runtime with Nginx
FROM php:8.2-fpm-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache nginx bash curl libpng-dev libjpeg-turbo-dev freetype-dev zip unzip git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd bcmath

# Set working directory
WORKDIR /var/www

# Copy app from previous stage
COPY --from=vendor /app ./

# Copy our custom server config
COPY ./nginx.conf /etc/nginx/nginx.conf


# Expose port 8000
EXPOSE 8000

# Fix permissions for Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
