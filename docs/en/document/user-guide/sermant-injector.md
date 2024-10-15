# Sermant Injector User Manual

Sermant Injector is developed based on the **Kubernetes Admission Controllers** feature. Admission Controllers are located in the k8s API Server and can intercept requests to the API Server to perform authentication, authorization, and modification operations. This article describes how to use the Sermant Injector component in a k8s environment to quickly deploy the Sermant Agent package automatically to host applications.


Sermant Injector is a MutatingAdmissionWebhook that can intercept and modify requests before creating container resources. After Sermant Injector is deployed on K8s, just add `sermant-injection: enabled` to the YAML file of the host application deployment configuration at the `spec > template > metadata> labels` ' then the host application can automatically mount the sermant-agent package. Additionally, Sermant Injector supports configuring environment variables via `annotations`. How the deployed applications can automatically mount Sermant and configure environment variables via `annotations` is described in [Deploy Host Application](#_4-deploy-host-application) below.

## Parameter Configuration

### Parameter Configuration for Sermant Injector

This project adopts Helm for Kubernetes package management. The parameters for deploying Sermant Injector are set in [sermant-injector/deployment/release/values.yaml](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/deployment/release/injector/values.yaml).

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
| namespace    | name          | -            | The namespace where the Sermant Injector resides.            | True     |
| injector     | replicas      | -            | Number of deployed Sermant Injector instances.               | True     |
|              | image         | addr         | The mirror address of Sermant Injector.                      | True     |
|              |               | pullPolicy   | Sermant Injector image pull strategy: Always(always pull), IfNotPresent(default value, use local mirror if exists), Never(only use local mirror and never pull). | True     |
|              |               | pullSecrets  | Pull secrets. The default key is default-secret and you can change it on command. | True     |
| agent        | image         | addr         | The mirror address of Sermant Agent.                         | True     |
|              |               | pullPolicy   | Sermant Agent image pull strategy: Always(always pull), IfNotPresent(default value, use local mirror if exists), Never(only use local mirror and never pull). | True     |
| config       | type          | -            | Sermant Agent configuration center types: Currently supports ZooKeeper, Kie, and Nacos. | True     |
|              | endpoints     | -            | Configuration center address of Sermant Agent.               | True     |
| registry     | endpoints     | -            | Registration center address of Sermant Agent.                | True     |
| configMap    | enabled       | -            | General environment variable configuration switch, default is false; set to true to enable. | True     |
|              | namespaces    | -            | The namespaces to be injected with configMap which must be the same as that of the service application. | True     |
|              | env           | custom key1  | You can configure custom value1.                         | False    |
|              |               | custom key2  | You can configure custom value2.                           | False    |

**General environment variable configuration:**

Sermant Injector supports configuring custom environment variables for the pods of host applications. This is done by modifying the `configMap.env` content in `sermant-injector/deployment/release/injector/values.yaml`, provided that `configMap.enabled` is set to `true` and `configMap.namespace` is correctly configured. The configuration of general environment variables is as follows (in kv format):

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
    gateway.nettyIp: 127.0.0.1
    gateway.nettyPort: 6888
