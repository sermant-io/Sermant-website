# 基于Sermant+Istio的无代理服务网格

本文主要介绍基于Sermant+Istio无代理服务网格的概念、部署形态和具体能力。该能力基于Sermant框架层的[xDS核心服务](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/XdsCoreService.java)实现。

## Istio下的Sermant服务治理

服务网格（Service Mesh）是处理服务间通信的基础设施层。它负责构成现代云原生应用程序的复杂服务拓扑来可靠地交付请求。在实践中，Service Mesh 通常以轻量级网络代理阵列的形式实现，这些代理与应用程序代码部署在一起，对应用程序来说无需感知代理的存在。

Istio是目前应用最广泛的Service Mesh产品，由控制平面和数据平面组成。Istio的数据平面一般会启动独立的Sidecar容器代理业务微服务的网络，因此会增加额外的性能损耗，包括CPU占用增加和服务调用时延的大幅增长，除此之外，系统的复杂性和运维的难度也在增加。

Sermant xDS服务使微服务可以在Kubenetes场景下接入Istio。Sermant基于xDS协议和Istio的控制平面直接进行通信，获取服务发现、路由、负载均衡等配置信息，从而可以替代Envoy作为Istio的数据平面完成服务治理能力。

Sermant是基于Java Agent的云原生无代理服务网格，业务微服务挂载Sermant同进程运行，无需启动额外的Sidecar容器进行网络代理，可以大幅度降低应用的性能损耗和服务之间的调用时延。

### Istio+Sermant的Sidecar无代理模式部署形态

<MyImage src="/docs-img/xds-deploy.jpg" />

1. 混合部署模式：Sidecar代理模式和Sidecar无代理模式共存。业务微服务通过混合部署模式接入Istio并实现服务治理能力，该模式可以避免修改已有的部署架构，仅新增服务使用Sidecar无代理模式。
2. 无代理部署模式：所有的业务微服务均使用Sermant作为Istio的数据平面实现服务发现、路由、负载均衡等能力。Sermant可以替代Envoy提供的能力，当前已经支持了服务发现，未来功能将持续演进。

### Istio环境下使用Sermant的优势

1. Sermant和业务微服务同进程运行，无需启动额外的Sidecar容器，大幅减少网络调用时延和CPU损耗。
2. 基于Sermant框架开发插件可以实现比Envoy更丰富的治理能力，可扩展性更强。
3. 更低的架构复杂度可以带来更低的部署成本。

## 基于xDS服务的服务发现能力

