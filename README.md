# Node Docker Dev
A very simple docker compose configuration for development with Node.js, MongoDB, and Redis. This configuration is ment to provide an isolated development enviroment in a similar to Vagrant, but with the added benifits of Docker. Because of that, this configuration is NOT made to package applications in containers and should NEVER be used anywhere near production.


## Setup
My intention with this configuration is not only to use it by myself, but also share with students who might not have use Docker before. Becuase if this I tried to make the instructions as detailed as possible. If you feel anything is missing or have any questions, please create an issue or a pull request.

### Getting Started
To use this configuration you will need to [install Docker Engine](https://docs.docker.com/engine/installation/) to run the Docker containers. You will also need to [install Docker Compose](https://docs.docker.com/compose/install/) since this configuration uses three containers. If you have never used Docker before I would recommend you look at [Get started with Docker](https://docs.docker.com/engine/getstarted/).

### Implement configuration and start containers
1. Download or clone repository
1. Copy `docker-compose.yml` and `Dockerfile` to the root of your project directory
1. Open a terminal and navigate to the root of your project directory
1. Build images and start containers with `docker-compose up -d`. The `-d` means the containers will run in detach mode so they will just run in the background. If you want to see log output in the terminal then run without `-d`, but you would then have to open another terminal to continue with the next steps.

### Interact with the containers
I will show two ways you can interact with your containers, both using the `docker-compose run` command. More documentation on the run command can be found [here](https://docs.docker.com/compose/reference/run/)

#### Run commands
The first way is to use the run command to issue a command from your local machine to the container. In it's simplest form it will look like `docker-compose run <service_name> <command>`. So to issue the `ls` command to a service called `app` would look like `docker-compose run app ls`.

First a couple of things you should know about this specific configuration before you start issuing commands. Your project folder is shared with with container in a similar way to how Vagrant can share files. Also all commands will run in this shared folder because I have set it to the default work directory. So deleting project files in your container will also delete all files on your local machine.
i
For a more practical example imagine that we have a files `app.js` located in the project root, and we want to run this application in our application container. To do this we will need to run `node app.js` in the container. Since the command always are executed from the project root the command will look like `docker-compose run app node app.js`.

#### Run bash
If you want something that reminds more of the `vagrant ssh` command this is a more fitting solution for you. Since we can run commands inside the container using the run command we can start any program we would like, even a shell. So we can run the command bash to start a bash session `docker-compose <service_name> bash`.

You will then land in the work directory of the container and have a normal bash interface where you can navigate and run commands inside the container.

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
The the Redis and MongoDB container will create two folder in your project root called `cache` and `db` where it will store data.
