@echo off
title LeadHunter - Iniciando tudo
echo.
echo  ============================================
echo   LeadHunter - abrindo backend e frontend
echo  ============================================
echo.
echo  Vao abrir 2 janelas pretas. NAO feche elas
echo  enquanto estiver usando o sistema.
echo.
echo  Para USAR o sistema, abra no navegador:
echo      http://localhost:5173
echo.
echo  Para PARAR tudo, feche as 2 janelas pretas.
echo.
timeout /t 4 >nul

start "" "%~dp0iniciar-backend.bat"
timeout /t 3 >nul
start "" "%~dp0iniciar-frontend.bat"

echo.
echo  Pronto! Espere uns 1-2 minutos e abra:
echo      http://localhost:5173
echo.
timeout /t 8 >nul
start "" http://localhost:5173
exit
