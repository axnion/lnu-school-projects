node('master') {
    try {
        stage('Git') {
           git branch: 'master', credentialsId: 'github-credentials', url: 'https://github.com/2dv611/grupp02-testning-ht17.git'
           sh "echo ${cloneUrl}"
       }
    } catch(e) {
        currentBuild.result = 'FAILURE'
        sh "echo ${e}"
        reportToSlack()
    }
}

node('test') {
    // Perform tests ? when done curl back to API 
    // How do we match the build to a student ? 
}