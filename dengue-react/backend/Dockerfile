FROM php:8.2-apache

# Habilitar el módulo de reescritura de Apache
RUN a2enmod rewrite

# Instalar dependencias necesarias para cURL (el adaptador de Turso usa cURL)
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    && docker-php-ext-install curl

# Copiar todos los archivos del backend al directorio web de Apache
COPY . /var/www/html/

# Configurar permisos para Apache
RUN chown -R www-data:www-data /var/www/html

# Exponer el puerto 80 (Render lo detectará automáticamente)
EXPOSE 80
