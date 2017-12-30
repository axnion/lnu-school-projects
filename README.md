# grup02-examination-ht17

## Start Vagrant environment
1. Start VMs `vagrant up` 
1. SSH into management machine `vagrant ssh mgmt` 
1. Move into openstack directory `cd openstack` 
1. Run playbook to distribute keys to VMs `ansible-playbook vagrant-ssh-setup.yml --ask-pass --ask-vault-pass`
  1. Give SSH password (vagrant)
  1. Give Vault password (mypassword)
1. Download required roles from Ansible Galaxy `ansible-galaxy install -r requirements.yml`
1. Run playbook to configure the VMs `ansible-playbook configuration.yml --ask-vault-pass --private-key ~/.ssh/openstack`

### Some urls
* [Jenkins master](http://194.47.174.52:8000/)