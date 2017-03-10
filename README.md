# an222yp - Examination 3

# Setup
All instructions will be for a Linux system.

## Software
The easiest way to run this web application is using Docker and Docker Compose. If you are using Digital Ocean then there is a one click application with Docker available. If you want to create certificates with Letsencrypt then install the client.

## Create docker-compose configuration
On your server create a folder where you want the application files to be located, I will simply put it in the home folder and call it app `mkdir ~/app`. Navigate into the folder `cd ~/app`.

Create a new file `touch docker-compose.yml` and open it in a text editor like vim or nano, I will use vim `vim docker-compose.yml`. Add the following text to it.
```
version: '2'
services:
    app:
        image: axnion/ex3
        env_file:
            - .env
    nginx:
        image: nginx:mainline
        ports:
            - "80:80"
            - "443:443"
        links:
            - "app:app"
        volumes:
            - ./nginx.conf:/etc/nginx/conf.d/default.conf
```
This docker compose configuration will download two images, the first one is axnion/ex3 which contains the web application, and the second one which has nginx to be used as a reverse proxy.

The application container needs a .env file to function which will let a couple of enviroment variables in the container which will be used the node application. That's the only configuration we need to do for the application.

The nginx container need a bit more attention. First it listens on port 80 and 443 to catch both http and https requests. It's also linked to the app container to create a network connection between them. It also has a couple of volumes which we will use when configuring nginx.

## Enviroment file
The enviroment file is places in the root folder of the project which we created earlier. Create a new files .env `touch ~/app/.env`. Then open it using you preferred text editor `vim ~/app/.env`. Then add the following to the files and change all parts within <> to suit your application.

```
REPO=<owner>/<repo>
USER=<github username>
API=<API token>
WEBHOOK=<webhook secret>
USER_AGENT=<your email address>
```

## Nginx configuration
We will configure the nginx container though the volumes we created. In the app folder create a new file `touch ~/app/nginx.conf` and open it using a text editor `vim ~/app/nginx.conf`. Add the following configuration to the file.

```
server {
        listen 443;
        ssl on;
        ssl_certificate /etc/letsencrypt/cert.pem;
        ssl_certificate_key /etc/letsencrypt/key.pem;
        server_name localhost;

        gzip on;
        gzip_comp_level 6;
        gzip_vary on;
        gzip_min_length  1000;
        gzip_proxied any;
        gzip_types text/plain text/html text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
        gzip_buffers 16 8k;

        location ~ ^/(images/|img/|javascript/|js/|css/|stylesheets/|flash/|media/|static/|robots.txt|humans.txt|favicon.ico) {
                root http://app/public;
                access_log off;
                expires max;
        }

        location / {
                proxy_pass http://app;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}

server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
}
```

## HTTPS
I will show two ways of making https work. The easiest way is self signed certificates which should only be used for development or testing since it does not provide any security to the user. The other way is using Letsencrypt which does require a bit of reconfiguration of the container setup.

### Self signed
We need to generate certificates. This can be done in several ways, but we will use a small Bash script. Create a file `touch ~/app/certgen` and open it in a text editor `vim ~/app/certgen` and add the following text:
```
o "Generating self-signed certificates..."
rm -rf ./sslcerts
mkdir -p ./sslcerts
openssl genrsa -out ./sslcerts/key.pem 4096
openssl req -new -key ./sslcerts/key.pem -out ./sslcerts/csr.pem
openssl x509 -req -days 365 -in ./sslcerts/csr.pem -signkey ./sslcerts/key.pem -out ./sslcerts/cert.pem
rm ./sslcerts/csr.pem
chmod 600 ./sslcerts/key.pem ./sslcerts/cert.pem

```

Then we need to make the file executable by running `chmod +x ~/app/certgen` and finally run the script using `~/app/certgen` and follow the instructions. The certs should then be placed in a folder called sslcerts which docker compose has configured as a volume.

Then open the docker-compose file `vim ~/app/docker-compose.yml` and add the following under the volumes for nginx. `- ./sslcerts:/etc/letsencrypt`

You can now run the application if you want to.

### Letsencrypt
Letsencrypt will take som modifications of existing configuration and also some new additions.

#### Create certificates
We first need to create the certificates, and to do this we need to run the letsencrypt client. The client and web server needs access to the same folder so we need to create a link.

Create the a folder structure to be used by nginx which letsencrypt will check when validating. Run the following command `mkdir -p ~/app/letsencrypt/domain.com/.well-known`. Then open the docker-compose file `vim ~/app/docker-compose.yml` and add `- ./letsencrypt:/var/www` under volumes for nginx.

