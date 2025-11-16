#!/bin/bash
set -e

export KIND_EXPERIMENTAL_DOCKER_NETWORK="crappital-net"
kind create cluster --config .devcontainer/kind-config.yaml
sed -i 's|server: https://127.0.0.1:.*|server: https://kind-control-plane:6443|g' /root/.kube/config
kubectl wait --for=condition=Ready node --all --timeout=300s

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s