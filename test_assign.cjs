const http = require('http');
const body = JSON.stringify({ request_type: "assignee", action: "assign", task_id: "fake", names: ["Bablu Bot"], agent_name: "Web UI", agent_emoji: "🖥️" });
const req = http.request({ hostname: '127.0.0.1', port: 8080, path: '/functions/v1/ai-tasks', method: 'POST', headers: { 'Content-Type': 'application/json', 'x-webhook-secret': 'dev-local-secret', 'Content-Length': body.length } }, res => { let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => console.log(res.statusCode, data)); });
req.write(body); req.end();
