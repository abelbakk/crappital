#!/bin/bash
set -e

export KIND_EXPERIMENTAL_DOCKER_NETWORK="crappital-net"
kind create cluster --config .devcontainer/kind-config.yaml
sed -i 's|server: https://127.0.0.1:.*|server: https://kind-control-plane:6443|g' /root/.kube/config
kubectl wait --for=condition=Ready node --all --timeout=300s

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --wait \
  --timeout 15m