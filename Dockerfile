FROM node:latest

WORKDIR /opt/app
RUN npm install

EXPOSE 8080
