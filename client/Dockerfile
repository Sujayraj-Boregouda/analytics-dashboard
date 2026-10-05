# ---------- Stage 1: the workshop (builds the React app) ----------
    FROM node:22-bookworm-slim AS build
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    
    # ---------- Stage 2: the delivery box (a small web server) ----------
    FROM nginx:1.27-alpine AS runtime
    
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 80