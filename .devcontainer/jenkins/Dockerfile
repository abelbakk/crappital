FROM jenkins/jenkins:lts-jdk21

USER root

RUN /usr/local/bin/install-plugins.sh \
    configuration-as-code \
    nodejs \
    git \
    dark-theme

USER jenkins