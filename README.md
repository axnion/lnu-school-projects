# Group 1 - Configuration management with Ansible

## Deploy to development (vagrant)
1. Run `vagrant up` (The machines does take up a lot of memory!)
1. Run `vagrant ssh mgmt` to access the control machine
1. In the mgmt machine run `ansible-playbook ssh-setup.yml --ask-pass`
1. When asked for password put in `vagrant`
1. Test with `ansible all -m ping`
1. Run `ansible-playbook sites.yml` to install software on nodes

## Deploy to production (Openstack)
1. Run `ansible-playbook openstack_base.yml` on your local machine. When asked provide openstack credentials
1. Copy private SSH key from local machine to Ansible Management Machine (aka mgmt). `scp  /path/to/id.key  username@remote_host:/home/ubuntu/.ssh/id.key`
1. SSH into mgmt machine `ssh username@remote_host` If problem with known_hosts remove old entry with `ssh-keygen -R remote_host`
1. Clone project repository `git clone https://github.com/2dv514/Grupp01-examination-ht17.git project` and `mv project`
1. Run `openstack_compute.yml` playbook with `ansible-playbook openstack_compute.yml` to create compute instances in openstack. Again provide openstack details when asked.
1. Test connections with `ansible all -m ping`
1. Run `sites.yml` playbook with `ansible-playbook sites.yml` to configure machines accordingly.
