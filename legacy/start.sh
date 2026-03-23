#!/bin/bash

echo "========================================"
echo "   健身工具 - 启动脚本"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] 安装后端依赖..."
pip install -r requirements.txt

echo ""
echo "[2/3] 安装前端依赖..."
cd frontend
npm install

echo ""
echo "[3/3] 启动服务..."
echo ""

echo "启动后端 API (端口 8000)..."
cd ..
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 2

echo "启动前端开发服务器 (端口 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "   服务已启动!"
echo "========================================"
echo ""
echo "   后端 API: http://localhost:8000"
echo "   前端界面: http://localhost:5173"
echo ""
echo "   按 Ctrl+C 停止服务"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
