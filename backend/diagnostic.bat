@echo off
echo ==========================================
echo Smart Campus Hub - Connection Diagnostic
echo ==========================================

set DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com

echo 1. Checking DNS resolution for %DB_HOST%...
nslookup %DB_HOST%
if %errorlevel% neq 0 (
    echo [ERROR] Could not resolve hostname. Check your internet connection or DNS settings.
) else (
    echo [OK] Hostname resolved successfully.
)

echo.
echo 2. Checking connectivity to port 6543...
powershell -Command "Test-NetConnection -ComputerName %DB_HOST% -Port 6543"
if %errorlevel% neq 0 (
    echo [ERROR] Could not connect to port 6543. This might be blocked by a firewall or the project is paused.
) else (
    echo [OK] Port 6543 is reachable.
)

echo.
echo 3. Checking for project pause status...
echo Please visit https://app.supabase.com/ and check if your project is 'Paused'.
echo If it is, click 'Restore project'.

echo.
echo ==========================================
pause
