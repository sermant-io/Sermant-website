# Sermant-injector User Manual

Sermant-injector is based on the **Kubernetes Admission Controllers.** The admission controller is located in the K8s API Server and is able to intercept requests to the API Server to complete operations such as authentication, authorization, and mutation. This article introduces how to use the sermant-injector component to realize the rapid deployment of the host application to automatically mount the sermant-agent package in the k8s environment.


Sermant-injector is a MutatingAdmissionWebhook that can intercept and modify requests before creating container resources. After sermant-injector is deployed on K8s, just add `sermant-injection:Enabled` to the YAML file of the host application deployment configuration at the `spec > Template > metadata> labels` ' then the host application can automatically mount the sermant-agent package. Additionally, sermant-injector supports configuring environment variables via `annotations`. How the deployed applications can automatically mount Sermant and configure environment variables via `annotations` is described in [Deploy Host Application](# deploy-host-application) below.

## Parameter Configuration

### Parameter Configuration for sermant-injector

This project adopts  Helm for Kubernetes package management. The parameters for deploying sermant-injector are set in [sermant-injector/deployment/release/values.yaml](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/deployment/release/injector/values.yaml).

```yaml
namespace:
  name: default

injector:
  replicas: 2
  image:
    addr:
    pullPolicy: IfNotPresent
    pullSecrets: default-secret

agent:
  image:
    addr:
    pullPolicy: IfNotPresent

config:
  type: ZOOKEEPER
  endpoints: http://localhost:30110
registry:
  endpoints: http://localhost:30100

configMap:
  enabled: false
  namespaces: [default]
  env:
```

The parameters are described as follows:

| <span style="display:inline-block;width:100px">Primary Parameter Key</span> | <span style="display:inline-block;width:120px">Second Parameter Key</span> | <span style="display:inline-block;width:100px">Third Parameter Key</span> | Description | <span style="display:inline-block;width:80px">Required</span> |
| ------------ | ------------- | ------------ | ------------------------------------------------------------ | -------- |
| namespace    | name          | -            | The namespace where the sermant-injector resides.            | True     |
| injector     | replicas      | -            | Number of deployed sermant-injector instances.               | True     |
|              | image         | addr         | The mirror address of sermant-injector.                      | True     |
|              |               | pullPolicy   | Sermant-injector image pull strategy: Always(always pull), IfNotPresent(default value, use local mirror if exists), Never(only use local mirror and never pull). | True     |
|              |               | pullSecrets  | Pull secrets. The default key is default-secret and you can change it on command. | True     |
| agent        | image         | addr         | The mirror address of sermant-agent.                         | True     |
|              |               | pullPolicy   | Sermant-agent image pull strategy: Always(always pull), IfNotPresent(default value, use local mirror if exists), Never(only use local mirror and never pull). | True     |
| config       | type          | -            | Configuration center type of sermant-agent: Currently two types are supported, ZOOKEEPER and KIE. | True     |
|              | endpoints     | -            | Configuration center address of sermant-agent.               | True     |
| registry     | endpoints     | -            | Registration center address of sermant-agent.                | True     |
| configMap    | enabled       | -            | Common environment variable configuration switch. The default value is false. Set it to true if you want to config common environment variables. | True     |
|              | namespaces    | -            | The namespaces to be injected with configMap which must be the same as that of the service application. | True     |
|              | env           | custom key1  | You can configure custom value1.                         | False    |
|              |               | custom key2  | You can configure custom value2.                           | False    |

**Public environment variables configuration: **

Sermant-injector supports configuring custom environment variables for the host application in pod. Just modifying the content of the `configMap.env` in `sermant-injector/deployment/release/injector/values.yaml `. The prerequisite is that `configMap.enabled` is set to `true`, and `configMap.namespace` is configured correctly. Common environment variables can be configured as follows (kv form) :

```yaml
configMap:
  enabled: true
  namespaces: [default, test]
  env:
  	TEST_ENV1: abc
  	TEST_ENV2: 123456
```

For example, during the use of Sermant, certain configurations are common to all pods in the current k8s cluster, such as ip and port of the **Backend**. You can configure it here:

```yaml
configMap:
  enabled: true
  namespaces: [default]	
  env:
  	backend.nettyIp: 127.0.0.1
  	backend.nettyPort: 8900
```

All sermants in pods of default namespace are connected to the **Backend**.

**Note** : The priority of environment variables configured `configMap`  is lower than that of `env` in yaml of host application. Because `config.type`, `config.endpoints`, and `registry.endpoints` are essentially `env ` loaded environment variables, they also take precedence over the corresponding sermant environment variables configured with `configMap`.

### Parameter Configuration for mirror scripts

