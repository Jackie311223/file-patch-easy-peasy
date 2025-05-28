# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only backend directory
COPY ./packages/backend ./packages/backend
COPY ./package*.json ./
COPY ./tsconfig.base.json ./
COPY ./packages/backend/tsconfig.* ./packages/backend/

WORKDIR /app/packages/backend

RUN npm install
RUN npm run build

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package*.json ./

RUN npm install --omit=dev

EXPOSE 3001
CMD ["node", "dist/main"]
