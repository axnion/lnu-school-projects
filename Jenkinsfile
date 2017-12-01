node {
    node() {
        try {
            stage('checkout code') {
                scm checkout
            } 
        } catch(e) {
            // Some error has occured.
            //slackSend baseUrl: 'https://2dv611ht17gr2.slack.com/services/hooks/jenkins-ci/', channel: '#jenkins', color: 'bad', message: '${env.BUILD_NAME} encountered an error while checking out (not really, just testing)', teamDomain: '2dv611ht17gr2', token: 'CYFZICSkkPl29ILJPFgbmDSA'
        }
    }
}