```

This ensures that all pods in the default namespace with mounted Sermant are connected to the specified **Backend**.

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
| imageName    | Image name of Sermant Injector mirror    | True     |
| imageVersion | Image version of Sermant Injector mirror | True     |

## Version Supported

Sermant Injector currently supports deployment on Kubernetes 1.15 and above, using Helm v3 for Kubernetes package management.

- [Kubernetes 1.15+](https://kubernetes.io/)

- [Helm v3](https://helm.sh/)

## Startup and Result Validation

Before deploying Sermant Injector, you need to build the Sermant Agent image and the Sermant Injector image first.

### 1 Build Image of Sermant Agent

#### Prepare Sermant Agent package

Click [here](https://github.com/sermant-io/Sermant/releases) to download latest release package `sermant-agent-x.x.x.tar.gz` or you can package sermant yourself.

#### Build Image

Modify the values of `sermantVersion`, `imageName`, and `imageVersion` in the `build-sermant-image.sh` script located in the `sermant-injector/images/sermant-agent` folder.

On a Kubernetes node, place `build-sermant-image.sh` and `Sermant.Dockerfile` in the same directory as the release package `sermant-agent-xxx.tar.gz`, then execute the `build-sermant-image.sh` script to complete the creation of the Sermant Agent image.

```shell
sh build-sermant-image.sh
```

To push the image to the image repository, run the `docker push ${imageName}:{imageVerison}` command.

### 2 Build Image of Sermant Injector

#### Prepare Sermant Injector package

Execute the `mvn clean package` command under the Sermant Injector project directory to generate the `sermant-injector.jar` file in the project directory.

#### Create the Sermant Injector image

Modify the values of `imageName` and `imageVersion` in the `build-injector-image.sh` script located in the `sermant-injector/images/injector` folder:

On a Kubernetes node, place `build-injector-image.sh`, `start.sh` and `Injector.Dockerfile` in the same directory as the Sermant Injector package `sermant-injector.jar`, then execute the `build-injector-image.sh` script to complete the creation of the Sermant Injector image.

```shell
sh build-injector-image.sh
```

To push the image to the image repository, run the `docker push ${imageName}:{imageVerison}` command.

### 3 Deploy the Sermant Injector instance

Before containerizing and deploying the host application, you need to first deploy the Sermant Injector instance. This project uses Helm for Kubernetes package management, utilizing the `injector` Chart template found in `sermant-injector/deployment/release`.

Modify the template variables in `values.yaml` according to your environment, then execute the `helm install` command to deploy the Sermant Injector instance in Kubernetes:

```shell
helm install Sermant Injector sermant-injector/deployment/release/injector
```

Check that the Sermant Injector deployment pod status is running.

At this point, the environment configuration work before deploying the host application is complete.

### 4 Deploy Host Application 

#### Automatically mount Sermant

After completing the deployment of the Sermant Injector, users can write YAML to deploy the K8s Deployment resource according to their application needs. To automatically mount the Sermant Agent, simply add `sermant-injection: enabled` at the `spec > template > metadata > labels` level. (If you later decide not to mount it, you can remove this label and restart the application.)

#### Configuring Environment Variables via Annotations

If users wish to configure custom environment variables in the Deployment, they can add the appropriate key-value pairs at the `spec > template > metadata > annotations` level. The configuration method can be referenced in the example below.

For instance, using `env.sermant.io/key1: "value1"`, the configuration rule is: `env.sermant.io/` is the standard prefix for configuring environment variables via `annotations`, `key1` is the custom environment variable name configured by the user, and `value1` is the custom environment variable value configured by the user.

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
        # Please replace with your application image
        image: image:1.0.0
        ports: 
        - containerPort: 8080
```

If the pod cannot be created, please check whether the Sermant Injector is deployed correctly and if the Sermant Agent image is built properly.

### 5 Verification

After the pod is created successfully, execute the following command, where `${pod_name}` is the name of the host application's pod:

```shell
kubectl get po/${pod_name} -o yaml
```

1.Check if the output from the command includes an environment variable under `spec > containers > env` with name as `JAVA_TOOL_OPTIONS` and value as `-javaagent:/home/sermant-agent/agent/sermant-agent.jar=appName=default`.

2.Verify if the value of `spec > containers > initContainers > image` in the output is the image address used when building the Sermant Agent image.

Run the following command, where `${pod_name}` is the name of your application's pod and `${namespace}` is the namespace where your application is deployed:

```shell
kubectl logs ${pod_name} -n ${namespace}
```

3.Check if the beginning of the pod logs from the command output contains:

```
[INFO] Loading sermant agent...
```

If the above information is correct, it indicates that the Sermant Agent has been successfully mounted to your application.