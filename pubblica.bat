@echo off
rem Sincronizza e invia su GitHub gli aggiornamenti di Villa Morgrave
cd /d "%~dp0"
git pull --rebase
git push
echo.
echo Fatto. Il gioco online si aggiorna in un paio di minuti.
pause
