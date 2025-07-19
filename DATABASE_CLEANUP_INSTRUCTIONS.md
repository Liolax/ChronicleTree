# 🧹 ChronicleTree Database Cleanup Instructions

## Problem
Your live system may still show "Molly as sister" instead of "grandmother" because the database contains conflicting relationship entries. The algorithm now correctly prioritizes generational relationships, but invalid cross-generational sibling entries should be removed.

## Solution Options

### Option 1: Rails Tasks (Recommended)
```bash
# Navigate to Rails app directory
cd chronicle_tree_api

# Preview what will be cleaned (safe - no changes made)
rails db:cleanup:preview_siblings

# Analyze complete database relationships  
rails db:cleanup:analyze

# Execute cleanup (removes invalid relationships)
rails db:cleanup:fix_siblings
```

### Option 2: Ruby Console
```ruby
# Start Rails console
rails console

# Preview cleanup
DatabaseCleanupPreview.preview_cleanup

# Execute cleanup
DatabaseCleanupService.clean_cross_generational_siblings
```

### Option 3: Direct SQL (Advanced Users)
```sql
-- Use the provided database_cleanup.sql file
-- 1. Run the SELECT query to preview what will be removed
-- 2. Uncomment and run the DELETE statement to clean up
-- 3. Run verification queries to confirm cleanup
```

## What Gets Cleaned
- ❌ **Removes**: Invalid sibling relationships between different generations (e.g., Molly ↔ Alice marked as "Siblings")
- ✅ **Keeps**: All valid parent-child, grandparent-grandchild relationships
- ✅ **Keeps**: Legitimate same-generation sibling relationships

## After Cleanup
- Molly will correctly show as "Grandmother" to Alice/Charlie
- All relationship calculations will work perfectly
- No valid relationships will be affected

## Safety Features
- **Preview Mode**: See exactly what will be changed before making any modifications
- **Confirmation Required**: Rails tasks ask for confirmation before making changes  
- **Backup Recommended**: Consider backing up your database before running cleanup
- **Selective Removal**: Only removes relationships that violate generational logic

## Verification
After cleanup, test these relationships in your frontend:
- Molly → Alice: Should show "Grandmother" ✅
- Molly → Charlie: Should show "Grandmother" ✅  
- Alice → Charlie: Should show "Sister" or "Brother" ✅
- All other relationships should work correctly ✅

## Support
If you encounter any issues:
1. Check the Rails logs for error messages
2. Run the analysis task to see current database state
3. Use preview mode to understand what needs to be cleaned
4. The relationship calculator algorithm is now robust and will handle edge cases gracefully
