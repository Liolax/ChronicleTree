# Quiet Database Operations

This guide explains how to run database operations without the annoying log shifting and VIPS warning messages.

## Problem
When running `rails db:reset` or `rails db:seed`, you might see many unwanted messages like:
- `log shifting failed. closed stream`
- `VIPS-WARNING **: unable to load vips-heif.dll`
- `The specified module could not be found`

## Solutions

### Option 1: Use the Quiet Batch File (Windows)
```bash
# Run this instead of rails db:reset
./reset_db_quiet.bat
```

### Option 2: Use Custom Rake Tasks
```bash
# Quiet reset
rails db:reset_quiet

# Quiet seed
rails db:seed_quiet
```

### Option 3: Use the Ruby Script
```bash
# Run the quiet reset script
ruby bin/quiet_reset
```

### Option 4: Manual Filtering (PowerShell)
```powershell
rails db:reset 2>&1 | Where-Object { 
    $_ -notmatch "log shifting failed" -and 
    $_ -notmatch "closed stream" -and 
    $_ -notmatch "VIPS-WARNING" -and 
    $_ -notmatch "unable to load" -and 
    $_ -notmatch "\.dll" 
}
```

### Option 5: Manual Filtering (Bash/Git Bash)
```bash
rails db:reset 2>&1 | grep -v "log shifting failed" | grep -v "closed stream" | grep -v "VIPS-WARNING" | grep -v "unable to load" | grep -v "\.dll"
```

## What Was Fixed

1. **Added QuietLogger**: Filters out unwanted messages at the Rails logger level
2. **Created Custom Rake Tasks**: `db:reset_quiet` and `db:seed_quiet` for silent operations
3. **Added Batch File**: `reset_db_quiet.bat` for Windows users
4. **Created Ruby Script**: `bin/quiet_reset` for cross-platform use
5. **Suppressed VIPS Warnings**: Added initializer to suppress VIPS DLL warnings on Windows

## Recommendation

For regular development, use the **batch file** (`./reset_db_quiet.bat`) as it's the simplest solution and filters output effectively.

The logger improvements will also reduce noise during normal development, but for database operations, the batch file provides the cleanest output.