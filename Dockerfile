FROM node:18-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache chromium

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies for production
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
