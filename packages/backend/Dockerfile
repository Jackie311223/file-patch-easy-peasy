# Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Thêm dòng này để generate Prisma Client
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]