# 优雅上下线

本文主要介绍优雅上下线能力以及其使用方法，该功能当前集成在[注册插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry) 中, 但功能可独立使用。

## 功能介绍

对于任何一个线上应用来说，发布、扩容、缩容和重启等操作是无法避免，而该过程中时常会遇到以下问题：

- 刚上线的实例，由于流量过大，该实例在初始化时便被大量流量访问，导致请求阻塞，甚至宕机，例如懒加载的场景。
- 实例下线时，因注册发现延迟刷新问题，无法及时告知上游，导致流量丢失或者错误。

为解决上述问题，优雅上下线应运而生，针对以上两个问题，插件提供**预热**与**优雅下线**能力，对上述场景问题提供保护。

**预热**， 顾名思义，即先用少部分流量对实例访问，后续根据时间推移，逐渐增加增加流量，确保新启动实例能成功过渡。

**优雅下线**，即对下线的实例提供保护，插件基于**实时通知**+**刷新缓存的机制**快速更新上游缓存，同时基于流量统计的方式，确保即将下线的实例尽可能的将流量处理完成，最大程度避免流量丢失。

## 参数配置

### 插件配置

优雅上下线插件需要打开优雅上下线开关（`grace.rule.enableSpring`）、配置启动延迟时间（`grace.rule.startDelayTime`）、开启预热（`grace.rule.enableWarmUp`）等配置，可在`${path}/sermant-agent/agent/pluginPackge/service-registry/config/config.yaml`找到该插件的配置文件，配置如下所示：

```yaml
grace.rule:
  enableSpring: false # springCloud优雅上下线开关
  startDelayTime: 0  # 优雅上下线启动延迟时间, 单位S
  enableWarmUp: false # 是否开启预热
  warmUpTime: 120    # 预热时间, 单位S
  enableGraceShutdown: false # 是否开启优雅下线
  shutdownWaitTime: 30  # 关闭前相关流量检测的最大等待时间, 单位S. 需开启enabledGraceShutdown才会生效
  enableOfflineNotify: false # 是否开启下线主动通知
  httpServerPort: 16688 # 开启下线主动通知时的httpServer端口
  upstreamAddressMaxSize: 500 # 缓存上游地址的默认大小
  upstreamAddressExpiredTime: 60 # 缓存上游地址的过期时间, 单位S
```

| 参数键                               | 说明                                                                     | 默认值        | 是否必须 |
| :----------------------------------- | :---------------------------------------------------------------------- | :------------| :------- |
| grace.rule.enableSpring              | springCloud优雅上下线开关                                                | false         | 是    |
| grace.rule.startDelayTime            | 优雅上下线启动延迟时间, 单位S                                             | 0             | 是    |
| grace.rule.enableWarmUp              | 是否开启预热                                                             | false         | 是    |
| grace.rule.enableGraceShutdown       | 是否开启优雅下线                                                          | false         | 是    |
| grace.rule.shutdownWaitTime          | 关闭前相关流量检测的最大等待时间, 单位S. 需开启enabledGraceShutdown才会生效  | 30            | 是    |
| grace.rule.enableOfflineNotify       | 是否开启下线主动通知                                                      | false         | 是    |
| grace.rule.httpServerPort            | 开启下线主动通知时的httpServer端口                                        | 16688          | 是    |
| grace.rule.upstreamAddressMaxSize    | 缓存上游地址的默认大小                                                    | 5000           | 是    |
| grace.rule.upstreamAddressExpiredTime| 缓存上游地址的过期时间, 单位S                                              | 60            | 是    |

## 支持版本和限制

框架支持：

- **仅支持SpringCloud应用**，需确保SpringCloud版本在`Edgware.SR2`及以上
- 注册中心支持：Zookeeper、Consul、Naocs、Eureka、ServiceCenter

限制：

- 优雅上下线能力基于SpringCloud的默认负载均衡能力开发，若您实现了自定义负载均衡能力，该能力将不再适用


## 操作和结果验证

下面演示如何使用优雅上下线插件。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包
- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/grace-demo/spring-grace-nacos-demo)Demo源码
- [下载](https://github.com/alibaba/nacos/releases)nacos，并启动
- [下载](https://zookeeper.apache.org/releases.html#download)zookeeper，并启动

### 步骤一：编译打包demo应用

在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo`目录执行如下命令：

```shell
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-data/target`得到` nacos-rest-data-2.2.0.RELEASE.jar`包，在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-consumer/target`得到`nacos-rest-consumer-2.2.0.RELEASE.jar`，在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-provider/target`得到`nacos-rest-provider-2.2.0.RELEASE.jar`。

> 说明：path为demo应用下载所在路径。

### 步骤二：部署应用

我们将部署一个consumer实例，2个provider实例， 一个data实例。如下:

`consumer  ----------->  provider(两实例)  ------------->  data`

其中consumer开启优雅上下线能力，一个provider实例开启预热与优雅下线能力， 另一个provider实例仅开启优雅下线能力。

> 注：下面通过应用启动时的-D参数对优雅上下线插件参数进行配置。

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

> **说明**：
> 其中path需要替换为Sermant实际安装路径。
> x.x.x代表Sermant某个版本号。


### 验证

#### 预热能力验证

访问接口`localhost:8800/graceHot`, 根据接口返回的ip与port判断预热是否生效。若预热时间段内（默认120s）访问偏向8880，随时间推移流量逐渐平均，则说明预热生效。


#### 优雅下线验证

持续访问接口`localhost:8800/graceDownOpen`, 此时下线其中一个provider实例，观察请求是否出现错误，若未出现错误，则优雅下线能力验证成功。