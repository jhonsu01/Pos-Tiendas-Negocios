@echo off
chcp 65001 >nul 2>&1
title EcoTienda POS - Gestion de Usuarios y Licencias
cd /d "%~dp0backend"
node admin_cli.js
pause
