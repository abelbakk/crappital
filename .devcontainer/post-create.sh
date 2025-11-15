#!/bin/bash

sudo minikube start --force --driver=docker
sudo minikube addons enable nginx