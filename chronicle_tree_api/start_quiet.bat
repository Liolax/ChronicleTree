@echo off
REM Start Rails server with VIPS warnings suppressed
REM This batch file filters out VIPS-WARNING messages

set VIPS_WARNING=0
set G_MESSAGES_DEBUG=
set G_DEBUG=

echo Starting Rails server (VIPS warnings suppressed)...
bin\rails s --port=3001 2>&1 | findstr /V "VIPS-WARNING" | findstr /V "unable to load"