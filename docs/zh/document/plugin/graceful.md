# 优雅上下线

本文介绍如何使用优雅上下线插件，目前优雅上下线功能当前集成在[注册迁移插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry) 中, 可独立使用。

## 功能介绍

试想一个场景，系统中运行着一个消费者（客户端）和两个服务提供者（服务端），消费者可负载均衡调用服务提供者。假设某个服务提供者因业务更新或其他场景需要滚动升级，若此时存在大量并发流量，便会出现以下问题：

- 大量TCP连接因服务提供者升级下线操作，导致大量请求错误。
- 由于消费者（客户端）存在注册表延迟刷新的问题，后续流量依旧会分配到已经下线的提供者，导致大量请求错误。

以上便是一个典型的“不优雅”场景。于是，为了规避诸如此类的问题，服务优雅上下线应运而生，主要针对服务的重启、上线、下线等操作提供保护。

**服务运维常见问题：**

- 服务自身存在大量懒加载机制（例如负载均衡初始化），在服务刚上线时，因并发流量请求涌入，导致大量请求同时进行懒加载，以至于请求响应慢，线程阻塞，甚至最终导致服务崩溃。
- 服务无法做到优雅下线，比如服务端下线而客户端服务无法及时感知，导致流量流入已下线的实例，从而丢失大量流量。

针对以上两个问题，插件提供预热和延迟下线机制，为服务提供优雅上线和优雅下线的能力。预热是优雅上线的核心机制，延迟下线时优雅下线的核心机制，而且为了优雅上线，还做了延迟注册机制和服务就绪检查。

<MyImage src="/docs-img/elegant-online.png"/>

**延迟注册：** 若服务还未完全初始化就已经注册到注册中心提供给消费者调用，很有可能因资源为加载完成导致请求报错。可以通过设置延迟注册，让服务充分初始化后再注册到注册中心对外提供服务。

**服务就绪检查：** 确保服务在对外提供服务之前服务已经完全启动就绪，插件提供了相应的就绪检查API接口。

**预热：** 顾名思义，即先用少部分流量对实例访问，后续根据时间推移，逐渐增加增加流量，确保新启动实例能成功过渡。

<MyImage src="/docs-img/elegant-offline.png"/>

**延迟下线：** 即对下线的实例提供保护，插件基于**实时通知**+**刷新缓存的机制**快速更新上游缓存，同时基于流量统计的方式，确保即将下线的实例尽可能的将流量处理完成，最大程度避免流量丢失。

## 参数配置

### 插件配置

优雅上下线插件需要打开优雅上下线开关（`grace.rule.enableSpring`）、配置启动延迟时间（`grace.rule.startDelayTime`）、开启预热（`grace.rule.enableWarmUp`）等配置，可在`${path}/sermant-agent-x.x.x/agent/pluginPackge/service-registry/config/config.yaml`找到该插件的配置文件，配置如下所示：

```yaml
grace.rule:
  enableSpring: false # springCloud优雅上下线开关
  startDelayTime: 0  # 优雅上线启动延迟时间, 单位S。上线延迟为避免实例未准备就绪就注册导致上游服务调用时无法提供服务。
  enableWarmUp: false # 是否开启预热。针对新实例，为避免实例初始化时涌入大量流量而导致请求响应超时、阻塞、资源耗尽等造成新实例宕机，可开启预热在初始化时分配少量流量。
  warmUpTime: 120    # 预热时间, 单位S。预热过程的持续时间。
  enableGraceShutdown: false # 是否开启优雅下线
  shutdownWaitTime: 30  # 关闭前相关流量检测的最大等待时间, 单位S. 需开启enabledGraceShutdown才会生效。在优雅下线前，Agent会定期检查当前实例是否完成全部请求处理，通过此配置指定检查的持续时间。
  enableOfflineNotify: false # 是否开启下线主动通知
  httpServerPort: 16688 # 提供的httpServer端口，用于应用就绪检查以及接收下游应用下线主动的通知。
  upstreamAddressMaxSize: 500 # 缓存上游地址的默认大小。上游实例接收主动通知的地址会被下游缓存，此处设置地址最多的缓存个数。
  upstreamAddressExpiredTime: 60 # 缓存上游地址的过期时间, 单位S。上游实例接收主动通知的地址会被下游缓存，此处设置地址的失效时间。
```

| 参数键                               | 说明                                                                     | 默认值        | 是否必须 |
| :----------------------------------- | :---------------------------------------------------------------------- | :------------| :------- |
| grace.rule.enableSpring              | springCloud优雅上下线开关。                                                | false         | 是    |
| grace.rule.startDelayTime            | 优雅上线启动延迟时间, 单位S。上线延迟为避免实例未准备就绪就注册导致上游服务调用时无法提供服务。                                            | 0             | 是    |
| grace.rule.enableWarmUp              | 是否开启预热。针对新实例，为避免实例初始化时涌入大量流量而导致请求响应超时、阻塞、资源耗尽等造成新实例宕机，可开启预热在初始化时分配少量流量。                                                             | false         | 是    |
| grace.rule.enableGraceShutdown       | 是否开启优雅下线                                                          | false         | 是    |
| grace.rule.shutdownWaitTime          | 关闭前相关流量检测的最大等待时间, 单位S. 需开启enabledGraceShutdown才会生效。在优雅下线前，Agent会定期检查当前实例是否完成全部请求处理，通过此配置指定检查的持续时间。  | 30            | 是    |
| grace.rule.enableOfflineNotify       | 是否开启下线主动通知                                                      | false         | 是    |
| grace.rule.httpServerPort            | 提供的httpServer端口，用于应用就绪检查以及接收下游应用下线主动的通知。                                 | 16688          | 是    |
| grace.rule.upstreamAddressMaxSize    | 缓存上游地址的默认大小。上游实例接收主动通知的地址会被下游缓存，此处设置地址最多的缓存个数。                                                    | 5000           | 是    |
| grace.rule.upstreamAddressExpiredTime| 缓存上游地址的过期时间, 单位S。上游实例接收主动通知的地址会被下游缓存，此处设置地址的失效时间。                                              | 60            | 是    |

