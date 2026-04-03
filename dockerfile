FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3009

CMD [ "sh", "-c", "pnpm run db:migrate && pnpm run db:seed && pnpm run start" ]

