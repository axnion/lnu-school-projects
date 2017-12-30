# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.provision "init",type:"shell", inline: <<-SHELL
        #! /bin/bash
        apt-get update
        apt-get -y upgrade
    SHELL

    config.vm.provider 'virtualbox' do |vb|
  	vb.customize ['modifyvm', :id, '--cableconnected1', 'on']
    end

    # Ansible Management Machine
    config.vm.define :mgmt do |mgmt|
        mgmt.vm.box = "bento/ubuntu-16.04"
        mgmt.vm.network :private_network, ip: "10.0.10.10"
        mgmt.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end

        config.vm.provision "init",type:"shell", inline: <<-SHELL
            #! /bin/bash
            apt-get -y install software-properties-common
            apt-add-repository -y ppa:ansible/ansible
            apt-get update
            apt-get -y install ansible
            chown -R vagrant:vagrant /vagrant
            echo cd /vagrant >> .bashrc
        SHELL
    end

    # Jenkins Master
    config.vm.define :jenkins do |jenkins|
        jenkins.vm.box = "bento/ubuntu-16.04"
        jenkins.vm.network :private_network, ip: "10.0.10.20"
        jenkins.vm.network "forwarded_port", guest: 8000, host: 8000
        jenkins.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
        end
    end

    # Unit Slave
    config.vm.define :unit do |unit|
        unit.vm.box = "bento/ubuntu-16.04"
        unit.vm.network :private_network, ip: "10.0.10.21"
        unit.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
        end
    end

    # Integration Slave
    config.vm.define :integration do |integration|
        integration.vm.box = "bento/ubuntu-16.04"
        integration.vm.network :private_network, ip: "10.0.10.22"
        integration.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
        end
    end

    # Staging Slave
    config.vm.define :staging do |staging|
        staging.vm.box = "bento/ubuntu-16.04"
        staging.vm.network :private_network, ip: "10.0.10.23"
        staging.vm.network "forwarded_port", guest: 8080, host: 8081
        staging.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
        end
    end

    # Production Slave
    config.vm.define :prod do |prod|
        prod.vm.box = "bento/ubuntu-16.04"
        prod.vm.network :private_network, ip: "10.0.10.24"
        prod.vm.network "forwarded_port", guest: 8080, host: 8080
        prod.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
        end
    end
end