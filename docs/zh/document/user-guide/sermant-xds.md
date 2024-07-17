# 基于Sermant+Istio的无代理服务网格

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

Sermant框架层基于xDS协议实现了服务发现能力，插件可以调用xDS服务发现接口获取Kubenetes的服务实例，具体开发指导请参考[基于xDS服务的服务发现开发指导](../developer-guide/sermant-xds-service.md#基于xDS服务的服务发现)。

### 计划支持xDS服务发现能力的Sermant插件

- [路由插件](../plugin/router.md)
- [SpringBoot注册插件](../plugin/springboot-registry.md)

## 基于xDS服务的路由能力

未来Sermant框架层将基于xDS协议实现路由配置获取能力，并用于插件层进行服务治理。

## 基于xDS服务的负载均衡能力

未来Sermant框架层将基于xDS协议实现负载均衡配置获取能力，并用于插件层进行服务治理。

## 支持版本和限制

### 版本支持

Istio版本：1.6版本及以上

Kubenetes版本和Istio的版本适配请参考[Istio版本支持](https://istio.io/latest/zh/docs/releases/supported-releases/#support-status-of-istio-releases)。

### 限制

Sermant是基于Java Agent的云原生无代理服务网格，仅支持Java语言。

## 启动和结果验证

本教程使用[Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-service-discovery-demo)仓库中的xds-service-discovery-demo演示Sermant的xDS服务发现能力。本Demo中包括spring-client微服务、spring-server微服务和Sermant示例插件，该插件拦截spring-client的`hello`方法，在`hello`方法执行前通过Sermant的xDS服务发现能力获取spring-server服务的具体实例信息，并替换入参为正确的sprng-server地址。

### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-xds-service-discovery-demo-2.0.0.tar.gz) Demo二进制产物压缩包
- [准备](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/) Kubenetes环境
- 安装[Istio](https://istio.io/latest/zh/docs/setup/getting-started/)并启动

### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`product/`目录文件。

### 3 启动spring-server

进入product/spring-server目录：

1. 执行以下命令打包spring-server镜像：

   ```
   sh build-server.sh
   ```

2. 执行以下命令运行spring-server Pod和Service

   ```
   kubectl apply -f spring-server.yaml
   ```

### 4 启动spring-client

进入product/spring-client目录：

1. 执行以下命令打包spring-client镜像：

   ```
   sh build-client.sh
   ```

2. 执行以下命令运行spring-client Pod和Service

   ```
   kubectl apply -f spring-client.yaml
   ```

### 5 验证

通过网页访问spring-client微服务，入参address设置为空，验证Sermant是否能成功调用上游服务spring-server：

```
http://127.0.0.1:30110/hello?address=
```

网页收到如下显示，说明Sermant成功发现了spring-server的实例并修改了入参address为正确的spring-server实例地址：

```
Greetings from http://xxx.xxx.xxx.xxx:8080 : hello, the current time is 2050-01-01T02:08:08.369
```