**[build-sermant-image.sh](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/images/sermant-agent/build-sermant-image.sh)**

| Parameters     | Description                           | Required |
| -------------- | ------------------------------------- | -------- |
| sermantVersion | Version of sermant-agent-x.x.x.tar.gz | True     |
| imageName      | Image name of sermant-agent mirror    | True     |
| imageVersion   | Image version of sermant-agent mirror | True     |

**[build-injector-image.sh](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/images/injector/build-injector-image.sh)**

| Parameters   | Description                              | Required |
| ------------ | ---------------------------------------- | -------- |
| imageName    | Image name of sermant-injector mirror    | True     |
| imageVersion | Image version of sermant-injector mirror | True     |

## Version Supported

Sermant-injector currently supports Kubernetes 1.15+ and deploys with Helm v3 for Kubernetes package management.

- [Kubernetes 1.15+](https://kubernetes.io/)

- [Helm v3.1+](https://helm.sh/)

## Startup and Result Validation

Before deploying **sermant-injector**, you need to build the **sermant-agent** image and the **sermant-injector** image.

### Build Image of Sermant-agent

#### Prepare Sermant-agent package

Click [here](https://github.com/sermant-io/Sermant/releases) to download latest release package `sermant-agent-x.x.x.tar.gz` or you can package sermant yourself.

#### Build Image

Modify the values of `sermantVersion`, `imageName` and `imageVerison` in the `build-sermant-image.sh` under `images/sermant-agent` folder.

Move `build-sermant-image.sh` and `Sermant.dockerfile` to the same directory as the release package `sermant-agent-xxx.tar.gz` in one of K8s nodes. Run `build-sermant-image.sh` to build the sermant-agent image.

```shell
sh build-sermant-image.sh
```

To push the image to the image repository, run the `docker push ${imageName}:{imageVerison}` command.

### Build Image of Sermant-injector

#### Package Sermant-injector

Execute the `mvn clean package` command to generate the `sermant-injector.jar` file in the directory of sermant-injector project.

#### Build Image

Modify the values of `imageName` and `imageVerison` in the `build-injector-image.sh` script under `images/injector` folder.

Move `build-injector-image.sh`, `start.sh` and `Injector.Dockerfile` to the same directory as the package `sermant-injector.jar`. Run `build-injector-image.sh` to create the sermant-injector image.

```shell
sh build-injector-image.sh
```

To push the image to the image repository, run the `docker push ${imageName}:{imageVerison}` command.

### Deploy Workload of Sermant-injector 

Before the host application can be containerized, the workload of sermant-injector needs to be deployed. This project adopts Helm for Kubernetes package management and uses Chart template in`injector` under `deploment/release`.

Modify the template variable in `values.yaml` according to the actual environment. Once this is done, execute `helm install` to deploy the sermant-injector workload in K8s:

```shell
helm install sermant-injector ../injector
```

Check that the status of the deployed pod of sermant-injector is running.

At this point, the environment configuration of the host application before deployment is complete.

### Deploy Host Application 

**Mount Sermant Automatically**

After the deployment of above sermant-injector, developers should write YAML file to deploy K8s Deployment resources according to the actual application. Simply add `sermant-injection: enabled` at the `spec > Template > Metadata > Labels` to automatically mount the sermant-agent. (If you do not want to mount it later, just delete it and restart the application)

**Configure Environment Variables via Annotations**

If you want to configure custom environment variables in K8s Deployment, simply add the corresponding key-value pair in the `spec > template > metadata> annotations`. For details about the configuration, see the following example.

Take `env.sermant.io/key1: "value1"` as an example, the configuration rules are: `env.sermant.io/` is the standard prefix for configuring environment variables through `annotations`, `key1` is the name of a custom environment variable that users configure on demand, and `value1` is the value of a custom environment variable that users configure on demand.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-test
  namespace: default
  labels:
    app: demo-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-test
  template:
    metadata:
      labels:
        app: demo-test
        sermant-injection: enabled
      annotations:
        env.sermant.io/key1: "value1"
        env.sermant.io/key2: "value2"
    spec:
      containers:
      - name: image
        # Please replace it with your own image
        image: image:1.0.0
        ports: 
        - containerPort: 8080
```

If the pod cannot be created, check that the sermant-injector is deployed correctly and that the sermant-agent image is built correctly.

### Verification

Once the pod is created, execute the following command, where `${pod_name}` is the pod name of host application.

```shell
kubectl get po/${pod_name} -o yaml
```

1. Check if the output contains the environment variable whose name is `JAVA_TOOL_OPTIONS`and value is `-javaagent:/home/sermant-agent/agent/sermant-agent.jar=appName=default` in `spec > containers > env`.

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