Next we will make a temporary change to the nginx.conf file so letsencrypt can talk to the web server without https. Don't forget to change the domain.com. Change the second server that listens on port 80 to this:
```
server {
    listen 80;
    server_name localhost;

    location /.well-known {
                alias /var/www/domain.com/.well-known;
    }
}
```

Also comments out the following lines in the first server which listens on port 433. Comments are created by putting a # in front of the line. The lines should look like this:
```
#ssl on;
#ssl_certificate /etc/letsencrypt/cert.pem;
#ssl_certificate_key /etc/letsencrypt/key.pem;
```

You are now ready to create the certificates. Since letsencrypt needs to talk to the web server, so we start the containers in detached mode with `docker-compose up -d`. Then run the following command and change it to fit your domain. `letsencrypt certonly --webroot -w ~/app/letsencrypt/domain.com -d domain.com -d www.domain.com`

You should now get a message saying that the certificates where created. If you got an error then you did something wrong, might be you forgot to change a domain.com somewhere.

#### Activate certificates
Now we need to start using these certificates and fix what we broke to make the activation work.

##### Edit `docker-compose.yml`
Remove the volume `- ./letsencrypt:/var/www` from nginx. Add the following volume `- /etc/letsencrypt:/etc/letsencrypt` to nginx

##### Edit `nginx.conf`
Remove the # we added before from the rows about ssl in the first server and change them so they point to the newly created certificates. Remember to change domain.com
```
ssl on;
ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem;
```

Reset the second server to how it was before we edited it the last time
```
server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
}
```

#### Run the application
You can now run the application with fully valid https without any warnings by the browser



#### OLD letsencrypt
Using LE does bring with it some complicated changes. We need to make changes in both docker-compose.yml and nginx.conf.
First you need to have your domain ready and pointing to your web server. I will as example use domain.com.

We'll start with docker-compose.yml where we need to modify the volumes for the nginx container. We change `./sslcerts` to `/etc/letsencrypt` since this is where the letsencrypt client will put the certificates. We don't change the `nginx.conf`, but we add the `./letsencrypt:/var/www`, which we will talk more about later. Edit docker-compose and change the volumes under nginx to look like this:
```
volumes:
    - /etc/letsencrypt:/etc/letsencrypt
    - ./nginx.conf:/etc/nginx/conf.d/default.conf
    - ./letsencrypt:/var/www
```

Next we need to edit the nginx.conf file.

We added a new volume to the docker compose config `./letsencrypt:/var/www`. This is used when creating the certificates since we will be using the webroot plugin in letsencrypt. We need to create this folder `mkdir ~/app/letsencrypt`, but we also need to create the contents. First we need a folder with the domain, so in my case I create a folder called `domain.com` like this `mkdir ~/app/letsencrypt/domain.com`. And last, in the domain folder create a new folder called `.well-known`, so `mkdir ~/app/letsencrypt/domain.com/.well-known`.

Now we need to change the nginx.conf file. We start by changing the location of the certificates. These are already configured for self signed certificates and should already exists in the first server in nginx.conf. Remember to change domain.com to your domain.

```
ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem;
```

We also need to add the `/.well-known` location to `nginx.conf` so letsencrypt can find it.
```
location /.well-known {
    alias /var/www/axnion.science/.well-known;
}
```

Here are all the edited files in full.

**docker-compose**
```

version: '2'
services:
    app:
        image: axnion/ex3
        env_file:
            - .env
    nginx:
        image: nginx:mainline
        ports:
            - "80:80"
            - "443:443"
        links:
            - "app:app"
        volumes:
            - /etc/letsencrypt:/etc/letsencrypt
            - ./nginx.conf:/etc/nginx/conf.d/default.conf
            - ./letsencrypt:/var/www
```

**nginx.conf**
```
server {
        listen 443;
        ssl on;
        ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem;
        server_name domain.com www.domain.com;

        gzip on;
        gzip_comp_level 6;
        gzip_vary on;
        gzip_min_length  1000;
        gzip_proxied any;
        gzip_types text/plain text/html text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
        gzip_buffers 16 8k;

        location ~ ^/(images/|img/|javascript/|js/|css/|stylesheets/|flash/|media/|static/|robots.txt|humans.txt|favicon.ico) {
                root http://app/public;
                access_log off;
                expires max;
        }

        location / {
                proxy_pass http://app;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}

server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
}
```

Next we need to create the certificates. We will do so by running the letsencrypt client.

The command will look like this `letsencrypt certonly --webroot -w ~/app/letsencrypt/domain.com -d domain.com -d www.domain.com`

### Run application
Running the application is very easy. Navigate to the app folder `cd ~/app` and run `docker-compose up`. This will create the application and nginx container and everything should start up and your application should now be accessible.
