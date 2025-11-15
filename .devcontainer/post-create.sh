#!/bin/bash

mkdir -p $HOME/.kube
sudo kind create cluster --kubeconfig $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config