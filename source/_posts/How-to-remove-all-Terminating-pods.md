---
title: How to remove all Terminating pods
date: 2023-03-15 14:47:59
tags: k8s
categories:
  - Solution
---

Sometimes all pods of k8s will be in Terminating state, use this command to clean up all pods.

```shell
kubectl get pods --all-namespaces | grep Terminating | while read line; do
  pod_name=$(echo $line | awk '{print $2}' ) \
  name_space=$(echo $line | awk '{print $1}' ); \
  kubectl delete pods $pod_name -n $name_space --grace-period=0 --force
done
```
