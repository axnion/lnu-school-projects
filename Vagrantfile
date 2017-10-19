# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.provision "init",type:"shell", path: "scripts/init.sh"
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

    # Sensu Master
    config.vm.define :monitor do |monitor|
        monitor.vm.box = "bento/ubuntu-16.04"
        monitor.vm.network :private_network, ip: "10.0.10.3"
        monitor.vm.network "forwarded_port", guest: 3000, host: 3000
        monitor.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
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

    # Service A
    config.vm.define :service_a do |service_a|
        service_a.vm.box = "bento/ubuntu-16.04"
        service_a.vm.network :private_network, ip: "10.0.10.21"
        service_a.vm.provider "virtualbox" do |vb|
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

    # MongoDB backup
    config.vm.define :mongobackup do |mongobackup|
        mongobackup.vm.box = "bento/ubuntu-16.04"
        mongobackup.vm.network :private_network, ip: "10.0.10.23"
        mongobackup.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Service A Load Balancer
    config.vm.define :service_a_lb do |service_a_lb|
        service_a_lb.vm.box = "bento/ubuntu-16.04"
        service_a_lb.vm.network :private_network, ip: "10.0.10.24"
        service_a_lb.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Service B
    config.vm.define :service_b do |service_b|
        service_b.vm.box = "bento/ubuntu-16.04"
        service_b.vm.network :private_network, ip: "10.0.10.31"
        service_b.vm.provider "virtualbox" do |vb|
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

    # PostgreSQL Backup
    config.vm.define :postgres_backup do |postgres_backup|
        postgres_backup.vm.box = "bento/ubuntu-16.04"
        postgres_backup.vm.network :private_network, ip: "10.0.10.33"
        postgres_backup.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Service B Load Balancer
    config.vm.define :service_b_lb do |service_b_lb|
        service_b_lb.vm.box = "bento/ubuntu-16.04"
        service_b_lb.vm.network :private_network, ip: "10.0.10.34"
        service_b_lb.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end

    # Client
    config.vm.define :client do |client|
        client.vm.box = "bento/ubuntu-16.04"
        client.vm.network :private_network, ip: "10.0.10.40"
        client.vm.provider "virtualbox" do |vb|
            vb.memory = "512"
        end
    end
end
