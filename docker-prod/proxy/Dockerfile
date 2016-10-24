FROM nginx

ADD nginx.conf /etc/nginx/nginx.conf
ADD ssl_cert/cert.pem /etc/ssl/hours_cert.pem
ADD ssl_cert/key.pem /etc/ssl/hours_key.pem

CMD service nginx start
