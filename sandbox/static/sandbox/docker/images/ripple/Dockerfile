FROM alpine

MAINTAINER Sandbox Systems LLC
LABEL com.sandbox.version="ripple-001-beta"
LABEL com.sandbox.release-date="2019.08.08"

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

#Housekeeping
RUN mkdir /src
RUN rm openjdk8*.apk