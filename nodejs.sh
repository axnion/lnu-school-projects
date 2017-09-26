curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt-get install -y nodejs
sudo npm install -g n
sudo n latest
sudo apt-get -y remove nodejs
sudo ln -s /usr/bin/node /usr/bin/nodejs
