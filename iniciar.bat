@echo off
cd /d "%~dp0"
title Sistema de Administracion de Personal

echo.
echo ==========================================
echo   Iniciando proyecto
echo ==========================================
echo.

REM ------------------------------------------------
REM Si no existe .env, lo crea automaticamente
REM ------------------------------------------------
if not exist ".env" (
    echo Preparando archivo de configuracion...
    copy ".env.example" ".env" > nul

    echo Generando clave de Laravel...
    php artisan key:generate
)

REM ------------------------------------------------
REM Si no existe SQLite, significa que es la primera
REM vez que se ejecuta el proyecto en esta computadora
REM ------------------------------------------------
if not exist "database\database.sqlite" (

    echo.
    echo Primera ejecucion detectada.
    echo Preparando base de datos...

    type nul > "database\database.sqlite"

    echo Creando tablas y datos iniciales...
    php artisan migrate --seed --force

) else (

    REM Aplica migraciones nuevas sin borrar informacion
    echo Verificando base de datos...
    php artisan migrate --force
)

REM ------------------------------------------------
REM Inicia Docker y MinIO para las fotografias
REM ------------------------------------------------
echo.
echo Iniciando almacenamiento de fotografias...

docker compose up -d

REM ------------------------------------------------
REM Limpia cache de Laravel
REM ------------------------------------------------
php artisan optimize:clear

REM ------------------------------------------------
REM Inicia Laravel
REM ------------------------------------------------
echo.
echo Iniciando Laravel...

start "Laravel" cmd /k "php artisan serve"

REM ------------------------------------------------
REM Inicia React / Vite
REM ------------------------------------------------
echo Iniciando React...

start "React - Vite" cmd /k "npm.cmd run dev"

REM Espera unos segundos antes de abrir el navegador
timeout /t 4 /nobreak > nul

REM ------------------------------------------------
REM Abre el sistema
REM ------------------------------------------------
echo Abriendo sistema...

start "" "http://localhost:8000"

echo.
echo ==========================================
echo   Proyecto iniciado
echo ==========================================
echo.

exit