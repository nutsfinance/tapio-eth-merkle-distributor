pipeline {
  options {
    disableConcurrentBuilds()
  }
  agent {
    kubernetes{
      yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-ecr
  volumes:
    - name: docker-config
      configMap:
        name: ecr-docker-config
  containers:
  - name: git
    image: 343749756837.dkr.ecr.ap-southeast-1.amazonaws.com/git-kustomize:0.0.1
    tty: true
    command: ['cat']
  - name: kaniko
    image: gcr.io/kaniko-project/executor:v1.8.1-debug
    tty: true
    command: ['cat']
    volumeMounts:
      - name: docker-config
        mountPath: /kaniko/.docker/
"""
    }
  }
  stages {
    stage('Build') {
      when {
        branch 'master'
      }
      steps {
        container(name: 'kaniko') {
          sh "/kaniko/executor --context `pwd` --destination 343749756837.dkr.ecr.ap-southeast-1.amazonaws.com/stable-asset-rewards/automation:${env.GIT_COMMIT.take(7)}"
        }
        container(name: 'git') {
          withCredentials([file(credentialsId: 'jenkins-deployment-ssh', variable: 'SSH_KEYS')]) {
            sh 'cp $SSH_KEYS /root/.ssh/id_ed25519 && chmod 0600 /root/.ssh/id_ed25519'
            sh 'cd /tmp && git clone git@github.com:nutsfinance/k8s-manifests.git'
            sh "cd /tmp/k8s-manifests/rewards-automation && kustomize edit set image 343749756837.dkr.ecr.ap-southeast-1.amazonaws.com/stable-asset-rewards/automation:${env.GIT_COMMIT.take(7)}"
            sh 'git config --global user.email "deploy@nuts.finance" && git config --global user.name "CI Deployment"'
            sh "cd /tmp/k8s-manifests/ && git commit -am 'updating stable-asset-rewards/automation to ${env.GIT_COMMIT.take(7)}' && git push"
          }
        }
      }
    }
  }
}
