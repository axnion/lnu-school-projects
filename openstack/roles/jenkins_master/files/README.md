### Jenkins config

contents of this folder should be located on jenkins master node at $JENKINS_HOME/ for example:
* /var/lib/jenkins/jobs
* /var/lib/jenkins/nodes

Name credentialids to the following to make jenkins read them from its credentials store
* slaves: slaves
* github: github-credentials
* docker hub: docker-hub-credentials