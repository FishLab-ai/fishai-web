#!/bin/bash
# FishAI Start Script - 启动 fishai-server 和 fishai-web

# 清理旧进程
pkill -f "next dev" 2>/dev/null
sleep 2

# 清空日志
> /home/z/my-project/server.log
> /home/z/my-project/web.log

# 启动 fishai-server (port 3001)
cd /home/z/my-project/fishai-server
nohup npx next dev -p 3001 >> /home/z/my-project/server.log 2>&1 &
echo "fishai-server PID: $!"

# 启动 fishai-web (port 3000)
cd /home/z/my-project
nohup npx next dev -p 3000 >> /home/z/my-project/web.log 2>&1 &
echo "fishai-web PID: $!"

# 等待启动
echo "Waiting for servers..."
sleep 15

# 验证
echo ""
echo "=== fishai-server (3001) ==="
curl -s -o /dev/null -w "HTTP: %{http_code}" http://localhost:3001/ 2>/dev/null || echo "FAILED"
echo ""

echo "=== fishai-web (3000) ==="
curl -s -o /dev/null -w "HTTP: %{http_code}" http://localhost:3000/ 2>/dev/null || echo "FAILED"
echo ""

echo "=== API Proxy (3000 -> 3001) ==="
curl -s -o /dev/null -w "HTTP: %{http_code}" http://localhost:3000/api/auth/github/config 2>/dev/null || echo "FAILED"
echo ""

echo "=== Chat API Test ==="
curl -s -o /dev/null -w "HTTP: %{http_code}" http://localhost:3001/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"test"}' 2>/dev/null || echo "FAILED"
echo ""

echo "Done!"
