# Node Docker Dev
A very simple docker compose configuration for development with Node.js, MongoDB, and Redis. This configuration is ment to provide an isolated development enviroment.

## Setup
My intention with this configuration is not only to use it by myself, but also share with students who might not have use Docker before. Becuase if this I tried to make the instructions as detailed as possible. If you feel anything is missing or have any questions, please create an issue or a pull request.

### Getting Started
To use this configuration you will need to [install Docker Engine](https://docs.docker.com/engine/installation/) to run the Docker containers. You will also need to [install Docker Compose](https://docs.docker.com/compose/install/) since this configuration uses three containers. If you have never used Docker before I would recommend you look at [Get started with Docker](https://docs.docker.com/engine/getstarted/).

### Start new project
1. Create a project folder
1. Pull the repository into your project folder
1. Create your entry point file for your javascript program, example `app.js`. If you want to you can create an `src/` folder and place it in there if you want to.
1. Create an empty file called `package.json`. We will use npm init later but if the file does not exist the build of the docker image will fail.
1. Open the `Dockerfile` in a text editor and edit the line `ENV APP_MAIN app.js`. Change `app.js` to whereever you placed your entry point file. Remember that this is relative to the root of your project folder.
1. Open a terminal and navigate to your project folder
1. Build the images and start the containers with `docker-compose up`

### Implement into existing project
1. Pull the repository into your project folder.
1. If it's not there already, move you `package.json` to the root of your project.
1. Open the `Dockerfile` in a text editor and edit the line `ENV APP_MAIN app.js`. Change `app.js` to where your entry point file is relative to the root of the project folder
1. Open a terminal and navigate to your project folder
1. Build the images and start the containers with `docker-compose up`


### Run your application
This container uses a npm module called nodemon which detect changes in your project files and rebuilds the project for you, so your application will run every time you make a change.

If you need to install an npm module you can use the run command to send commands to your container. To install the npm module for express on your app container just run `docker-compose run app npm install express --save`.

### Communication
#### Internal
The configuration devides the application, database, and cache into three containers, so how do they communicate? In this configuration I've created a link from the application container to both the database and cache containers. This makes it possible to communicate with these containers from the application kind of like a network.

This division also means that we can't use `localhost:27017` to communicate with the database. The other containers have instead been given a hostname in the application container. To access the MongoDB database instead of `localhost:27017` use `mongo:27017`, and for Redis container `redis:6379`.

#### External
The only container accessible from the host machine is the application container which exposes the 8080 port to the host machine. This port is mapped 8080:8080 so to make your application accessible it should listen on port 8080.

The database and cache container can not be accessible from the host machine (excluding using docker tools). All communications with these containers are done though the application container.

### Services
* app
* mongo
* redis

### Good to know
The signed in user on the local machine will not have write access to files created by the containers, so you might need to use `sudo` every now and again. If anyone has a fix for this, please share.

Here are a couple of good to know commands to know. If something goes wrong with your containers these command together will more or less return you to the state before running `docker-compose up`.
```bash
# Stops all containers running on your machine
$ docker stop $(docker ps -a -q)

# Removes all containers on your machine
$ docker rm $(docker ps -a -q)

# Removes all images on your machine
$ docker rmi $(docker images -q)
```
