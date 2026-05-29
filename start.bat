@echo off
chcp 65001 >nul
title OpenClaw 个人财务看板

echo ========================================
echo   🦞 OpenClaw 个人财务看板
echo ========================================
echo.

echo [1/3] 启动 OpenClaw Gateway...
openclaw gateway start >nul 2>&1
timeout /t 3 /nobreak >nul
openclaw health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Gateway 运行中 (端口 18789)
) else (
    echo ✗ Gateway 未运行，尝试安装服务...
    openclaw gateway install
    timeout /t 5 /nobreak >nul
    openclaw health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Gateway 运行中
    ) else (
        echo ✗ 启动失败，请运行 openclaw doctor 诊断
        pause
        exit /b 1
    )
)

echo.
echo [2/3] 启动财务看板...
start "财务看板" cmd /c "cd /d %~dp0 && node server.js"
echo ✓ 看板启动中 (端口 8080)

echo.
echo [3/3] 微信通道状态...
openclaw channels status 2>&1 | findstr /i "openclaw-weixin" >nul
if %errorlevel% equ 0 (
    echo ✓ 微信已连接
) else (
    echo ⚠️  微信未连接，请运行: openclaw channels login --channel openclaw-weixin
)

echo.
echo ========================================
echo   服务启动完成！
echo.
echo   📊 财务看板: http://localhost:8080
echo   ⚙️  控制台:   http://localhost:18789
echo        登录令牌: 见 ~/.openclaw/openclaw.json 中 gateway.auth.token
echo.
echo   如需连接微信:
echo      openclaw channels login --channel openclaw-weixin
echo ========================================
echo.
echo 停止服务: stop.bat
echo.
pause
