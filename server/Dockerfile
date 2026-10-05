# ---------- Stage 1: the workshop (builds the app) ----------
    FROM node:22-bookworm-slim AS build
    WORKDIR /app
    
    # Prisma needs OpenSSL to talk to the database
    RUN apt-get update \
      && apt-get install -y --no-install-recommends openssl \
      && rm -rf /var/lib/apt/lists/*
    
    # 1. Install packages first. This layer is reused unless package files change.
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # 2. Generate the Prisma client (needs the schema, not a real database)
    COPY prisma ./prisma
    COPY prisma.config.ts tsconfig.json ./
    RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate
    
    # 3. Compile TypeScript to JavaScript (creates /app/dist)
    COPY src ./src
    RUN npm run build
    
    
    # ---------- Stage 2: the delivery box (runs the app) ----------
    FROM node:22-bookworm-slim AS runtime
    WORKDIR /app
    ENV NODE_ENV=production
    
    RUN apt-get update \
      && apt-get install -y --no-install-recommends openssl \
      && rm -rf /var/lib/apt/lists/*
    
    # Only the packages needed to RUN the app, no TypeScript or test tools
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
    
    # Bring over only the finished product from the workshop
    COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=build /app/dist ./dist
    
    # Don't run as the all-powerful "root" user
    USER node
    
    EXPOSE 4000
    CMD ["node", "dist/index.js"]