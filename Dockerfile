FROM node:latest

WORKDIR /opt/app
ENV APP_MAIN=app.js

RUN npm install nodemon -g
RUN npm install

EXPOSE 8080

CMD ./node_modules/nodemon/bin/nodemon.js --legacy-watch $APP_MAIN
