FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --silent
RUN npm install -g nodemon --silent 
RUN npm install -g pm2 --silent 

# Bundle app source
COPY . /usr/src/app

EXPOSE 8080

CMD ["nodemon", "-L", "index.js"]