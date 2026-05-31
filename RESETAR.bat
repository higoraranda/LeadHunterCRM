@echo off
title LeadHunter - Resetar
echo.
echo  ============================================
echo   LeadHunter - Resetar banco e recompilar
echo  ============================================
echo.
echo  Isso vai APAGAR todos os leads cadastrados
echo  e limpar arquivos de compilacao antigos.
echo.
echo  Feche o INICIAR.bat antes de continuar!
echo.
pause

if exist "%~dp0backend\data" (
  rmdir /s /q "%~dp0backend\data"
  echo  [ok] Banco apagado.
)
if exist "%~dp0backend\target" (
  rmdir /s /q "%~dp0backend\target"
  echo  [ok] Pasta target limpa.
)

echo.
echo  Pronto! Agora voce pode dar dois cliques em
echo  INICIAR.bat que vai comecar do zero.
echo.
pause
