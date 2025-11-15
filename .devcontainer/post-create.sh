#!/bin/bash
set -e

kind create cluster
kubectl wait --for=condition=Ready node --all --timeout=300s