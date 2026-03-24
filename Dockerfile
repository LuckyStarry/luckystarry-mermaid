# 基于官方 Puppeteer 镜像（mmdc 需要 Chromium）
FROM ghcr.io/puppeteer/puppeteer:24.4.0

USER root

WORKDIR /app

# 添加中文字体（Mermaid 中文渲染必需）
COPY fonts/simsun.ttc /usr/share/fonts/simsun.ttc
RUN fc-cache -fv && fc-list :lang=zh

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源码和配置
COPY . .

# 构建 TypeScript
RUN npm run build

# 切换回 pptruser 用户运行
USER pptruser

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
