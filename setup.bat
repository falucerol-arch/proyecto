@echo off
setlocal
cd /d "%~dp0"

title Configuracion del proyecto

echo.
echo ========================================
echo   Preparando proyecto
echo ========================================
echo.


REM =========================================================
REM VERIFICAR PHP
REM =========================================================

where php >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERROR] PHP no esta disponible.
    echo Instala Laravel Herd y vuelve a intentarlo.
    goto :error
)

echo [OK] PHP encontrado.


REM =========================================================
REM VERIFICAR COMPOSER
REM =========================================================

where composer >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERROR] Composer no esta disponible.
    echo Instala Composer o Laravel Herd.
    goto :error
)

echo [OK] Composer encontrado.


REM =========================================================
REM VERIFICAR NODE
REM =========================================================

where node >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERROR] Node.js no esta disponible.
    goto :error
)

echo [OK] Node.js encontrado.


REM =========================================================
REM VERIFICAR NPM
REM =========================================================

where npm.cmd >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERROR] npm no esta disponible.
    goto :error
)

echo [OK] npm encontrado.


REM =========================================================
REM VERIFICAR DOCKER
REM =========================================================

where docker >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERROR] Docker no esta disponible.
    goto :error
)

echo [OK] Docker encontrado.


REM =========================================================
REM VERIFICAR DOCKER DESKTOP
REM =========================================================

docker info >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERROR] Docker Desktop esta instalado pero no esta iniciado.
    echo Abre Docker Desktop y espera unos segundos.
    goto :error
)

echo [OK] Docker Desktop iniciado.


REM =========================================================
REM INSTALAR DEPENDENCIAS PHP
REM =========================================================

if not exist "vendor\autoload.php" (

    echo.
    echo Instalando dependencias de Laravel...

    call composer install

    if errorlevel 1 goto :error

) else (

    echo [OK] Dependencias Laravel instaladas.
)


REM =========================================================
REM INSTALAR DEPENDENCIAS FRONTEND
REM =========================================================

if not exist "node_modules" (

    echo.
    echo Instalando dependencias de React...

    call npm.cmd install

    if errorlevel 1 goto :error

) else (

    echo [OK] Dependencias React instaladas.
)


REM =========================================================
REM CREAR .ENV
REM =========================================================

if not exist ".env" (

    echo.
    echo Creando archivo .env...

    copy /Y ".env.example" ".env" >nul

    if errorlevel 1 goto :error

) else (

    echo [OK] Archivo .env existente.
)


REM =========================================================
REM FORZAR CONFIGURACION SEGURA PARA INSTALACION LOCAL
REM =========================================================

echo.
echo Configurando sesiones y cache local...

powershell -NoProfile -Command ^
"(Get-Content '.env') ^
-replace '^SESSION_DRIVER=.*','SESSION_DRIVER=file' ^
-replace '^CACHE_STORE=.*','CACHE_STORE=file' ^
-replace '^QUEUE_CONNECTION=.*','QUEUE_CONNECTION=sync' ^
| Set-Content '.env'"

if errorlevel 1 goto :error


REM =========================================================
REM LIMPIAR SOLO CONFIGURACION ANTERIOR
REM =========================================================

REM IMPORTANTE:
REM Aqui NO usamos optimize:clear porque todavia no
REM sabemos si existen las tablas de la base de datos.

php artisan config:clear

if errorlevel 1 goto :error


REM =========================================================
REM GENERAR APP_KEY
REM =========================================================

findstr /B /C:"APP_KEY=base64:" ".env" >nul 2>&1

if errorlevel 1 (

    echo.
    echo Generando APP_KEY...

    php artisan key:generate --force

    if errorlevel 1 goto :error

) else (

    echo [OK] APP_KEY existente.
)


REM =========================================================
REM CREAR SQLITE
REM =========================================================

if not exist "database\database.sqlite" (

    echo.
    echo Creando base de datos SQLite...

    type nul > "database\database.sqlite"

) else (

    echo [OK] Base de datos SQLite existente.
)


REM =========================================================
REM EJECUTAR MIGRACIONES
REM =========================================================

echo.
echo Ejecutando migraciones...

php artisan migrate --force

if errorlevel 1 goto :error


REM =========================================================
REM CREAR USUARIO ADMINISTRADOR
REM =========================================================

echo.
echo Creando usuario de acceso...

php artisan db:seed --force

if errorlevel 1 goto :error


REM =========================================================
REM AHORA SI LIMPIAR CACHE
REM =========================================================

REM Ya existe la base de datos y las migraciones terminaron.

echo.
echo Limpiando cache de Laravel...

php artisan optimize:clear

if errorlevel 1 goto :error


REM =========================================================
REM INICIAR MINIO
REM =========================================================

echo.
echo Iniciando MinIO...

docker compose up -d

if errorlevel 1 goto :error


REM =========================================================
REM FINAL
REM =========================================================

echo.
echo ========================================
echo   PROYECTO PREPARADO CORRECTAMENTE
echo ========================================
echo.
echo Usuario de acceso:
echo.
echo Correo: admin@proyecto.com
echo Contrasena: Admin12345
echo.
echo Ahora ejecuta:
echo.
echo iniciar.bat
echo.


if /I "%~1"=="--no-pause" goto :success

pause


:success

exit /b 0


:error

echo.
echo ========================================
echo   ERROR AL PREPARAR EL PROYECTO
echo ========================================
echo.
echo Revisa el mensaje mostrado arriba.
echo.

if /I not "%~1"=="--no-pause" pause

exit /b 1