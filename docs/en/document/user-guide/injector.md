# Sermant-injector User Manual

## Function Introduction

In Kubernetes environment, Sermant supports quickly deployment by using **sermant-injector** module to automatically mount sermant-agent package for host application. 

Sermant-injector is based on the **Kubernetes Admission Controllers.** The admission controller is located in the K8s API Server and is able to intercept requests to the API Server to complete operations such as authentication, authorization, and mutation.

Sermant-injector is a MutatingAdmissionWebhook that can intercept and modify requests before creating container resources. After sermant-injector is deployed on K8s, just add `sermant-injection:Enabled` to the YAML file of the host application deployment configuration at the `spec > Template > metadata> labels` ' then the host application can automatically mount the sermant-agent package.

## Parameter Configuration

**Public environment variables configuration: **

Sermant-injector supports configuring custom environment variables for the host application in pod. Just modifying the content of the env in `sermant-injector/deployment/release/injector/values.yaml ` , The change is as follows (kv form) :

```yaml
env:
  TEST_ENV1: abc
  TEST_ENV2: 123456
```

For example, during the use of Sermant, certain configurations are common to all pods in the current k8s cluster, such as ip and port of the **Backend**. You can configure it here:

```yaml
env:
  backend.nettyIp: 127.0.0.1
  backend.nettyPort: 8900
```

All sermants in pods are connected to the **Backend**.

Please refer to the startup and result verification section for the relevant parameter modification during the deployment of sermant-injector.

## Version Supported

Sermant-injector currently supports Kubernetes 1.15+ and deploys with Helm v3 for Kubernetes package management.

- [Kubernetes 1.15+](https://kubernetes.io/)

- [Helm v3](https://helm.sh/)

## Startup and Result Validation

Before deploying **sermant-injector**, you need to build the **sermant-agent** image and the **sermant-injector** image.

### Build Image of Sermant-agent

#### Prepare Sermant-agent package

Click [here](https://github.com/huaweicloud/Sermant/releases) to download latest release package `sermant-agent-x.x.x.tar.gz` or you can package sermant yourself.

#### Build Image

Modify the values of `sermantVersion`, `imageName` and `imageVerison` in the `build-sermant-image.sh` under `images/sermant-agent` folder:

> 1. `sermantVersion` is the version of the release package.
>
> 2. `imageName` is the name of the built sermant-agent image.
>
> 3. `imageVerison` is the version for the built sermant-agent image.

Move `build-sermant-image.sh` and `Sermant.dockerfile` to the same directory as the release package `sermant-agent-xxx.tar.gz` in one of K8s nodes. Run `build-sermant-image.sh` to build the sermant-agent image.

```shell
sh build-sermant-image.sh
```

### Build Image of Sermant-injector

#### Package Sermant-injector

Execute the `mvn clean package` command to generate the `sermant-injector.jar` file in the directory of sermant-injector project.

#### Build Image

Modify the values of `imageName` and `imageVerison` in the `build-injector-image.sh` script under `images/injector` folder:

> 1. `imageName` is the name of the built image of sermant-injector.
> 2. `imageVerison` is the version of the built image of sermant-injector.

Move `build-injector-image.sh`, `start.sh` and `Injector.Dockerfile` to the same directory as the package `sermant-injector.jar`. Run `build-injector-image.sh` to create the sermant-injector image.

```shell
sh build-injector-image.sh
```

### Deploy Workload of Sermant-injector 

Before the host application can be containerized, the workload of sermant-injector needs to be deployed. This project adopts Helm for Kubernetes package management.

Use Chart template in`injector` under `deploment/release`.

Modify the template variable in `values.yaml` according to the actual environment:

> The values of `agent.image.addr` and `injector.image.addr` are the same as the image address when the images are built

Once this is done, execute `helm install` to deploy the sermant-injector workload in K8s:

```shell
helm install sermant-injector ../injector
```

Check that the status of the deployed pod of sermant-injector is running.

At this point, the environment configuration of the host application before deployment is complete.

### Deploy Host Application 

After the deployment of above sermant-injector, developers should write YAML file to deploy K8s Deployment resources according to the actual application. Simply add `sermant-injection: enabled` at the `spec > Template > Metadata > Labels` to automatically mount the sermant-agent. (If you do not want to mount it later, just delete it and restart the application)

```yaml
apiVersion: v1
kind: Deployment
metadata:
  name: demo-test
  labels:
    app: demo-test
spec:
  replicas: 1
  selector:
    app: demo-test
    matchLabels:
      app: demo-test
  template:
    metadata:
      labels:
        app: demo-test
        sermant-injection: enabled
    spec:
      containers:
      - name: image
        # Please replace it with own image
        image: image:1.0.0
        ports: 
        - containerPort: 8080
  ports:
    - port: 443
      targetPort: 8443
```

If the pod cannot be created, check that the sermant-injector is deployed correctly and that the sermant-agent image is built correctly.

### Verification

Once the pod is created, execute the following command, where `${pod_name}` is the pod name of host application.

```shell
kubectl get po/${pod_name} -o yaml
```

1. Check if the output contains the environment variable whose name is `JAVA_TOOL_OPTIONS`and value is `-javaagent:/home/sermant-agent/agent/sermant-agent.jar=appName=default` in `spec > containers > - env`.

2. Check if the value of `spec > containers > initContainers > image` is the image address used to build the sermant-agent image.

Execute the following command, where `${pod_name}` is the pod name of host application and `${namespace}` is the namespace name of deployed host application.

```shell
kubectl logs ${pod_name} -n ${namespace}
```

3. Check if the beginning of the pod log in the output of the above command contains:

```
[INFO] Loading sermant agent...
```

If the above information is correct, the sermant-agent has been successfully mounted into the host application.