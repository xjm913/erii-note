# 1. 使用 Node 20 镜像
FROM node:20-alpine

WORKDIR /app

# 2. 安装依赖（利用 Docker 缓存层优化）
COPY package*.json ./
RUN npm install

# 3. 复制项目代码并构建
COPY . .
RUN npm run build

# 4. 暴露 3000 端口
EXPOSE 3000

# 5. 启动生产环境服务
CMD ["npm", "start"]