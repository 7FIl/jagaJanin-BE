FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3006

CMD [ "pnpm", "run", "start" ]