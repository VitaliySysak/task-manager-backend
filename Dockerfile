# syntax=docker/dockerfile:1.4

FROM node:20.11.1-alpine AS builder

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

###########################################

# COPY package*.json ./
# COPY prisma ./prisma/

# RUN npm install  

# COPY . .        

# RUN chown -R appuser:appgroup /app
# USER appuser

# EXPOSE 5000

# CMD ["npm", "run", "dev"]

###########################################

COPY package*.json ./
COPY prisma ./prisma/
COPY nest-cli.json .
COPY tsconfig.build.json .
COPY tsconfig.json .
COPY src ./src
COPY .env . 

RUN npm install

RUN npm run build

FROM node:20.11.1-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.build.json ./
COPY --from=builder /app/nest-cli.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

CMD ["node", "dist/main.js"]
