pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('settleup') {
                    bat 'mvnw.cmd clean compile'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('settleup') {
                    bat 'mvnw.cmd test'
                }
            }
        }

        stage('Package Backend') {
            steps {
                dir('settleup') {
                    bat 'mvnw.cmd clean package -DskipTests'
                }
            }
        }
    }

    post {
        success {
            echo 'Build and tests passed!'
        }
        failure {
            echo 'Build or tests failed.'
        }
    }
}