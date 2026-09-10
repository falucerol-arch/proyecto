@echo off
title Iniciar proyecto

echo.
echo ========================================
echo Iniciando proyecto...
echo ========================================
echo.

REM Inicia Docker y MinIO
docker compose up -d

REM Abre Laravel en otra ventana
start "Laravel" cmd /k "php artisan serve"

REM Abre Vite en otra ventana
start "React - Vite" cmd /k "npm run dev"

timeout /t 3 > nul

REM Abre automaticamente el sistema
start http://localhost:8000

exit