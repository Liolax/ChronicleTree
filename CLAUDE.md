# CLAUDE.md

## Instructions for Claude

### Test File Organization
- Move all Ruby test files (`*.rb`) to the `chronicle_tree_api/backend_tests` folder.
- Move all JavaScript test files (`*.js`) to the `chronicle_tree_client/frontend_tests` folder.
- Update any imports or requires as needed after moving files.

### Family Tree UI Features
- By default, hide all nodes marked as "Unrelated" to the root person in the family tree visualization.
- Add a button near the "Share Tree" and "Fit Tree" buttons labeled "Show Unrelated". When clicked, it toggles to "Hide Unrelated" and shows/hides unrelated nodes.

### Profile Page Relationships Section
- In the Relationships section, display step relationships (step-parent, step-child) under Parents and Children, with the word "(step)" after the person's name.

### Share Functionality
- Ensure both "Share Tree" and "Share Profile" buttons generate a snapshot below the button.
- The snapshot should be shareable via all sharing options provided (social, email, copy link, etc).

### Getting Started with Claude
1. Run `/init` to create this CLAUDE.md file.
2. Use Claude for file analysis, editing, bash commands, and git operations.
3. Be specific in your requests for best results.
4. Start with small features or bug fixes, ask Claude to propose a plan, and verify its suggested edits.

---

## Example Commands
- `edit <filepath> to ...` — Ask Claude to edit a file with a specific change.
- `move <source> <destination>` — Move files or folders.
- `analyze <filepath>` — Get a summary or analysis of a file.
- `run <bash command>` — Run a bash command in the terminal.
- `git <git command>` — Run a git command.

---

## Tips
- Use clear, step-by-step instructions for best results.
- Review Claude's proposed changes before accepting.
- Use the toggle button to show/hide unrelated nodes for better tree clarity.
- Keep test files organized for easier maintenance.
- Ensure sharing features work for both tree and profile snapshots.

---

For shortcuts and more help, type `?` in the Claude terminal.
