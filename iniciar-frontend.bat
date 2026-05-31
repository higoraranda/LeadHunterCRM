@echo off
title LeadHunter - Frontend (porta 5173)
cd /d "%~dp0frontend"
echo.
echo ============================================
echo  LeadHunter FRONTEND - iniciando...
echo ============================================
echo.
if not exist "node_modules" (
  echo Instalando dependencias pela primeira vez...
  call npm install
)
call npm run dev
pause
