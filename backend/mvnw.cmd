@REM ----------------------------------------------------------------------------
@REM LeadHunter Maven Wrapper (self-contained, only-script style)
@REM Baixa Apache Maven automaticamente em .mvn\maven\ na primeira execucao.
@REM ----------------------------------------------------------------------------
@echo off
setlocal EnableDelayedExpansion

set "BASE_DIR=%~dp0"
set "MVN_VERSION=3.9.9"
set "MAVEN_HOME=%BASE_DIR%.mvn\maven"
set "DIST_URL=https://archive.apache.org/dist/maven/maven-3/%MVN_VERSION%/binaries/apache-maven-%MVN_VERSION%-bin.zip"
set "ZIP_PATH=%BASE_DIR%.mvn\maven.zip"

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo [mvnw] Baixando Apache Maven %MVN_VERSION%...
  if not exist "%BASE_DIR%.mvn" mkdir "%BASE_DIR%.mvn"
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ProgressPreference='SilentlyContinue';" ^
    "Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%ZIP_PATH%'"
  if errorlevel 1 (
    echo [mvnw] ERRO: falha ao baixar Maven de %DIST_URL%
    exit /b 1
  )
  echo [mvnw] Extraindo...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Expand-Archive -Path '%ZIP_PATH%' -DestinationPath '%BASE_DIR%.mvn\' -Force"
  if errorlevel 1 (
    echo [mvnw] ERRO: falha ao extrair
    exit /b 1
  )
  move /Y "%BASE_DIR%.mvn\apache-maven-%MVN_VERSION%" "%MAVEN_HOME%" >nul
  del /Q "%ZIP_PATH%"
  echo [mvnw] Maven instalado em %MAVEN_HOME%
)

if not defined JAVA_HOME (
  for /f "delims=" %%i in ('where java 2^>nul') do (
    set "JAVA_EXE=%%i"
    goto :founddir
  )
  :founddir
)

call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
