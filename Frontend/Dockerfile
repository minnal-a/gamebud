# ---- build stage: compile the static React bundle ----
# The output is plain HTML/JS/CSS, so build on the runner's own platform even
# for multi-platform images (avoids a slow emulated build).
FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Create React App inlines REACT_APP_* at build time, so the URLs the
# browser uses must be known when the image is built.
ARG REACT_APP_BASE_URL=http://localhost:3001
ARG REACT_APP_CHAT_URL=http://localhost:4000
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL \
    REACT_APP_CHAT_URL=$REACT_APP_CHAT_URL
RUN npm run build

# ---- runtime stage: nginx serves the static files ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
