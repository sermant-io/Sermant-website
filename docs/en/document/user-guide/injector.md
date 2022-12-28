# Injector Manual

## Environmental requirements
[Kubernetes 1.15+](https://kubernetes.io/)

[Helm v3](https://helm.sh/)

## Build Images

Before deploying **sermant-injector**, you need to build the **sermant-agent** image and the **sermant-injector** image.

### Image of Sermant-agent

#### Download release package

Click [here](https://github.com/huaweicloud/Sermant/releases) to download latest release package `sermant-agent-x.x.x.tar.gz`.

Or you can get above package by executing the following command in the project.

```shell
mvn clean package -Dmaven.test.skip
```

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

### Image of Sermant-injector

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

## Deploy Workload of Sermant-injector 

Before the host application can be containerized, the workload of sermant-injector needs to be deployed. This project adopts Helm for Kubernetes package management.

Use Chart template in`injector` under `deploment/release`.

Modify the template variable in `values.yaml` according to the actual environment:

> The values of `agent.image.addr` and `injector.image.addr` are the same as the image address when the images are built

**Configuration of common environment variables：**

sermant-injector allows you to configure custom environment variables for the host pods by modifying the env content in `values.yaml` as follows (kv form) :

```yaml
env:
  TEST_ENV1: abc
  TEST_ENV2: 123456
```

For example, during the use of Sermant, some configurations are common to the pods in the current K8s cluster, such as the ip and port of the **Backend**. You can configure them like this:

```yaml
env:
  backend.httpIp: 127.0.0.1
  backend.httpPort: 8900
```

Then all pod-mounted sermants are connected to the **Backend**.

Once this is done, execute `helm install` to deploy the sermant-injector workload in K8s:

```shell
helm install sermant-injector ../injector
```

Check that the status of the deployed pod of sermant-injector is running.

At this point, the environment configuration of the host application before deployment is complete.

## Deploy Host Application 

### Deployment

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