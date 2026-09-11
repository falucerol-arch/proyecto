@echo off
setlocal
cd /d "%~dp0"

title Sistema de Administracion de Personal


echo.
echo ==========================================
echo   Iniciando proyecto
echo ==========================================
echo.


REM =========================================================
REM REVISAR SI EL PROYECTO ESTA PREPARADO
REM =========================================================

REM Si falta .env ejecuta setup
if not exist ".env" goto :prepare

REM Si falta SQLite ejecuta setup
if not exist "database\database.sqlite" goto :prepare

REM Si faltan dependencias Laravel ejecuta setup
if not exist "vendor\autoload.php" goto :prepare

REM Si faltan dependencias React ejecuta setup
if not exist "node_modules" goto :prepare


REM Comprueba que exista APP_KEY
findstr /B /C:"APP_KEY=base64:" ".env" >nul 2>&1

if errorlevel 1 goto :prepare


goto :continue



REM =========================================================
REM PREPARAR AUTOMATICAMENTE
REM =========================================================

:prepare

echo Se detecto que el proyecto aun no esta preparado.

call "%~dp0setup.bat" --no-pause

if errorlevel 1 goto :error



REM =========================================================
REM CONTINUAR
REM =========================================================

:continue


REM Verifica PHP
where php >nul 2>&1

if errorlevel 1 (

    echo [ERROR] PHP no esta disponible.

    goto :error
)


REM Verifica npm
where npm.cmd >nul 2>&1

if errorlevel 1 (

    echo [ERROR] npm no esta disponible.

    goto :error
)


REM =========================================================
REM DOCKER
REM =========================================================

where docker >nul 2>&1

if errorlevel 1 (

    echo [ERROR] Docker no esta instalado o no esta disponible.

    goto :error
)


REM Verifica que Docker Desktop este abierto
docker info >nul 2>&1

if errorlevel 1 (

    echo [ERROR] Docker Desktop no esta iniciado.

    echo Abre Docker Desktop y vuelve a ejecutar iniciar.bat.

    goto :error
)


REM =========================================================
REM BASE DE DATOS
REM =========================================================

echo Verificando base de datos...

REM Aplica migraciones nuevas sin eliminar información
php artisan migrate --force

if errorlevel 1 goto :error


REM =========================================================
REM USUARIO DE ACCESO
REM =========================================================

REM Asegura que el administrador siempre exista
php artisan db:seed --force

if errorlevel 1 goto :error


REM =========================================================
REM MINIO
REM =========================================================

echo Iniciando almacenamiento de fotografias...

docker compose up -d

if errorlevel 1 goto :error


REM =========================================================
REM LARAVEL
REM =========================================================

echo Iniciando Laravel...

start "Laravel" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"


REM =========================================================
REM REACT / VITE
REM =========================================================

echo Iniciando React...

REM Se usa npm.cmd para evitar el problema de npm.ps1
start "React - Vite" cmd /k "npm.cmd run dev"


REM =========================================================
REM ABRIR NAVEGADOR
REM =========================================================

REM Espera unos segundos para que Laravel y Vite inicien
timeout /t 4 /nobreak >nul


echo Abriendo sistema...

start "" "http://localhost:8000"


echo.
echo ==========================================
echo   Proyecto iniciado
echo ==========================================
echo.


exit /b 0



REM =========================================================
REM ERROR
REM =========================================================

:error

echo.
echo No se pudo iniciar el proyecto.
echo Revisa el mensaje mostrado arriba.
echo.

pause

exit /b 1