#! /bin/bash
apt-get -y install software-properties-common
apt-add-repository -y ppa:ansible/ansible
apt-get update
apt-get -y install ansible
chown -R vagrant:vagrant /vagrant
echo cd /vagrant >> .bashrc
