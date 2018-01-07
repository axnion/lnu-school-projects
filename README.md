# grup02-examination-ht17

### Some urls
* [Jenkins Dashboard](http://194.47.174.64:8000/)

## Pipeline Setup
1. From the root of the repository, move into openstack directory `cd openstack` 
1. Run playbook to distribute keys to VMs `ansible-playbook infra.yml`. Provide Openstack credentials when asked for them.
1. 
1. Download required roles from Ansible Galaxy `ansible-galaxy install -r requirements.yml`
1. Run playbook to configure the VMs `ansible-playbook configuration.yml --ask-vault-pass --private-key ~/.ssh/openstack`