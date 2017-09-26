# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    # Ansible Management Machine - vagrant ssh mgmt
    config.vm.define :mgmt do |mgmt_config|
        mgmt_config.vm.box = "ubuntu/xenial64"
        mgmt_config.vm.hostname = "mgmt"
    end

    # Little Boy - vagrant ssh littleboy
    config.vm.define :littleboy do |littleboy_config|
        littleboy_config.vm.box = "ubuntu/xenial64"
        littleboy_config.vm.hostname = "littleboy"
    end

    # Fat-Man - vagrant ssh fatman
    config.vm.define :fatman do |fatman_config|
        fatman_config.vm.box = "ubuntu/xenial64"
        fatman_config.vm.hostname = "fatman"
    end

    # API Gateway vagrant ssh gateway
    config.vm.define :gateway do |gateway_config|
        gateway_config.vm.box = "ubuntu/xenial64"
        gateway_config.vm.hostname = "gateway"

        gateway_config.vm.provision :shell, path: "init.sh"
        gateway_config.vm.provision :shell, path: "nodejs.sh"
    end
end
