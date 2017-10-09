# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.provision "shell", path: "scripts/init.sh"
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

        mgmt.vm.provision "shell", path: "scripts/ansible.sh"
    end

    # API Gateway
    config.vm.define :gateway do |gateway|
        gateway.vm.box = "bento/ubuntu-16.04"
        gateway.vm.network :private_network, ip: "10.0.10.11"
        gateway.vm.network "forwarded_port", guest: 8080, host: 8080
        gateway.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Little Boy
    config.vm.define :littleboy do |littleboy|
        littleboy.vm.box = "bento/ubuntu-16.04"
        littleboy.vm.network :private_network, ip: "10.0.10.21"
        littleboy.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # MongoDB
    config.vm.define :mongo do |mongo|
        mongo.vm.box = "bento/ubuntu-16.04"
        mongo.vm.network :private_network, ip: "10.0.10.22"
        mongo.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Fat Man
    config.vm.define :fatman do |fatman|
        fatman.vm.box = "bento/ubuntu-16.04"
        fatman.vm.network :private_network, ip: "10.0.10.31"
        fatman.vm.network "forwarded_port", guest: 9876, host: 8081
        fatman.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # PostgreSQL
    config.vm.define :postgres do |postgres|
        postgres.vm.box = "bento/ubuntu-16.04"
        postgres.vm.network :private_network, ip: "10.0.10.32"
        postgres.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end
end