## 微服务就绪检查和优雅关闭

**就绪检查：** 为确保服务在对外提供服务之前服务已经完全启动就绪。优雅上下线插件提供了相应的就绪检查API接口：

```api
/$$sermant$$/healthCheck
```

**优雅关闭：** 服务自身需要实现优雅关闭处理逻辑，如延迟下线时需及时通知到上游应用（减少服务下线后消费者服务未及时感知到，仍继续调用已下线服务导致的请求错误）。优雅上下线插件提供了相应的优雅关闭API接口：

```api
/$$sermant$$/shutdown
```

以容器化服务为例（Sermant容器化部署依赖[injector组件](../user-guide/injector.md)）：给SpringCloud应用配置了就绪检查探针以及preStop钩子。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: spring-cloud-xxx
  name: spring-cloud-xxx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: spring-cloud-xxx
  template:
    metadata:
      labels:
        app: spring-cloud-xxx
    spec:
      containers:
      - env:
        - name: JAVA_HOME
          value: /xxx
        image: xxx
        imagePullPolicy: Always
        readinessProbe:
          httpGet:
            port: 16688  # 优雅上下线插件配置中的httpServerPort
            path: /$$sermant$$/healthCheck
          initialDelaySeconds: 1
          periodSeconds: 3
        name: spring-cloud-xxx
        ports:
        - containerPort: 8080
          protocol: TCP
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
        lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - '-c'
                  - >-
                    wget http://127.0.0.1:16688/$$sermant$$/shutdown 2>/tmp/null;sleep
                    30;exit 0
                    # 在POD停止前通知实例进行下线，其中16688为下线通知端口，优雅上下线插件配置中的httpServerPort
```

## 支持版本和限制

框架支持：

- **仅支持SpringCloud应用**，需确保SpringCloud版本在`Edgware.SR2`及以上
- 注册中心支持：Zookeeper、Consul、Naocs、Eureka、ServiceCenter

限制：

- 优雅上下线能力基于SpringCloud的默认负载均衡能力开发，若您实现了自定义负载均衡能力，该能力将不再适用


## 操作和结果验证

下面演示如何使用优雅上下线插件，验证SpringCloud应用的预热和延迟下线场景。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包
- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/grace-demo/spring-grace-nacos-demo)demo源码
- [下载](https://github.com/alibaba/nacos/releases)nacos（注册中心），并启动

> **注意：** [动态配置中心](../user-guide/configuration-center.md)会在本场景中默认使用，由于非本场景的核心组件，因此在本文中不额外赘述。

### 步骤一：编译打包demo应用

在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo`目录执行如下命令：

```shell
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-data/target`得到` nacos-rest-data-2.2.0.RELEASE.jar`包，在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-consumer/target`得到`nacos-rest-consumer-2.2.0.RELEASE.jar`，在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-provider/target`得到`nacos-rest-provider-2.2.0.RELEASE.jar`。

> **说明：** ${path}为demo应用下载所在路径。

### 步骤二：部署应用

我们将部署一个consumer实例，2个provider实例， 一个data实例。三个服务之间的依赖关系如下:

`consumer  ----------->  provider(两实例)  ------------->  data`

其中consumer开启优雅上下线能力，一个provider实例开启预热与优雅下线能力， 另一个provider实例仅开启优雅下线能力。

> **注意：** 下面通过应用启动时的-D参数对优雅上下线插件参数进行配置。

（1）启动data

```shell
java -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -jar nacos-rest-data-2.2.0.RELEASE.jar
```

（2）启动第一个provider实例（端口8880, **关闭预热功能**）

```shell
# Run under Linux
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=false -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8880 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

```shell
# Run under Windows
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=false -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8880 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

（3）启动第二个provider实例（端口8890, **开启预热能力**）

```shell
# Run under Linux
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8890 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

```shell
# Run under Windows
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8890 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

（4）启动consumer
```shell
# Run under Linux
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8800 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar nacos-rest-consumer-2.2.0.RELEASE.jar
```

```shell
# Run under Windows
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8800 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar nacos-rest-consumer-2.2.0.RELEASE.jar
```

> **说明：** ${path}为sermant实际安装路径，x.x.x代表sermant某个版本号。

### 验证

#### 预热能力验证

<MyImage src="/docs-img/springcloud-grace-warm-up.png"/>

访问接口`localhost:8800/graceHot`, 根据接口返回的ip与port判断预热是否生效。若预热时间段内（默认120s）访问偏向端口为`8880`的provider，随时间推移流量逐渐**平均**，则说明预热生效。


#### 延迟下线验证

<MyImage src="/docs-img/springcloud-grace-graceful-offline.png"/>

持续访问接口`localhost:8800/graceDownOpen`, 此时下线其中一个provider实例，观察请求是否出现错误，若未出现错误，则延迟下线能力验证成功。