#!/bin/bash
# AUTO_PUSH.sh - Automatically stage, commit, and push changes to GitHub

# Check if there are changes
if git status --porcelain | grep -q .; then
  # Stage all changes
  git add -A
  
  # Commit with message (use provided message or default)
  COMMIT_MSG="${1:-Auto-commit: Updates to HP Home Improvements app}"
  git commit -m "$COMMIT_MSG"
  
  # Push to GitHub
  git push origin main
  
  echo "✅ Changes pushed to GitHub: $COMMIT_MSG"
else
  echo "ℹ️ No changes to commit"
fi
