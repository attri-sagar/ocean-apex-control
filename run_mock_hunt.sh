#!/bin/bash

# Configuration
TASK_ID=$1
API_URL="http://127.0.0.1:8080/functions/v1/ai-tasks"
SECRET="dev-local-secret"

# Function to make API calls
function api_call() {
  local payload=$1
  curl -sS -X POST "$API_URL" -H "x-webhook-secret: $SECRET" -H "Content-Type: application/json" -d "$payload" > /dev/null
}

echo "Starting hunt for $TASK_ID"

# 1. Claim task & move to in-progress
api_call "{\"request_type\":\"assignee\",\"action\":\"assign\",\"task_id\":\"$TASK_ID\",\"names\":[\"Bablu\"],\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"
api_call "{\"request_type\":\"task\",\"action\":\"update\",\"task_id\":\"$TASK_ID\",\"column\":\"in-progress\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"

# 2. Add subtasks
api_call "{\"request_type\":\"subtask\",\"action\":\"create\",\"task_id\":\"$TASK_ID\",\"title\":\"Extract IOCs\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"
api_call "{\"request_type\":\"subtask\",\"action\":\"create\",\"task_id\":\"$TASK_ID\",\"title\":\"Query SIEM\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"
api_call "{\"request_type\":\"subtask\",\"action\":\"create\",\"task_id\":\"$TASK_ID\",\"title\":\"Draft YARA rules\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"

# Allow UI to catch up
sleep 2

# Get subtask IDs to mark them complete
SUBTASKS=$(curl -sS -X POST "$API_URL" -H "x-webhook-secret: $SECRET" -H "Content-Type: application/json" -d "{\"request_type\":\"task\",\"action\":\"get\",\"task_id\":\"$TASK_ID\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}" | grep -o '"id":"s-[^"]*"' | cut -d'"' -f4)

SUB_1=$(echo "$SUBTASKS" | sed -n '1p')
SUB_2=$(echo "$SUBTASKS" | sed -n '2p')
SUB_3=$(echo "$SUBTASKS" | sed -n '3p')

# 3. Simulate work steps
sleep 4
api_call "{\"request_type\":\"subtask\",\"action\":\"update\",\"subtask_id\":\"$SUB_1\",\"completed\":true,\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"

sleep 4
api_call "{\"request_type\":\"subtask\",\"action\":\"update\",\"subtask_id\":\"$SUB_2\",\"completed\":true,\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"

sleep 4
api_call "{\"request_type\":\"subtask\",\"action\":\"update\",\"subtask_id\":\"$SUB_3\",\"completed\":true,\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"

# 4. Move to Review
sleep 2
api_call "{\"request_type\":\"task\",\"action\":\"update\",\"task_id\":\"$TASK_ID\",\"column\":\"needs_input\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\"}"
api_call "{\"request_type\":\"question\",\"action\":\"ask\",\"task_id\":\"$TASK_ID\",\"question\":\"Hunt completed. YARA rules drafted. Awaiting human review before deploying to production.\",\"agent_name\":\"Bablu\",\"agent_emoji\":\"✌️\",\"question_type\":\"review\",\"priority\":\"normal\"}"

echo "Hunt complete"
