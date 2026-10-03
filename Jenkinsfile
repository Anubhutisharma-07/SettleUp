pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('settleup') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean compile'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('settleup') {
                    sh './mvnw test'
                }
            }
        }

        stage('Package Backend') {
            steps {
                dir('settleup') {
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'Backend and frontend built, tests passed!'
        }
        failure {
            echo 'Build or tests failed.'
        }
    }
}