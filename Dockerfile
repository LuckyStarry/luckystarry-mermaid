# 基于 nodejs-puppeteer 镜像（Debian bookworm，已优化 Chromium）
FROM registry.cn-hangzhou.aliyuncs.com/luckystarry/nodejs-puppeteer:24.4.0

# 切换到 root 用户进行构建
USER root

WORKDIR /app

# 设置环境变量
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# 切换回 pptruser 用户运行
USER pptruser

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
