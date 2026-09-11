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
REM VERIFICAR PROGRAMAS NECESARIOS
REM =========================================================

REM Verifica PHP
where php >nul 2>&1

if errorlevel 1 (
    echo [ERROR] PHP no esta disponible.
    echo Instala Laravel Herd o PHP 8.3+ y vuelve a ejecutar este archivo.
    goto :error
)


REM Verifica Composer
where composer >nul 2>&1

if errorlevel 1 (
    echo [ERROR] Composer no esta disponible.
    echo Instala Composer o Laravel Herd y vuelve a ejecutar este archivo.
    goto :error
)


REM Verifica Node
where node >nul 2>&1

if errorlevel 1 (
    echo [ERROR] Node.js no esta disponible.
    echo Instala Node.js y vuelve a ejecutar este archivo.
    goto :error
)


REM Verifica npm.
REM Se utiliza npm.cmd para evitar el bloqueo de npm.ps1 en PowerShell
where npm.cmd >nul 2>&1

if errorlevel 1 (
    echo [ERROR] npm no esta disponible.
    echo Instala Node.js y vuelve a ejecutar este archivo.
    goto :error
)


REM Verifica Docker
where docker >nul 2>&1

if errorlevel 1 (
    echo [ERROR] Docker no esta disponible.
    echo Instala Docker Desktop y vuelve a ejecutar este archivo.
    goto :error
)


REM =========================================================
REM COMPROBAR QUE DOCKER DESKTOP ESTE INICIADO
REM =========================================================

docker info >nul 2>&1

if errorlevel 1 (
    echo [ERROR] Docker Desktop esta instalado, pero no esta iniciado.
    echo Abre Docker Desktop, espera a que termine de iniciar y vuelve a intentarlo.
    goto :error
)


REM =========================================================
REM DEPENDENCIAS DE LARAVEL
REM =========================================================

REM Si vendor no existe instala Composer automáticamente
if not exist "vendor\autoload.php" (

    echo.
    echo Instalando dependencias de Laravel...

    call composer install

    if errorlevel 1 goto :error

) else (

    echo Dependencias de Laravel listas.
)


REM =========================================================
REM DEPENDENCIAS DE REACT
REM =========================================================

REM Si node_modules no existe instala las dependencias
if not exist "node_modules" (

    echo.
    echo Instalando dependencias de React...

    call npm.cmd install

    if errorlevel 1 goto :error

) else (

    echo Dependencias de React listas.
)


REM =========================================================
REM CREAR .ENV
REM =========================================================

REM Si .env no existe lo copia desde .env.example
if not exist ".env" (

    echo.
    echo Creando archivo .env...

    copy /Y ".env.example" ".env" >nul

) else (

    echo El archivo .env ya existe.
)


REM =========================================================
REM APP_KEY
REM =========================================================

REM Revisa si Laravel ya tiene una APP_KEY
findstr /B /C:"APP_KEY=base64:" ".env" >nul 2>&1

if errorlevel 1 (

    echo.
    echo Generando clave de Laravel...

    php artisan key:generate --force

    if errorlevel 1 goto :error

) else (

    echo La clave de Laravel ya existe.
)


REM =========================================================
REM SQLITE
REM =========================================================

REM Si la base de datos no existe la crea automáticamente
if not exist "database\database.sqlite" (

    echo.
    echo Creando base de datos SQLite...

    type nul > "database\database.sqlite"

) else (

    echo La base de datos SQLite ya existe.
)


REM =========================================================
REM LIMPIAR CACHE
REM =========================================================

php artisan optimize:clear

if errorlevel 1 goto :error


REM =========================================================
REM MIGRACIONES
REM =========================================================

echo.
echo Preparando base de datos...

REM Crea o actualiza las tablas sin borrar información
php artisan migrate --force

if errorlevel 1 goto :error


REM =========================================================
REM USUARIO DE ACCESO
REM =========================================================

echo.
echo Preparando usuario de acceso...

REM Ejecuta el seeder
php artisan db:seed --force

if errorlevel 1 goto :error


REM =========================================================
REM DOCKER Y MINIO
REM =========================================================

echo.
echo Iniciando Docker y MinIO...

docker compose up -d

if errorlevel 1 goto :error


echo.
echo ========================================
echo   Proyecto preparado correctamente
echo ========================================
echo.

echo Usuario de acceso:
echo.

echo Correo: admin@proyecto.com
echo Contrasena: Admin12345

echo.

echo Ahora puedes ejecutar iniciar.bat

echo.


REM Si fue llamado desde iniciar.bat no hace pausa
if /I "%~1"=="--no-pause" goto :success

pause


:success

exit /b 0


:error

echo.
echo ========================================
echo   No se pudo preparar el proyecto
echo ========================================

echo Revisa el mensaje de error mostrado arriba.

echo.

if /I not "%~1"=="--no-pause" pause

exit /b 1