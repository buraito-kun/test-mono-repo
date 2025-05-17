FROM node:24-alpine3.20@sha256:3b48d62b0e3a6c31784bafefc95baedf56987c6ee8ba891c924a529e5301fe1c AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# -----------------------

FROM base AS build

WORKDIR /usr/app

COPY ../../ ./

WORKDIR /usr/app/apps/backend

RUN pnpm install

RUN pnpm run build

# -----------------------

FROM base AS prod

WORKDIR /usr/app

COPY --chown=nonroot:nonroot . .

WORKDIR /usr/app/apps/backend

COPY --from=build /usr/app/apps/backend/package*.json .

RUN pnpm install --prod --frozen-lockfile

RUN addgroup -S nonroot && adduser -S -G nonroot nonroot

USER nonroot

COPY --from=build --chown=nonroot:nonroot /usr/app/apps/backend/dist /usr/app/apps/backend/dist

EXPOSE 3001

ENV SERVICE_NAME=backend

CMD [ "node", "dist/main.js" ]
