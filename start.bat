@echo off
echo ========================================
echo   健身工具 - 启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 安装后端依赖...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo 后端依赖安装失败!
    pause
    exit /b 1
)

echo.
echo [2/3] 安装前端依赖...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败!
    pause
    exit /b 1
)

echo.
echo [3/3] 启动服务...
echo.

start "FastAPI Backend" cmd /k "cd .. && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

start "Vue Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   服务已启动!
echo ========================================
echo.
echo   后端 API: http://localhost:8000
echo   前端界面: http://localhost:5173
echo.
echo   按任意键打开浏览器...
pause >nul

start http://localhost:5173
