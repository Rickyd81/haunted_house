@echo off
rem Invia su GitHub gli ultimi commit di Villa Morgrave
cd /d "%~dp0"
git push
echo.
echo Fatto. Il gioco online si aggiorna in un paio di minuti.
pause
