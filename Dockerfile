FROM node:23

# install expect to handle inquirer prompt for automation
RUN apt update; apt install -y expect ; \
    npm install -g ts-node;

WORKDIR /app
COPY . .
RUN yarn install

ENV NODE_ENV=production
ENV FEEDGEN_PORT=3000
EXPOSE 3000

CMD yarn start

LABEL org.opencontainers.image.source=https://github.com/bluesky-social/feed-generator