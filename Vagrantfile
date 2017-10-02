# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    # Ansible Management Machine
    config.vm.define :mgmt do |mgmt|
        mgmt.vm.box = "ubuntu/xenial64"
        mgmt.vm.network :private_network, ip: "10.0.0.0"
        mgmt.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
        end

        config.vm.provision "shell", privileged: true, inline: <<-SHELL
            apt-get -y install software-properties-common
            apt-add-repository -y ppa:ansible/ansible
            apt-get update
            apt-get -y install ansible

            cp -a /vagrant/* /home/ubuntu
            chown -R ubuntu:ubuntu /home/ubuntu
            cd /home/ubuntu
        SHELL
    end

    # API Gateway
    config.vm.define :gateway do |gateway|
        gateway.vm.box = "ubuntu/xenial64"
        gateway.vm.network :private_network, ip: "10.0.0.1"
        gateway.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
        end
    end

    # LITTLE BOY -----------------------------------------------------------------------------------

    # Little Boy
    (1..1).each do |i|
        config.vm.define "littleboy#{i}" do |littleboy|
            littleboy.vm.box = "ubuntu/xenial64"
            littleboy.vm.network :private_network, ip: "10.0.1.1#{i}"
            littleboy.vm.provider "virtualbox" do |vb|
                vb.memory = "256"
            end
        end
    end
    # Little Boy Load Balancer
    config.vm.define :littleboy_lb do |littleboy_lb|
        littleboy_lb.vm.box = "ubuntu/xenial64"
        littleboy_lb.vm.network :private_network, ip: "10.0.1.0"
        littleboy_lb.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
        end
    end

    # MongoDB
    config.vm.define :mongo do |mongo|
        mongo.vm.box = "ubuntu/xenial64"
        mongo.vm.network :private_network, ip: "10.0.1.1"
        mongo.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
        end
    end

    # FAT MAN --------------------------------------------------------------------------------------

    # Fat Man
    (1..1).each do |i|
        config.vm.define "fatman#{i}" do |fatman|
            fatman.vm.box = "ubuntu/xenial64"
            fatman.vm.network :private_network, ip: "10.0.2.1#{i}"
            fatman.vm.provider "virtualbox" do |vb|
                vb.memory = "256"
            end
        end
    end

    # Fat Man Load Balancer
    config.vm.define :fatman_lb do |fatman_lb|
        fatman_lb.vm.box = "ubuntu/xenial64"
        fatman_lb.vm.network :private_network, ip: "10.0.2.0"
        fatman_lb.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
        end
    end

    # PostgreSQL
    config.vm.define :postgres do |postgres|
        postgres.vm.box = "ubuntu/xenial64"
        postgres.vm.network :private_network, ip: "10.0.2.1"
        postgres.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
        end
    end
end
