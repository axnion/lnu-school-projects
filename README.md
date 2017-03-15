# an222yp - Examination 3

# Setup
All instructions will be for a Ubuntu 16.04 system, but instructions should work for RHEL/CentOS/Fedora/Debian also. I will use VIM as a text editor, but feel free to use something like nano instead.

## Software
The easiest way to run this web application is using Docker and Docker Compose. If you are using Digital Ocean then there is a one click application with Docker available. If you want to create certificates with Let's Encrypt then install the client.

## Create docker-compose configuration
1. Create application folder `mkdir ~/app`
1. Create docker compose file `touch ~/app/docker-compose.yml`
1. Open in text editor `vim ~/app/docker-compose.yml`
1. Add the following code to the file
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
                - ./default.conf:/etc/nginx/conf.d/default.conf
    ```

This docker compose configuration will download two images, the first one is axnion/ex3 which contains the web application, and the second one which has nginx to be used as a reverse proxy.

The application container needs a .env file to function which will let a couple of enviroment variables in the container which will be used the node application. That's the only configuration we need to do for the application.

The nginx container need a bit more attention. First it listens on port 80 and 443 to catch both http and https requests. It's also linked to the app container to create a network connection between them. It also has a couple of volumes which we will use when configuring nginx.

## Enviroment file
1. Create .env file `touch ~/app/.env`
1. Open file in text editor `vim ~/app/.env`
1. Put the following text into the file and change the values to fit your application
    ```
    REPO=<owner>/<repo>
    USER=<github username>
    API=<API token>
    WEBHOOK=<webhook secret>
    USER_AGENT=<your email address>
    URL=<url to website ex: http://domain.com NEVER end on />
    ```

## Nginx configuration
1. Create default.conf file `touch ~/app/default.conf`
1. Open file in text editor `vim ~/app/default.conf`
1. Add the following code to the file
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
                    proxy_set_header Connection 'upgr46.101.129.208ade';
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
1. Create file for cert generator `touch ~/app/certgen`
1. Open in text editor `vim ~/app/certgen`
1. Add the following code to the file
    ```bash
    o "Generating self-signed certificates..."
    rm -rf ./sslcerts
    mkdir -p ./sslcerts
    openssl genrsa -out ./sslcerts/key.pem 4096
    openssl req -new -key ./sslcerts/key.pem -out ./sslcerts/csr.pem
    openssl x509 -req -days 365 -in ./sslcerts/csr.pem -signkey ./sslcerts/key.pem -out ./sslcerts/cert.pem
    rm ./sslcerts/csr.pem
    chmod 600 ./sslcerts/key.pem ./sslcerts/cert.pem
    ```
1. Make the script executable `chmod +x ~/app/certgen`
1. Move into the app directory `cd ~/app`
1. Run the script `./certgen`
1. Follow the instructions of the script
1. Open docker compose file in a text editor `vim ~/app/docker-compose.yml`
1. Add the following volume for nginx: `- ./sslcerts:/etc/letsencrypt`
1. Your docker-compose file should look like this
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
                - ./default.conf:/etc/nginx/conf.d/default.conf
                - ./sslcerts:/etc/letsencrypt
    ```

#### Run the application
Your application is now ready to run using self signed certificates.
1. Move into the app directory `cd ~/app`
1. Start the containers `docker-compose up`
1. Your application should now be running. If you get any errors check so you configured everything correctly.

IMPORTANT! If you are running with self sign certificates and with all http traffic rerouted to https the webhooks will not work. Either you'll have to use a real certificate, or you should open up http so the webhooks can use it.

### Let's Encrypt
Letsencrypt will take som modifications of existing configuration and also some new additions. If you already have done the self signed certificates you will have to revert back to how the configuration before you created the self certificates.

#### Create certificates
1. Create file structure for Let's Encrypt to use when validating domain `mkdir -p ~/app/letsencrypt/domain.com/.well-known`. Remember to replace domain.com with your domain.
1. Open docker compose file in a text editor `vim ~/app/docker-compose.yml`
1. Add a new volume to nginx container `- ./letsencrypt:/var/www`
1. Open the default.conf file in a text editor `vim ~/app/default.conf`
1. Change the last server which listens on port 80 to look like this. Don't forget to change domain.com to your domain.
    ```
    server {
        listen 80;
        server_name localhost;

        location /.well-known {
                    alias /var/www/domain.com/.well-known;
        }
    }
    ```
1. Also comment out the parts about ssl in the first server
    ```
    #ssl on;
    #ssl_certificate /etc/letsencrypt/cert.pem;
    #ssl_certificate_key /etc/letsencrypt/key.pem;
    ```
1. See to it that you are in the app directory `cd ~/app`
1. Run docker compose in detached mode `docker-compose up -d`
1. Run the Let's Encrypt client with the following command `letsencrypt certonly --webroot -w ~/app/letsencrypt/domain.com -d domain.com -d www.domain.com`. Remember to change domain.com to your domain.
1. Hopefully you got a message saying that you where successful, if you did not go back and check you configurations.

#### Activate certificates
1. Open docker compose file in a text editor `vim ~/app/docker-compose.yml`
1. Remove the `- ./letsencrypt:/var/www` volume that we added earlier
1. Add a new volume on nginx `- /etc/letsencrypt:/etc/letsencrypt`
1. Open default.conf in a text editor `vim ~/app/default.conf`
1. Remove the comment marks we added to the ssl lines on the first server. But also change the lines to point at the new certificates. Should look something like this, but change domain.com to your domain.
    ```
    ssl on;
    ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem;
    ```
1. Also change the second server for port 80 to look like it did before. Like this
    ```
    server {
            listen 80;
            server_name localhost;
            return 301 https://$host$request_uri;
    }
    ```

#### Run the application
You can now run the application with fully valid https without any warnings by the browser. Run the application like this
1. Move into the app directory `cd ~/app`
1. Start the containers `docker-compose up`
1. Your application should now be running. If you get any errors check so you configured everything correctly.
