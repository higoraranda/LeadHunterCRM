@echo off
title LeadHunter - Backend (porta 8080)
cd /d "%~dp0backend"
echo.
echo ============================================
echo  LeadHunter BACKEND - iniciando...
echo  (na primeira vez demora uns 2 minutos)
echo ============================================
echo.

set JAR=target\leadhunter-backend-0.0.1.jar

if not exist "%JAR%" (
  echo  [build] Compilando o backend pela primeira vez...
  call mvnw.cmd package -DskipTests
  if errorlevel 1 (
    echo.
    echo  [ERRO] Falha ao compilar o backend.
    pause
    exit /b 1
  )
)

echo.
echo  [run] Subindo servidor em http://localhost:8080
echo.
java -jar "%JAR%"
pause
