#!/usr/bin/env bash
set -euo pipefail

PORT=10001

if curl -fsS http://localhost:$PORT/health > /dev/null; then
 echo \"Server running → EXIT\"
 exit 0
fi

PID=\$(lsof -t -i :\$PORT 2>/dev/null || true)

if [ -n \"\$PID\" ]; then
 echo \"Kill \$PID\"
 kill -9 \$PID
fi

node backend/server.js