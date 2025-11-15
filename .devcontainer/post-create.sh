#!/bin/bash
set -e

export KIND_EXPERIMENTAL_DOCKER_NETWORK="crappital-net"
kind create cluster
sed -i 's|server: https://127.0.0.1:.*|server: https://kind-control-plane:6443|g' /root/.kube/config
kubectl wait --for=condition=Ready node --all --timeout=300s