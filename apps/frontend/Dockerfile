FROM node:24@sha256:222f704ce7f499c7bd7d101c993b980d86393e87bb54d416bcfcfe8e62aa9f64 AS build

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# -----------------------

FROM node:24-alpine3.20@sha256:3b48d62b0e3a6c31784bafefc95baedf56987c6ee8ba891c924a529e5301fe1c

WORKDIR /usr/app

COPY package.json .

RUN npm install --omit=dev

RUN groupadd -r nonroot && useradd -r -g nonroot nonroot

USER nonroot

COPY --from=build --chown=nonroot:nonroot /usr/app/.next /usr/app/.next

EXPOSE 3000

CMD [ "npm", "start" ]
