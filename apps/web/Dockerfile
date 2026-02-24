FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json ./
COPY .yarn ./.yarn
COPY apps/web/package.json ./apps/web/

RUN corepack enable && yarn workspaces focus @fynans/web

COPY apps/web ./apps/web
COPY apps/backend/openapi.json ./apps/backend/openapi.json

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN yarn workspace @fynans/web api:generate && yarn workspace @fynans/web build

FROM node:20-alpine AS production

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/web/package.json ./apps/web/

RUN corepack enable && yarn workspaces focus @fynans/web --production

COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["yarn", "start"]
