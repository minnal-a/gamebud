# ---- build stage: install production dependencies ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# python3/make/g++ let bcrypt compile from source if no prebuilt binary is available
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# ---- runtime stage: only the app and its node_modules ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app /app
USER node

# 3001 = REST API, 4000 = Socket.IO chat
EXPOSE 3001 4000
CMD ["node", "server.js"]
