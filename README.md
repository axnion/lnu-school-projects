# grup02-examination-ht17

## Main Pipeline
### Usage
1. Log into Jenkins Dashboard with credentials bellow
1. Make your changes to the code and push to Github
1. Jenkins will automatically start a new build when changes are pushed to Github.
1. All stages up to and including integration tests are automated.
1. If all tests up to the integration tests pass, then you'll have to manually approve deployment to the staging environment.
1. The staging environment is deployed and stress tests are started automatically. After stress tests are done the staging environment can be used for exploratory testing.
1. Next you'll have to manually approve deployment to the live production environment.
1. If approved, the production environment is deployed.

### Credentials (Only shared because of assignment)
* [Jenkins Dashboard](http://194.47.174.64:8000/)
	* Username: dev
	* Password: 2dv611
* 2dv611ht17gr2 Slack Workspace (NOT CREATED YET)
	* test@mail.com
	* 2dv611
* Ansible Vault
	* 2dv611
	
### Pipeline Summary
|#|Stage|Node|Description|
|----|----|----|----|
|1|Checkout Code|Master|Fetches code from github|
|2|Archive|Master|Archives files which will be available and used later on the different nodes|
|3|Build Image|Master|Creates the Docker image artifact|
|4|Upload image to DockerHub|Master|Uploads the Docker image artifact to Dockerhub as the latest release|
|5|Unit Tests|Unit Slave|Runs application unit tests inside the docker container using docker-compose. Only application container is ran.|
|6|Integration Tests|Integration Slave|Runs integration tests on the whole system in a Docker Compose environment with surrounding software like databases.|
|7|Approve Unstable Build|-|Manual step to move on to staging environment|
|8|Staging|Staging Slave|A production like environment. Stress tests are executed and system is then left online for exploratory testing.|
|9|Approve Stable Build|-|Manual step to move on to production environment|
|10|Production|Production Slave|The main production environement.|

### Some urls
* [Jenkins Dashboard](http://194.47.174.64:8000/)

## Pipeline Setup
1. From the root of the repository, move into openstack directory `cd openstack` 
1. Run playbook to distribute keys to VMs `ansible-playbook infra.yml`. Provide Openstack credentials when asked for them.
1. 
1. Download required roles from Ansible Galaxy `ansible-galaxy install -r requirements.yml`
1. Run playbook to configure the VMs `ansible-playbook configuration.yml --ask-vault-pass --private-key ~/.ssh/openstack`