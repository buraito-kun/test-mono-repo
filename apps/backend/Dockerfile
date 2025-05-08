FROM node:24@sha256:0625f79a0c9f5005e31dba1761260b9f66ea8a3293e5f645eb4550a4c7dcdbb9 AS build

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# -----------------------

FROM node:24-slim@sha256:7b0f9cbb3f88da0e67873be5efcf38ce79ea25cfbb4986fad55a446af484e7c9

WORKDIR /usr/app

COPY package.json .

RUN npm install --omit=dev

RUN groupadd -r nonroot && useradd -r -g nonroot nonroot

USER nonroot

COPY --from=build --chown=nonroot:nonroot /usr/app/dist /usr/app/dist

EXPOSE 3001

CMD [ "node", "dist/main.js" ]
