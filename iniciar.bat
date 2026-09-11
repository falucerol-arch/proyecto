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
REM PREPARAR / VERIFICAR EL PROYECTO
REM =========================================================

echo Verificando configuracion del proyecto...
echo.

call "%~dp0setup.bat" --no-pause

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo preparar el proyecto.
    goto :error
)


REM =========================================================
REM VERIFICAR BASE DE DATOS
REM =========================================================

echo.
echo Verificando base de datos...

php artisan migrate --force

if errorlevel 1 (
    echo [ERROR] Fallaron las migraciones.
    goto :error
)


REM =========================================================
REM ASEGURAR USUARIO ADMINISTRADOR
REM =========================================================

echo.
echo Verificando usuario de acceso...

php artisan db:seed --force

if errorlevel 1 (
    echo [ERROR] No se pudo crear el usuario de acceso.
    goto :error
)


REM =========================================================
REM INICIAR MINIO
REM =========================================================

echo.
echo Iniciando almacenamiento de fotografias...

docker compose up -d

if errorlevel 1 (
    echo [ERROR] No se pudo iniciar Docker / MinIO.
    goto :error
)


REM =========================================================
REM LIMPIAR CONFIGURACION DE LARAVEL
REM =========================================================

echo.
echo Actualizando configuracion...

php artisan config:clear

if errorlevel 1 (
    echo [ERROR] No se pudo limpiar la configuracion.
    goto :error
)


REM =========================================================
REM INICIAR LARAVEL
REM =========================================================

echo.
echo Iniciando Laravel...

start "Laravel" cmd /k "cd /d ""%~dp0"" && php artisan serve --host=127.0.0.1 --port=8000"


REM =========================================================
REM INICIAR REACT / VITE
REM =========================================================

echo Iniciando React...

start "React - Vite" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev"


REM =========================================================
REM ESPERAR Y ABRIR NAVEGADOR
REM =========================================================

echo.
echo Esperando a que los servicios inicien...

timeout /t 5 /nobreak >nul

echo Abriendo sistema...

start "" "http://localhost:8000"


echo.
echo ==========================================
echo   PROYECTO INICIADO CORRECTAMENTE
echo ==========================================
echo.
echo Direccion:
echo http://localhost:8000
echo.
echo Usuario:
echo admin@proyecto.com
echo.
echo Contrasena:
echo Admin12345
echo.

exit /b 0


:error

echo.
echo ==========================================
echo   ERROR AL INICIAR EL PROYECTO
echo ==========================================
echo.
echo Revisa el mensaje mostrado arriba.
echo.

pause

exit /b 1