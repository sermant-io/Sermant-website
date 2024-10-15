# Sermant Injector使用手册

Sermant Injector是基于Kubernetes准入控制器（Admission Controllers）特性开发而来。准入控制器位于k8s API Server中，能够拦截对API Server的请求，完成身份验证、授权、变更等操作。本文介绍在k8s环境下，如何通过Sermant Injector组件来实现宿主应用自动挂载Sermant Agent包的快速部署。

Sermant Injector属于变更准入控制器(MutatingAdmissionWebhook), 能够在创建容器资源前对请求进行拦截和修改。Sermant Injector部署在k8s后，只需在宿主应用部署的YAML文件中`spec > template > metadata> labels`层级加入`sermant-injection: enabled`即可实现自动挂载Sermant Agent。另外，Sermant Injector还支持通过`annotations`的方式配置环境变量。部署应用自动挂载Sermant并通过`annotations`配置环境变量的使用方式可参考下文[部署宿主应用](#_4-部署宿主应用)中的描述。

## 参数配置

### Sermant Injector的参数配置

本项目采用Helm进行Kubernetes包管理, 部署Sermant Injector相关参数需在[sermant-injector/deployment/release/values.yaml](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/deployment/release/injector/values.yaml)中做修改配置。

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

 参数说明如下：

| <span style="display:inline-block;width:100px">主参数键</span> | <span style="display:inline-block;width:100px">二层参数键</span> | <span style="display:inline-block;width:100px">三层参数键</span> | 说明                                                         | <span style="display:inline-block;width:40px">是否必须</span> |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| namespace                                                    | name                                                         | -                                                            | 部署Sermant Injector所在的namespace                          | 是                                                           |
| injector                                                     | replicas                                                     | -                                                            | 部署Sermant Injector的实例个数                               | 是                                                           |
|                                                              | image                                                        | addr                                                         | Sermant Injector的镜像地址                                   | 是                                                           |
|                                                              |                                                              | pullPolicy                                                   | Sermant Injector的镜像拉取策略：Always(总是拉取)，IfNotPresent(默认值,本地有则使用本地镜像,不拉取)，Never(只使用本地镜像，从不拉取) | 是                                                           |
|                                                              |                                                              | pullSecrets                                                  | 拉取镜像的密钥，默认为default-secret，按需修改               | 是                                                           |
| agent                                                        | image                                                        | addr                                                         | Sermant Agent的镜像地址                                      | 是                                                           |
|                                                              |                                                              | pullPolicy                                                   | Sermant Agent的镜像拉取策略：Always(总是拉取)，IfNotPresent(默认值,本地有则使用本地镜像,不拉取)，Never(只使用本地镜像，从不拉取) | 是                                                           |
| config                                                       | type                                                         | -                                                            | Sermant Agent配置中心类型: 当前支持ZooKeeper、Kie和Nacos  | 是                                                           |
|                                                              | endpoints                                                    | -                                                            | Sermant Agent配置中心地址                                    | 是                                                           |
| registry                                                     | endpoints                                                    | -                                                            | Sermant Agent注册插件的注册中心地址                          | 是                                                           |
| configMap                                                    | enabled                                                      | -                                                            | 通用环境变量配置开关，默认为false，如需开启请配置为true      | 是                                                           |
|                                                              | namespaces                                                   | -                                                            | 注入configMap的namespace，需与业务应用的namespace保持一致    | 是                                                           |
|                                                              | env                                                          | 自定义key1                                                   | 配置自定义value1                                             | 否                                                           |
|                                                              |                                                              | 自定义key2                                                   | 配置自定义value2                                             | 否                                                           |

**通用环境变量配置：**

Sermant Injector支持为宿主应用所在pod配置自定义的环境变量，方法为在`sermant-injector/deployment/release/injector/values.yaml`中修改`configMap.env`的内容，前提是`configMap.enabled`配置为`true`，并正确配置`configMap.namespaces`。通用环境变量的配置方式如下(kv形式)：

```yaml
configMap:
  enabled: true
  namespaces: [default, test]
  env:
  	TEST_ENV1: abc
  	TEST_ENV2: 123456
```

例如，在Sermant使用过程中，某些配置为当前k8s集群下各pod共享的公共配置，例如**Backend**后端的ip和端口等。则可在此处配置：

```yaml
configMap:
  enabled: true
  namespaces: [default]	
  env:
    gateway.nettyIp: 127.0.0.1
    gateway.nettyPort: 6888
```

即可使default命名空间下的所有pod挂载的Sermant都与该**Backend**后端连接。

**注意**：此处`configMap`配置的环境变量优先级低于宿主应用yaml中`env`的优先级。由于`config.type`,`config.endpoints`和`registry.endpoints`本质上是通过`env`的方式加载环境变量，因此优先级也高于`configMap`配置的相应的sermant的环境变量。

### 镜像制作脚本的参数配置

**[build-sermant-image.sh](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/images/sermant-agent/build-sermant-image.sh)**

| 参数名         | 说明                               | 是否必须 |
| -------------- | ---------------------------------- | -------- |
| sermantVersion | sermant-agent-x.x.x.tar.gz包的版本 | 是       |
| imageName      | 构建的Sermant Agent镜像名称        | 是       |
| imageVersion   | 构建的Sermant Agent镜像版本        | 是       |

**[build-injector-image.sh](https://github.com/sermant-io/Sermant/blob/develop/sermant-injector/images/injector/build-injector-image.sh)**

| 参数名       | 说明                           | 是否必须 |
| ------------ | ------------------------------ | -------- |
| imageName    | 构建的Sermant Injector镜像名称 | 是       |
| imageVersion | 构建的Sermant Injector镜像版本 | 是       |

## 支持版本

Sermant Injector当前支持在Kubernetes 1.15及以上版本进行部署，通过Helm v3版本来进行Kubernetes包管理。

- [Kubernetes 1.15+](https://kubernetes.io/)

- [Helm v3](https://helm.sh/)

## 启动和结果验证

在部署Sermant Injector前需要先构建Sermant Agent镜像以及Sermant Injector镜像。

### 1 构建Sermant Agent镜像

#### 准备Sermant Agent包

点击 [here](https://github.com/sermant-io/Sermant/releases)下载release包，也可以在项目中自行打包。

#### 制作镜像

修改文件夹 `sermant-injector/images/sermant-agent`下`build-sermant-image.sh` 脚本中`sermantVersion`,`imageName`和`imageVerison`的值。

在k8s节点下，将`build-sermant-image.sh`和`Sermant.Dockerfile`置于release包`sermant-agent-xxx.tar.gz`同一目录下，执行`build-sermant-image.sh`脚本，完成Sermant Agent镜像制作。

```shell
sh build-sermant-image.sh
```

如需将镜像推送至镜像仓库，请执行`docker push ${imageName}:{imageVerison}` 命令。

### 2 构建Sermant Injector镜像

#### 准备Sermant Injector包

在Sermant Injector项目下执行`mvn clean package`命令，在项目目录下生成`sermant-injector.jar`文件

#### 制作Sermant Injector镜像

修改文件夹 `sermant-injector/images/injector`下`build-injector-image.sh` 脚本中`imageName`和`imageVerison`的值：

在k8s节点下，将`build-injector-image.sh`、`start.sh`和`Injector.Dockerfile`置于Sermant Injector包`sermant-injector.jar`同一目录下，执行`build-injector-image.sh`脚本，完成Sermant Injector镜像制作。

```shell
sh build-injector-image.sh
```

如需将镜像推送至镜像仓库，请执行`docker push ${imageName}:{imageVerison}` 命令。

### 3 部署Sermant Injector实例

在宿主应用容器化部署前，需要先部署Sermant Injector实例。本项目采用Helm进行Kubernetes包管理，使用`sermant-injector/deployment/release`下的`injector`Chart模版。

按实际环境修改`values.yaml`中的模版变量，修改完成后，执行`helm install`命令在k8s中部署Sermant Injector实例:

```shell
helm install sermant-injector sermant-injector/deployment/release/injector
```

检查Sermant Injector部署pod状态为running。

至此，宿主应用部署前的环境配置工作完成。

### 4 部署宿主应用

#### 自动挂载Sermant

在完成上述Sermant Injector部署后，用户根据实际应用编写yaml部署K8s Deployment资源，只需在`spec > template > metadata> labels`层级加入`sermant-injection: enabled`即可实现自动挂载Sermant Agent。(如后续不希望挂载，删除后重新启动应用即可)

#### 通过annotations方式配置环境变量

如果用户希望在Deployment中配置自定义环境变量，只需在`spec > template > metadata> annotations`层级添加相应的键值对即可。配置方式可参考下文示例。

以`env.sermant.io/key1: "value1"`为例，配置规则为：`env.sermant.io/`为通过`annotations`配置环境变量的标准前缀，`key1`为用户按需配置的自定义环境变量名称，`value1`为用户按需配置的自定义环境变量值。

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
        # 请替换成您的应用镜像
        image: image:1.0.0
        ports: 
        - containerPort: 8080
```

若pod无法创建，请检查Sermant Injector是否正确部署以及Sermant Agent镜像是否正确构建。

### 5 验证

pod创建成功后，执行如下命令，其中`${pod_name}`为宿主应用的pod名称

```shell
kubectl get po/${pod_name} -o yaml
```

1. 查看上述命令输出内容`spec > containers > env`下是否包含环境变量：name为`JAVA_TOOL_OPTIONS`，value为 `-javaagent:/home/sermant-agent/agent/sermant-agent.jar=appName=default`。

2. 查看上述命令输出内容`spec > containers > initContainers > image` 的值是否为构建Sermant Agent镜像时的镜像地址。

执行如下命令，其中`${pod_name}`为用户应用的pod名称，`${namespace}`为用户部署应用的namespace名称

```shell
kubectl logs ${pod_name} -n ${namespace}
```

3. 查看上述命令输出内容pod日志开头部分是否包含：

```
[INFO] Loading sermant agent...
```

如果上述信息无误，则表明Sermant Agent已成功挂载至用户应用中。