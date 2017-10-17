# Group 1 - Configuration management with Ansible

## Start local test machines
1. Run `vagrant up` (The machines does take up a lot of memory!)
1. Run `vagrant ssh mgmt` to access the control machine
1. In the mgmt machine run `ansible-playbook ssh-setup.yml --ask-pass`
1. When asked for password put in `vagrant`
1. Test with `ansible all -m ping`
1. Run `ansible-playbook sites.yml` to install software on nodes

## Deploy to OpenStack
* Run `ansible-playbook openstack_base.yml` on any machine
	* Provide `username` and `password` for OpenStack
* Copy private SSH key from local machine to Ansible Management Machine (mgmt) `scp  cloud.key  ubuntu@0.0.0.0:/cloud.key -i cloud.key`. Replace 0.0.0.0 with mgmt public ip.
* Connect to mgmt machine over SSH `ssh -i cloud.key ubuntu@0.0.0.0`. Replace 0.0.0.0 with mgmt public ip.
* Clone repository `git clone https://github.com/2dv514/Grupp01-examination-ht17.git project`
* Move into repository folder `mv project`
* Run `sites.yml` playbook with `ansible-playbook sites.yml`