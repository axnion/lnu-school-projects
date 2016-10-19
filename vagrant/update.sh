#!/bin/bash

apt-get update
apt-get -y upgrade
apt-get -y remove ruby
apt-get -y install git-core curl build-essential g++ libssl-dev libreadline-dev zlib1g-dev postgresql memcached libpq-dev nodejs libqt4-dev libqtwebkit-dev qt4-qmake 
