#!/bin/bash
echo "构建前端应用..."

cd web
pnpm install
pnpm run build

echo "构建完成！"
cd ..

echo "将构建好的文件拷贝到正确位置..."
if [ ! -d "web/dist" ]; then
    echo "构建失败，dist目录不存在！"
    exit 1
fi

echo "前端应用已准备好，可以通过后端服务访问！"
