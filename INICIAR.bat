@echo off
chcp 65001 >nul 2>&1
title EcoTienda POS - Iniciando...

echo.
echo ========================================
echo    ECOTIENDA POS - Sistema de Ventas
echo ========================================
echo.

:: Detectar directorio del script
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Descargalo de https://nodejs.org
    pause
    exit /b 1
)

:: Verificar que existen los directorios
if not exist "%BACKEND%\package.json" (
    echo [ERROR] No se encuentra el backend en: %BACKEND%
    pause
    exit /b 1
)

if not exist "%FRONTEND%\package.json" (
    echo [ERROR] No se encuentra el frontend en: %FRONTEND%
    pause
    exit /b 1
)

:: Instalar dependencias si no existen
if not exist "%BACKEND%\node_modules" (
    echo [INFO] Instalando dependencias del backend...
    cd /d "%BACKEND%"
    call npm install
    echo.
)

if not exist "%FRONTEND%\node_modules" (
    echo [INFO] Instalando dependencias del frontend...
    cd /d "%FRONTEND%"
    call npm install
    echo.
)

:: Inicializar base de datos con seed si no existe
if not exist "%BACKEND%\data\database.sqlite" (
    echo [INFO] Primera ejecucion - creando base de datos...
    cd /d "%BACKEND%"
    call node database/seed.js
    echo.
)

:: Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "127.0.0"') do (
    set "LOCAL_IP=%%a"
    goto :got_ip
)
:got_ip
set "LOCAL_IP=%LOCAL_IP: =%"

echo [OK] Todo listo. Iniciando servicios...
echo.

:: Iniciar Backend en nueva ventana
start "EcoTienda - Backend" cmd /k "cd /d "%BACKEND%" && title EcoTienda - Backend (Puerto 5000) && node server.js"

:: Esperar a que el backend arranque
echo Esperando al backend...
timeout /t 3 /nobreak >nul

:: Iniciar Frontend en nueva ventana
start "EcoTienda - Frontend" cmd /k "cd /d "%FRONTEND%" && title EcoTienda - Frontend (Puerto 5173) && npx vite --host 0.0.0.0"

:: Esperar a que el frontend arranque
timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo    ECOTIENDA POS - ACTIVO
echo ========================================
echo.
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:5173
echo.
if defined LOCAL_IP (
echo    Acceso Red: http://%LOCAL_IP%:5173
echo.
)
echo    Base de datos: SQLite (sin MongoDB)
echo.
echo ========================================
echo    Para detener: cierra las ventanas
echo    del Backend y Frontend
echo ========================================
echo.
pause
