#!/bin/bash
# Install Claude Code Agents
# Run: chmod +x install-agents.sh && ./install-agents.sh

AGENTS_DIR="$HOME/.claude/agents"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Create agents directory if it doesn't exist
mkdir -p "$AGENTS_DIR"

# Copy all agent files
count=0
for agent in "$SCRIPT_DIR"/*.md; do
    if [ -f "$agent" ]; then
        cp "$agent" "$AGENTS_DIR/"
        basename="${agent##*/}"
        echo "Installed: ${basename%.md}"
        ((count++))
    fi
done

echo ""
echo "Successfully installed $count agents to $AGENTS_DIR"
echo "Restart Claude Code or run /agents to load them."
