/*
* Pipeline for 2DV611 project.
*/

// Reference to the Docker image
def build

/*
* Jenkins Master
*/
node('master') {

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
            stash includes: 'api/docker-compose-staging.yml, api/docker-compose-production.yml, api/test/staging_tests/**', name: 'staging'
            stash includes: 'api/docker-compose-integration.yml, api/test/integration_tests/**', name: 'integration'
            stash includes: 'api/docker-compose-unit.yml, api/test/unit_tests/**', name: 'unit'
            stash includes: 'api/docker-compose-production.yml', name: 'production'
        }

        /*
        * Build Docker image from dockerfile
        */
        stage('Building image') {
            dir('./api') {
                 build = docker.build("tommykronstal/2dv611api")
            }
        }
        
        /*
        * Push Docker image to Dockerhub
        */
        stage('Upload image to docker hub') {
            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                build.push("latest")
            }
        }
    } catch(e) {
        failureSlack("building project")
        currentBuild.result = 'FAILURE'
        error "There where failures while building Docker image"
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
                pullImages("tommykronstal/2dv611api")
                sh "docker-compose -f ${dockerfile} up --exit-code-from web web"
                junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: 'test/unit_tests/report/test-report.html'

                sh 'ls -l test/unit_tests/report'

            }
        }
    } catch(e) {
        failureSlack("running unit tests")
        currentBuild.result = 'FAILURE'
        error "There where failures in the unit tests"
    } finally {
        dir('./api') {
            publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'test/unit_tests/report',
                reportFiles: 'test-report.html',
                reportName: 'Unit test report'
            ])

            /*
            publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'coverage/lcov-report/',
                reportFiles: 'index.html',
                reportName: 'Test coverage'
            ])
            */
        }
    }
}

/*
* Jenkins Integration Slave
*/

node('integration_slave') {
    try {
        stage('Integration Testing') {
            sh "docker run -v ${WORKSPACE}/api/test/integration_tests:/etc/newman -t busybox rm -rf /etc/newman/*"
            def dockerfile = "docker-compose-integration.yml"
            unstash 'integration'

            dir('./api') {
                cleanWorkspace("${dockerfile}")
                pullImages("tommykronstal/2dv611api")
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
                keepAll: false,
                reportDir: 'test/integration_tests/newman',
                reportFiles: '**.html',
                reportName: "Integration test report"
            ])
        }
    }
}

/*
* Ask for manual approval to continue to staging
*/
stage('Approve Unstable Build') {
    manualStepSlack('staging')
    input('Publish unstable build and deploy to staging?')
}

/*
* Deploy unstable image build to Dockerhub 
*/
node('master') {
    stage('Upload unstable image to Dockerhub') {
        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            build.push("unstable")
        }
    }
}
/*
* Jenkins Staging Slave
*/
node('staging_slave') {
    try {
        stage('Staging') {
            unstash 'staging'
            dir('./api') {
                // Do performance tests
                def dockerfile = "docker-compose-staging.yml"
                cleanWorkspace("${dockerfile}")
                sh "docker-compose -f ${dockerfile} pull"
                sh "docker-compose -f ${dockerfile} up --exit-code-from testrunner testrunner web"
                cleanWorkspace("${dockerfile}")
                
                // Set up production like env for exploratory testing
                def composefile = "docker-compose-production.yml"
                cleanWorkspace("${composefile}")
                sh "docker-compose -f ${composefile} pull"
                sh "docker-compose -f ${composefile} up -d"
            }
        }
    } catch(e) {
        failureSlack("running staging tests")
        currentBuild.result = 'FAILURE'
        error "There where failures in the staging tests"
    } finally {
        perfReport compareBuildPrevious: true, modeThroughput: true, relativeFailedThresholdNegative: 5.0, relativeFailedThresholdPositive: 5.0, relativeUnstableThresholdNegative: 5.0, relativeUnstableThresholdPositive: 5.0, sourceDataFiles: '**/staging_tests/taurus*'
        junit allowEmptyResults: true, healthScaleFactor: 2.0, testResults: '**/staging_tests/junit*'
    }
}

/*
* Ask for manual approval to continue to production
*/
stage('Deploy to production') {
    manualStepSlack('production')
    input('Deploy to production?')
}

/*
* Jenkins Production Slave
*/
node('production') {
    try {
        stage('Production') {
            unstash 'production'
            dir('./api') {
                def composefile = "docker-compose-production.yml"
                cleanWorkspaceKeepVolumes("${composefile}")
                sh "docker-compose -f ${composefile} pull"
                sh "docker-compose -f ${composefile} up -d"
            }
        }

        stage('Smoke Testing') {
            sleep 5
            sh 'curl localhost' // VEEEERY simple smoke test. Should be replaced
        }

    } catch(e) {
        try {
            stage('Rollback') {
                dir('./api') {
                    def composefile = "docker-compose-production.yml"
                    cleanWorkspaceKeepVolumes("${composefile}")
                    sh "sed -i 's/unstable/stable/g' ${composefile}"
                    cleanWorkspaceKeepVolumes("${composefile}")
                    sh "docker-compose -f ${composefile} pull"
                    sh "docker-compose -f ${composefile} up -d"
                }
            }
            currentBuild.result = 'UNSTABLE'
            failureSlack("deploying to production... rolling back.")

        } catch(err) {
            failureSlack("Deployment failed, was unable to roll back")
            currentBuild.result = 'FAILURE'
            error "There where failures when rolling back to previous version"
        }
    }
}

node('master') {
    if(currentBuild.result == 'SUCCESS') {
        stage('Upload stable image to Dockerhub') {
            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                build.push("stable")
            }
        }
    }
}

/*
* Pull down Docker image from Dockerhub
*/
def pullImages(imagename) {
    sh "docker pull ${imagename}"
}

/*
* Remove any existing running containers, including volumes
*/
def cleanWorkspace(dockerfile) {
    sh "docker-compose -f ${dockerfile} down -v"
}

/*
* Remove any existing running containers, including volumes
*/
def cleanWorkspaceKeepVolumes(dockerfile) {
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