Kubenetes环境中，用户可以通过[Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)和[Service](https://kubernetes.io/docs/concepts/services-networking/service/)自定义资源文件创建Pod和Service。Sermant框架层基于xDS协议实现了服务发现能力，插件可以调用xDS服务发现接口获取Kubenetes Service的服务实例，具体开发指导请参考[基于xDS服务的服务发现开发指导](../developer-guide/sermant-xds-service.md#基于xDS服务的服务发现)。

### Kubenetes创建Pod和Service模版

**Deployment**：

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-test
  labels:
    app: spring-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: spring-test
  template:
    metadata:
      labels:
        app: spring-test
    spec:
      containers:
      - name: spring-test
        image: spring-test:1.0.0
        ports:
        - containerPort: 8003
```

**Service：**

```
apiVersion: v1
kind: Service
metadata:
  name: spring-test
spec:
  type: ClusterIP
  ports:
  - name: test
    port: 8003
    targetPort: 8003
    protocol: TCP
  selector:
    app: spring-test
```

> 说明：Sermant使用Service资源文件的`metadata.name`作为服务名称进行服务发现

### 支持xDS服务发现能力的Sermant插件

- [路由插件](../plugin/router.md#基于xDS协议的路由)

## 基于xDS服务的路由能力

Sermant框架层基于xDS协议实现了路由配置的获取能力，插件可以调用xDS路由配置服务接口获取Kubenetes Service的路由配置。具体开发指导请参考[基于xDS服务的路由配置服务开发指导](../developer-guide/sermant-xds-service.md#基于xDS协议的路由配置服务)。

### Istio路由配置字段支持

Istio通过下发[DestinationRule](https://istio.io/latest/zh/docs/reference/config/networking/destination-rule/)和[VirtualService](https://istio.io/latest/zh/docs/reference/config/networking/virtual-service/) 自定义资源文件下发路由配置。Sermant基于xDS协议和Istio的控制平面协议进行通信获取路由配置，具体支持的路由配置字段如下所示：

**VirtualService**：

| 支持字段                                      | 描述                                             |
| --------------------------------------------- | ------------------------------------------------ |
| spec.hosts                                    | 路由的服务域名                                   |
| spec.hosts.http                               | http路由配置                                     |
| spec.hosts.http.match                         | http路由匹配规则                                 |
| spec.hosts.http.match.headers                 | http路由header匹配规则，支持精确、前缀和正则匹配 |
| spec.hosts.http.match.uri                     | http路由路径匹配规则，支持精确、前缀和正则匹配   |
| spec.hosts.http.match.ignoreUriCase           | http路由路径匹配忽略大小写                       |
| spec.hosts.http.route                         | http路由                                         |
| spec.hosts.http.route.destination             | http路由目标服务                                 |
| spec.hosts.http.route.destination.host        | http路由目标服务域名                             |
| spec.hosts.http.route.destination.subset      | http路由目标服务子集                             |
| spec.hosts.http.route.destination.port.number | http路由目标服务端口                             |
| spec.hosts.http.route.weight                  | http路由目标权重                                 |

**DestinationRule**：

| 支持字段                                                  | 描述         |
| --------------------------------------------------------- | ------------ |
| spec.trafficPolicy                                        | 流量策略     |
| spec.trafficPolicy.loadBalancer                           | 负载均衡策略 |
| spec.trafficPolicy.loadBalancer.localityLbSetting.enabled | 同AZ路由配置 |

### Istio路由配置模版

**VirtualService**：

```
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: spring-test-virtualservice
spec:
  hosts:
  - spring-test
  http:
  - name: "v1-routes"
    match:
    - headers:
        version:
          exact: v1
      uri:
        exact: /test
      ignoreUriCase: false
    route:
    - destination:
        host: spring-test
        subset: v1
        port:
          number: 8003
      weight: 100
  - name: "base-route"
    route:
    - destination:
        host: spring-test
        subset: base
        port:
          number: 8003
```

> 描述：对于访问服务名称为spring-test的上游服务，存在如下路由规则：
>
> 1. http请求中存在version:v1的header，并且访问路径为/test，路由到spring-test的v1子集的8003端口
> 2. 其他http请求路由到spring-test的base子集的8003端口

**DestinationRule**：

```
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: spring-test-destinationrule
spec:
  host: spring-test.default.svc.cluster.local
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      loadBalancer:
        localityLbSetting:
          enabled: true
  subsets:
  - name: base
    labels:
      version: base
    trafficPolicy:
      loadBalancer:
        localityLbSetting:
          enabled: false
```

> 描述：spring-test服务根据version标签划分为两个子集，即服务的两个Cluster集群。v1集群使用同AZ路由策略，v2集群不使用同AZ路由策略。

### 支持xDS路由配置能力的Sermant插件

- [路由插件](../plugin/router.md#基于xDS协议的路由)

## 基于xDS服务的负载均衡能力

Sermant框架层基于xDS协议实现了负载均衡配置的获取能力，插件可以调用xDS负载均衡配置服务接口获取Kubenetes Service的负载均衡配置。具体开发指导请参考[基于xDS服务的负载均衡配置服务开发指导](../developer-guide/sermant-xds-service.md#基于xDS协议的负载均衡配置服务)。

### Istio负载均衡配置字段支持

Istio通过下发[DestinationRule](https://istio.io/latest/zh/docs/reference/config/networking/destination-rule/)自定义资源文件下发负载均衡配置。Sermant基于xDS协议和Istio的控制平面协议进行通信获取负载均衡配置，具体支持的负载均衡配置字段和负载均衡规则如下所示：

| 支持字段                               | 描述                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| spec.trafficPolicy                     | 流量策略                                                 |
| spec.trafficPolicy.loadBalancer        | 负载均衡策略                                             |
| spec.trafficPolicy.loadBalancer.simple | 简单负载均衡策略，支持ROUND_ROBIN、RANDOM、LEAST_REQUEST |

### Istio负载均衡配置模版

**DestinationRule**：

```
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: spring-test-destinationrule
spec:
  host: spring-test.default.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      loadBalancer:
        simple: RANDOM
  subsets:
  - name: base
    labels:
      version: base
```

> 描述：spring-test服务根据version标签划分为两个子集，即服务的两个Cluster集群。v1集群使用随机负载均衡策略，v2集群使用轮训负载均衡策略。

### 支持xDS负载均衡配置能力的Sermant插件

- [路由插件](../plugin/router.md#基于xDS协议的路由)

## 支持版本和限制

### 版本支持

Istio版本：1.6版本及以上

Kubenetes版本和Istio的版本适配请参考[Istio版本支持](https://istio.io/latest/zh/docs/releases/supported-releases/#support-status-of-istio-releases)。

### 限制

Sermant是基于Java Agent的云原生无代理服务网格，仅支持Java语言。

## 启动和结果验证

### 基于xds服务的服务发现示例

本教程使用[Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-service-discovery-demo)仓库中的xds-service-discovery-demo演示Sermant的xDS服务发现能力。本Demo中包括spring-client微服务、spring-server微服务和Sermant示例插件，该插件拦截spring-client的`hello`方法，在`hello`方法执行前通过Sermant的xDS服务发现能力获取spring-server服务的具体实例信息，并替换入参为正确的sprng-server地址。

#### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.1.0/sermant-examples-xds-service-discovery-demo-2.1.0.tar.gz) Demo二进制产物压缩包
- [准备](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/) Kubenetes环境
- 安装[Istio](https://istio.io/latest/zh/docs/setup/getting-started/)并启动

#### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`product/`目录文件。

#### 3 启动spring-server

进入product/spring-server目录：

1. 执行以下命令打包spring-server镜像：

   ```
   sh build-server.sh
   ```

2. 执行以下命令运行spring-server Pod和Service

   ```
   kubectl apply -f spring-server.yaml
   ```

#### 4 启动spring-client

进入product/spring-client目录：

1. 执行以下命令打包spring-client镜像：

   ```
   sh build-client.sh
   ```

2. 执行以下命令运行spring-client Pod和Service

   ```
   kubectl apply -f spring-client.yaml
   ```

#### 5 验证

通过网页访问spring-client微服务，入参address设置为空，验证Sermant是否能成功调用上游服务spring-server：

```
http://127.0.0.1:30110/hello?address=
```

网页收到如下显示，说明Sermant成功发现了spring-server的实例并修改了入参address为正确的spring-server实例地址：

```
Greetings from http://xxx.xxx.xxx.xxx:8080 : hello, the current time is 2050-01-01T02:08:08.369
```

### 基于xds服务的路由示例

本教程使用[Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-router-demo)仓库中的xds-router-demo演示Sermant 基于xDS服务的路由能力。本Demo中包括spring-client微服务、spring-server微服务。spring-client微服务挂载Sermant的路由插件启动，并开启基于xDS的路由能力，Sermant路由插件在spring-client调用上游服务时，根据上游服务的路由规则进行路由，并选择符合规则的服务实例进行调用。

#### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.1.0/sermant-examples-xds-router-demo-2.1.0.tar.gz) Demo二进制产物压缩包
- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.1.0/sermant-2.1.0.tar.gz) Sermant二进制产物压缩包
- [准备](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/) Kubenetes环境
- 安装[Istio](https://istio.io/latest/zh/docs/setup/getting-started/)并启动

#### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`router-product/`目录文件。

#### 3 获取和移动Sermant二进制产物

解压Sermant二进制产物压缩包，即可得到`sermant-agent/`目录文件。

执行如下命令，将Sermant二进制产物移动至spring-client目录，用于打包spring-client镜像：

```
cp -r ${sermant-path}/sermant-agent/agent ${demo-path}/router-product/spring-client
```

> 说明：${sermant-path}为Sermant二进制产物所在路径，${demo-path}为Demo二进制产物所在路径。

#### 4 启动spring-server

进入router-product/spring-server目录：

1. 执行以下命令打包spring-server镜像：

   ```
   sh build-server.sh
   ```

2. 执行以下命令运行spring-server Pod和Service

   ```
   kubectl apply -f ../script/spring-server.yaml
   ```

#### 5 启动spring-client

进入product/spring-client目录：

1. 执行以下命令打包spring-client镜像：

   ```
   sh build-client.sh
   ```

2. 执行以下命令运行spring-client Pod和Service

   ```
   kubectl apply -f ../script/spring-client.yaml
   ```

#### 6 下发路由规则

进入product/script目录，执行如下命令下发路由规则：

```
kubectl apply -f spring-server-destination.yaml
kubectl apply -f spring-server-virtureservice.yaml
```

> 路由规则说明：
>
> DestinationRule: 根据Deployment的version标签将Pod划分为v1和v2两个子集, spring-server集群使用ROUND_ROBIN负载均衡规则。
>
> VirtualService: 对于访问spring-server服务的http请求，如果存在version:v1的header，并且请求路径为/router，则将请求路由到spring-server的v1子集。

#### 7 验证

通过网页访问spring-client微服务，入参host设置为spring-server，version为v1，验证spring-client服务是否能成功调用v1版本的上游服务spring-server：

```
http://127.0.0.1:30110/router/httpClient?host=spring-server&version=v1
```

网页收到如下显示，说明spring-client成功调用了v1版本的spring-server服务

```
spring-server version: v1
```

### 

