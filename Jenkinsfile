/*
* Pipeline for 2DV611 project.
*/


/*
* Jenkins Master
*/
node('master') {
    def api

    try {
        /*
        * Check out code from version control
        */
        stage('checkout code') {
            checkout scm
        }

        /*
        * Archive Docker and Docker-Compose files to use on slave machines
        */
        stage('archiving files') {
            stash includes: 'api/docker*', name: 'dockerfiles'
            stash includes: 'api/docker-compose-staging.yml, api/test/staging_tests/**', name: 'staging'
            stash includes: 'api/docker-compose-integration.yml, api/test/integration_tests/**', name: 'integration'
            stash includes: 'api/docker-compose-unit.yml, api/test/unit_tests/**', name: 'unit'
            stash includes: 'api/docker-compose-production.yml', name: 'production'
        }

        /*
        * Build Docker image from dockerfile
        */
        stage('Building image') {
            dir('./api') {
                 api = docker.build("tommykronstal/2dv611api")
            }
        }
        
        /*
        * Push Docker image to Dockerhub
        */
        stage('Upload image to docker hub') {
            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                api.push("latest")
            }
        }
    } catch(e) {
        errorHandler(e)
    }
}

/*
* Jenkins Unit Slave
*/
node('unit_slave') {
    try {
        stage('unit tests') {
            unstash 'unit'
            dir('./api') {
                def dockerfile = "docker-compose-unit.yml"
                cleanWorkspace("${dockerfile}")
                sh "docker-compose -f ${dockerfile} up --exit-code-from web web"
                junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: 'test/unit_tests/report/test-report.html'

                publishHTML (target: [
                                        allowMissing: false,
                                        alwaysLinkToLastBuild: false,
                                        keepAll: true,
                                        reportDir: 'test/unit_tests/report/',
                                        reportFiles: 'test-report.html',
                                        reportName: 'Unit test report'
                                    ])
                /*publishHTML (target: [
                                        allowMissing: false,
                                        alwaysLinkToLastBuild: false,
                                        keepAll: true,
                                        reportDir: 'coverage/lcov-report/',
                                        reportFiles: 'index.html',
                                        reportName: 'Test coverage'
                                    ])*/
            }
        }
    } catch(e) {
        currentBuild.result = 'FAILURE'
       /* currentBuild.result = 'FAILURE'
        sh "echo ${e}"
        slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: "${env.BUILD_NAME} encountered an error while doing ${current_stage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
        */ 
    }
}

/*
* Jenkins Integration Slave
*/
node('integration_slave') {
    try {
        stage('Integration Testing') {
            def dockerfile = "docker-compose-integration.yml"
            unstash 'integration'

            dir('./api') {
                cleanWorkspace("${dockerfile}")
                sh "docker-compose -f ${dockerfile} up --exit-code-from testrunner testrunner"
            }
        }
    } catch(e) {
        failureSlack("running integration tests")
        currentBuild.result = 'FAILURE'
        error "There where failures in the integration tests"
    } finally {
        dir('./api') {
            junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: 'test/integration_tests/newman/**.xml'

            publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'test/integration_tests/newman',
                reportFiles: '**.html',
                reportName: "Integration test report"
            ])
        }
    }
}

stage('Approve Unstable Build') {
    manualStepSlack('staging')
    input('Publish unstable build and deploy to staging?')
}

// TODO: Push image to unstable branch

/*
* Jenkins Staging Slave
*/
node('staging_slave') {
    // -> Tommy <-
    // Get image for API from docker hub
    // Seed DB with staging objects
    // jMeter (or some other tool) to perform some staging loading and acceptance tests??
    // Send a report, with slack
    // Report to jenkins
    try {
        stage('Staging') {
            unstash 'staging'
            dir('./api') {
                def dockerfile = "docker-compose-staging.yml"
                cleanWorkspace("${dockerfile}")
                sh 'docker pull tommykronstal/2dv611api'
                sh "docker-compose -f ${dockerfile} up --exit-code-from testrunner testrunner web"
                perfReport compareBuildPrevious: true, modeThroughput: true, relativeFailedThresholdNegative: 5.0, relativeFailedThresholdPositive: 5.0, relativeUnstableThresholdNegative: 5.0, relativeUnstableThresholdPositive: 5.0, sourceDataFiles: '**/staging_tests/taurus*'
                junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: '**/staging_tests/junit*'
            }
        }
    } catch(e) {
        // Some error occured, send a message
        //currentBuild.result = 'FAILURE'
    }
}

stage('Approve Stable Build') {
    manualStepSlack('production')
    input('Publish stable build and deploy to production?')
}

// TODO: Push image to stable branch

/*
* Jenkins Production Slave
*/
node('production') {
    try {
        stage('Production') {
            unstash 'production'
            dir('./api') {
                def composefile = "docker-compose-production.yml"
                cleanWorkspace("${composefile}")
                sh 'docker pull tommykronstal/2dv611api'
                sh "docker-compose -f ${composefile} up -d --build"
            }
        }
    } catch(e) {
        currentBuild.result = 'FAILURE'
    }
}

/*
* Pull down Docker image from Dockerhub
*/
def pullImages(imagename) {
    sh "docker pull ${imagename}"
}

/*
* Remove any existing running containers
*/
def cleanWorkspace(dockerfile) {
    sh "docker-compose -f ${dockerfile} down"
}

/*
* Send message to Slack to inform users of a failure in the pipeline
*/
def failureSlack(currentStage) {
    slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: "Build #${env.BUILD_NUMBER} encountered an error when ${currentStage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
}

/*
* Send message to Slack to inform users of a manual step waiting for approval in the pipeline
*/
def manualStepSlack(nextStage) {
    slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'good', message: "Build #${env.BUILD_NUMBER} is waiting for manual approvement to move to ${nextStage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
}