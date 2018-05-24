FROM node:latest

ENV APP_MAIN app.js

RUN mkdir -p /opt/app
ADD package.json /opt/app/package.json
RUN cd /opt/app && npm install; exit 0
RUN npm install nodemon -g

WORKDIR /opt/app

EXPOSE 8080

CMD nodemon -L $APP_MAIN
