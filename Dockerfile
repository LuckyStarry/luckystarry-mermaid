# 基于官方 Puppeteer 镜像，集成中文字体支持
FROM ghcr.io/puppeteer/puppeteer:24.4.0

USER root

WORKDIR /app

# 添加中文字体（Mermaid 中文渲染必需）
COPY fonts/simsun.ttc /usr/share/fonts/simsun.ttc
RUN fc-cache -fv && fc-list :lang=zh

# 设置 Puppeteer 环境变量
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源码
COPY . .

# 构建 TypeScript
RUN npm run build

# 切换回 pptruser 用户运行
USER pptruser

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
