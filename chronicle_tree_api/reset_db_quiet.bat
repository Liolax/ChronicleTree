@echo off
echo Resetting database quietly...

REM Set environment variables to suppress warnings
set RAILS_LOG_LEVEL=error
set VIPS_WARNING=0
set G_MESSAGES_DEBUG=

REM Run rails db:reset and filter output
rails db:reset 2>&1 | findstr /v /c:"log shifting failed" | findstr /v /c:"closed stream" | findstr /v /c:"VIPS-WARNING" | findstr /v /c:"unable to load" | findstr /v /c:".dll"

if %errorlevel% == 0 (
    echo.
    echo OK Database reset completed successfully!
) else (
    echo.
    echo ERROR Database reset failed!
    pause
    exit /b 1
)

pause