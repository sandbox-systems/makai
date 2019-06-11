FROM alpine
MAINTAINER Sandbox Systems LLC
RUN apk update
RUN apk add vim
RUN apk add curl

#Java
RUN apk fetch openjdk8
RUN apk add openjdk8

ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

#Python
RUN apk add python3