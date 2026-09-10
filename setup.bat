@echo off
title Configuracion del proyecto

echo.
echo ========================================
echo Preparando proyecto...
echo ========================================
echo.

REM Crea el archivo .env si todavia no existe
if not exist .env (
    echo Creando archivo .env...
    copy .env.example .env > nul
) else (
    echo El archivo .env ya existe.
)

REM Genera la llave de Laravel
echo.
echo Generando clave de Laravel...
php artisan key:generate

REM Crea SQLite si todavia no existe
if not exist database\database.sqlite (
    echo.
    echo Creando base de datos SQLite...
    type nul > database\database.sqlite
) else (
    echo.
    echo La base de datos SQLite ya existe.
)

REM Inicia MinIO utilizando Docker
echo.
echo Iniciando Docker y MinIO...
docker compose up -d

REM Crea y actualiza las tablas
echo.
echo Preparando base de datos...
php artisan migrate --seed --force

REM Limpia la configuracion de Laravel
echo.
echo Limpiando configuracion...
php artisan optimize:clear

echo.
echo ========================================
echo Proyecto preparado correctamente.
echo ========================================
echo.
echo Ahora ejecute iniciar.bat
echo.

pause