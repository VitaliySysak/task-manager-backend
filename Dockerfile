# ---------- Base ----------
FROM node:20-bullseye AS base
WORKDIR /app
COPY package*.json ./

# ---------- Development ----------
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development
COPY prisma ./prisma/
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ---------- Production ----------
FROM base AS build
ENV NODE_ENV=development
COPY . .
COPY .env.production .env
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:20-bullseye AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 5000
CMD ["node", "dist/main"]
        