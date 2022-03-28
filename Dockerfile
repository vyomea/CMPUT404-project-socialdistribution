FROM node:17-alpine3.14

RUN if [[ "${IS_DEV_CONTAINER+set}" != "set" ]]; then \
  apk update && apk add curl git bash && \
  curl https://cli-assets.heroku.com/install.sh | sh; \
  fi

WORKDIR /data/src/app/

COPY src/app/package*.json ./

RUN npm ci

WORKDIR /data/src/server/

COPY src/server/package*.json ./

RUN npm ci

WORKDIR /data/src/app/

COPY src/app/ ./

RUN npm run build

WORKDIR /data/src/server/

COPY src/server/ ./

# RUN ls -al ../app/ && cp -r ../app/build ./

WORKDIR /data/

COPY docker-entrypoint.sh .

RUN chmod 700 docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]