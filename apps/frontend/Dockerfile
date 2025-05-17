FROM node:24-alpine3.20@sha256:3b48d62b0e3a6c31784bafefc95baedf56987c6ee8ba891c924a529e5301fe1c AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# -----------------------

FROM base AS build

WORKDIR /usr/app

COPY ../../ ./

WORKDIR /usr/app/apps/frontend

RUN pnpm install

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm run build

# -----------------------

FROM base AS prod

WORKDIR /usr/app

COPY --chown=nonroot:nonroot . .

WORKDIR /usr/app/apps/frontend

COPY --from=build /usr/app/apps/frontend/package*.json .

RUN pnpm install --prod --frozen-lockfile

RUN addgroup -S nonroot && adduser -S -G nonroot nonroot

USER nonroot

COPY --from=build --chown=nonroot:nonroot /usr/app/apps/frontend/.next /usr/app/apps/frontend/.next

EXPOSE 3000

ENV SERVICE_NAME=frontend

CMD [ "pnpm", "start" ]
