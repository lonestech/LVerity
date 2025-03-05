@echo off
echo 构建前端应用...

cd web
call pnpm install
call pnpm run build

echo 构建完成！
cd ..

echo 将构建好的文件拷贝到正确位置...
if not exist "web\dist" (
    echo 构建失败，dist目录不存在！
    exit /b 1
)

echo 前端应用已准备好，可以通过后端服务访问！
