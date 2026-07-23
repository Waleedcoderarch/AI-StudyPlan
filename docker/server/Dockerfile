FROM node:20-alpine AS deps
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /data /app/uploads && chown -R node:node /data /app
COPY --from=deps /app/node_modules ./node_modules
COPY server/ ./
USER node
EXPOSE 5000
CMD ["node", "index.js"]
