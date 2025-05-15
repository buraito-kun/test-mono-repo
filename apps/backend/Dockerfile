FROM node:24@sha256:d9138b93aec8cd4b4febaae0b4e40b3272015ca6 AS build

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# -----------------------

FROM node:24-alpine3.20@sha256:d9138b93aec8cd4b4febaae0b4e40b3272015ca6

WORKDIR /usr/app

COPY package.json .

RUN npm install --omit=dev

RUN groupadd -r nonroot && useradd -r -g nonroot nonroot

USER nonroot

COPY --from=build --chown=nonroot:nonroot /usr/app/dist /usr/app/dist

EXPOSE 3001

CMD [ "node", "dist/main.js" ]
