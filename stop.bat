@echo off
chcp 65001 >nul
title 停止 OpenClaw 服务

echo 正在停止服务...
echo.

echo [1/2] 停止 OpenClaw Gateway...
openclaw gateway stop 2>nul
echo ✓ Gateway 已停止

echo [2/2] 停止财务看板...
taskkill /fi "WINDOWTITLE eq 财务看板" /f 2>nul
echo ✓ 看板已停止

echo.
echo 所有服务已停止。
pause
