#!/bin/bash

mkdir -p $HOME/.kube
sudo kind create cluster --network "crappital-net" --kubeconfig $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl wait --for=condition=Ready node --all --timeout=300s