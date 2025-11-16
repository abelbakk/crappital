#!/bin/bash
set -e

KUBECONFIG_PATH="$PWD/.kube-config"
export KIND_EXPERIMENTAL_DOCKER_NETWORK="crappital-net"

kind create cluster \
    --config .devcontainer/kind-config.yaml \
    --kubeconfig ${KUBECONFIG_PATH}
sed -i 's|server: https://127.0.0.1:.*|server: https://kind-control-plane:6443|g' ${KUBECONFIG_PATH}
kubectl wait --kubeconfig ${KUBECONFIG_PATH} --for=condition=Ready node --all --timeout=300s

kubectl apply --kubeconfig ${KUBECONFIG_PATH} \
  -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --kubeconfig ${KUBECONFIG_PATH} \
  --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo "alias k9s='k9s --kubeconfig ${KUBECONFIG_PATH}'" >> /root/.profile