/*
* Example structure of pipeline.
*/

def current_stage = "start"  // TODO: If this is a good idea, update this in every stage and communicate the result in slack

node() {
    try {
        stage('checkout code') {
            // Checks out code from version control
            current_phase = "checking out code"
            scm checkout
        }

        stage('archiving files') {
            // Creates a gzip file with selected files
            // These are the files we need in the next environment like docker files etc
            stash includes: '/api', name: 'api'
        }

        stage('building images') {
            // Build docker images in parallel
            // TODO: Use docker plugin to perform tasks related to this...
            def dockerfile="docker-compose.yml"
            parallel firstBranch: {
                dir('/api') {
                   cleanWorkspace(${dockerfile})
                   sh "docker-compose -f ${dockerfile} up"
                }
            }, secondBranch: {
                dir('/api') {
                   sh 'ls -la'
                }
            },
            failFast: true
        }

        stage('upload image to hub') {
             parallel firstBranch: {
                //sh 'docker push 2dv611/app1'
            }, secondBranch: {
                //sh 'docker push 2dv611/app2'
            },
            failFast: true
        }
    } catch(e) {
        // Some error has occured.
        //slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: "${env.BUILD_NAME} encountered an error while doing ${current_stage}", teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
    }
}

/*
node('unit_slave') {
    try {
        stage('unit tests') {
            // Download docker image and run unit tests
             parallel firstBranch: {
                sh 'docker pull 2dv611/app1'
                sh 'docker-compose -f docker-compose-unittests 2dv611/app1'
            }, secondBranch: {
                sh 'docker pull 2dv611/app2'
                sh 'docker-compose -f docker-compose-unittests 2dv611/app2'
            },
            failFast: true
        }
    }
}

node('integration_slave') {
    try {
        stage('a lot of testing') {
            sh 'echo "Puh, this is tiresome..."'
        }
    } catch(e) {
        // Some error occured, send a message
    }
}

// TODO: Look for a cool plugin or send a message to slack and be able to continue?
input "Continue to production?" 

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