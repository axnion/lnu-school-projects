# Group 1 - Configuration management with Ansible

## Start local test machines
1. Run `vagrant up` (The machines does take up a lot of memory!)
1. Run `vagrant ssh mgmt` to access the control machine
1. In the mgmt machine run `ansible-playbook ssh-setup.yml --ask-pass`
1. When asked for password put in `vagrant`
1. Test with `ansible all -m ping`
