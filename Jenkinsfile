/*
* Example structure of pipeline.
*/

node('master') {
    def api

    try {
        stage('checkout code') {
            // Checks out code from version control
            checkout scm
        }

        stage('archiving files') {
            // Creates a gzip file with selected files
            // These are the files we need in the next environment like docker files etc
            stash includes: 'api/docker*', name: 'dockerfiles'
            stash includes: 'api/docker-compose-staging.yml, api/test/staging_tests/**', name: 'staging'
            stash includes: 'api/docker-compose-integration.yml, api/test/integration_tests/**', name: 'integration'
        }

        stage('Building image') {
            
            // Build docker image for API
            dir('./api') {
                 api = docker.build("tommykronstal/2dv611api")
            }
        }
        
        stage('Upload image to docker hub') {
            // Push image to registry
            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                api.push("${env.BUILD_NUMBER}")
                api.push("latest")
            }
        }
    } catch(e) {

        // Some error has occured.
        currentBuild.result = 'FAILURE'
        sh "echo ${e}"
        reportToSlack()
    }
}

/*
node('unit_slave') {
    try {
        stage('unit tests') {
            // What to do here? Unit tests...
        }
    } catch(e) {
        currentBuild.result = 'FAILURE'
        sh "echo ${e}"
        slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: "${env.BUILD_NAME} encountered an error while doing ${current_stage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
    }
}
*/

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
        stage('Integration testing') {
            unstash 'integration'
            dir('./api') {
                def dockerfile = "docker-compose-integration.yml"
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
                // TODO: clear workdir after archiving
            }
        }
    } catch(e) {
        // Some error occured, send a message
        currentBuild.result = 'FAILURE'
        reportToSlack()
    }
}

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
            sh 'ls -l'
            stage('Start API and mongo') {
                dir('./api') {
                    def dockerfile = "docker-compose-staging.yml"
                    cleanWorkspace("${dockerfile}")
                    sh "docker-compose -f ${dockerfile} up -d"
                }
            }

            stage('Run taurus staging tests') {
                sh "docker run -i --rm -v ${WORKSPACE}/api/test/staging_tests:/bzt-configs blazemeter/taurus jmeter.yml test.yml"
                perfReport compareBuildPrevious: true, modeThroughput: true, relativeFailedThresholdNegative: 5.0, relativeFailedThresholdPositive: 5.0, relativeUnstableThresholdNegative: 5.0, relativeUnstableThresholdPositive: 5.0, sourceDataFiles: '**/staging_tests/taurus*'
                junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: '**/staging_tests/junit*'
            }
        }
    } catch(e) {
        // Some error occured, send a message
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
