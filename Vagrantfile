# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    # Ansible Management Machine
    config.vm.define :mgmt do |mgmt|
        mgmt.vm.box = "ubuntu/trusty64"
        mgmt.vm.network :private_network, ip: "10.0.10.1"
        mgmt.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end

        config.vm.provision "shell", privileged: true, inline: <<-SHELL
            apt-get -y install software-properties-common
            apt-add-repository -y ppa:ansible/ansible
            apt-get update
            apt-get -y install ansible

            cp -a /vagrant/* /home/vagrant
            chown -R vagrant:vagrant /home/vagrant
            cd /home/vagrant
        SHELL
    end

    # API Gateway
    config.vm.define :gateway do |gateway|
        gateway.vm.box = "ubuntu/trusty64"
        gateway.vm.network :private_network, ip: "10.0.10.2"
        gateway.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Little Boy
    config.vm.define :littleboy do |littleboy|
        littleboy.vm.box = "ubuntu/trusty64"
        littleboy.vm.network :private_network, ip: "10.0.10.11"
        littleboy.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # MongoDB
    config.vm.define :mongo do |mongo|
        mongo.vm.box = "ubuntu/trusty64"
        mongo.vm.network :private_network, ip: "10.0.10.12"
        mongo.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Fat Man
    config.vm.define :fatman do |fatman|
        fatman.vm.box = "ubuntu/trusty64"
        fatman.vm.network :private_network, ip: "10.0.10.21"
        fatman.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # PostgreSQL
    config.vm.define :postgres do |postgres|
        postgres.vm.box = "ubuntu/trusty64"
        postgres.vm.network :private_network, ip: "10.0.10.22"
        postgres.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end
end
