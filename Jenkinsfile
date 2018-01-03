/*
* Pipeline for 2DV611 project.
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

node('unit_slave') {
    try {
        stage('unit tests') {
            unstash 'unit'
            dir('./api') {
                def dockerfile = "docker-compose-unit.yml"
                cleanWorkspace("${dockerfile}")
                sh "ls -a"
                sh "docker-compose -f ${dockerfile} up --exit-code-from web web"
                /*junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: 'test/unit_tests/report/test-report.html'

                publishHTML (target: [
                                        allowMissing: false,
                                        alwaysLinkToLastBuild: false,
                                        keepAll: true,
                                        reportDir: 'test/unit_tests/report/',
                                        reportFiles: 'test-report.html',
                                        reportName: 'Unit test report'
                                    ])
                publishHTML (target: [
                                        allowMissing: false,
                                        alwaysLinkToLastBuild: false,
                                        keepAll: true,
                                        reportDir: 'test/unit_tests/coverage/lcov-report/',
                                        reportFiles: 'index.html',
                                        reportName: 'Test coverage'
                                    ])*/
            }
        }
    } catch(e) {
        errorHandler(e)
       /* currentBuild.result = 'FAILURE'
        sh "echo ${e}"
        slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: "${env.BUILD_NAME} encountered an error while doing ${current_stage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
        */ 
    }
}

node('integration_slave') {
    // -> Axel <-
    // Get image from Docker Hub
    // Start docker-compose-integration.yml
    //      Load postman script into newman container as a volume
    // (Optional) Populate DB
    // Execute tests with Newman
    //      Save report to volume
    // Send report to Slack
    // Report results to Jenkins
    try {
        stage('Integration Testing') {
            def dockerfile = "docker-compose-integration.yml"
            unstash 'integration'

            // stage('Cleanup') {
            //    sh "docker run -v ${WORKSPACE}/api/test/integration_tests:/etc/newman -t busybox rm -rf /etc/newman/*"
            // }

            dir('./api') {
                cleanWorkspace("${dockerfile}")
                sh "docker-compose -f ${dockerfile} up --exit-code-from testrunner testrunner"
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
    } catch(e) {
        // Some error occured, send a message
        //currentBuild.result = 'FAILURE'
        //reportToSlack()
        errorHandler(e)
    }
}

stage('Approve Unstable Build') {
    input('Publish unstable build and deploy to staging?')
}

// Push image to unstable branch

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
    input('Publish stable build and deploy to production?')
}

// Push image to stable branch
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


// TODO: Look for a cool plugin or send a message to slack and be able to continue?
//input "Continue to production?" 

/*
node('production') {

}
*/


def pullImages(imagename) {
    // DRY FTW!
    sh "docker pull ${imagename}"
}

def cleanWorkspace(dockerfile) {
    // Can be a good idea to do some tidy up before deploying in the environment
    sh "docker-compose -f ${dockerfile} down"
}

def reportToSlack() {
    slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: "${env.BUILD_NAME} encountered an error while doing ${current_stage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
}

def errorHandler(error) {
    currentBuild.result = 'FAILURE'
    sh "echo ${error}"
}