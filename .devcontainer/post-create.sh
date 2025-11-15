#!/bin/bash

mkdir -p $HOME/.kube
export KIND_EXPERIMENTAL_DOCKER_NETWORK="crappital-net"
sudo kind create cluster --kubeconfig $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl wait --for=condition=Ready node --all --timeout=300s