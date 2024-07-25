# 服务可见性

本文介绍如何使用[服务可见性插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-service-visibility)。

## 术语

| 术语     | 说明                                     |
|--------|----------------------------------------|
| 契约信息   | 服务对外提供的接口信息，包括接口所属类、请求路径、方法名、参数列表、返回类型 |
| 调用依赖关系信息 | 服务之间的调用关系信息，包括服务提供者和服务消费者的IP、端口信息     |

## 功能介绍

服务可见性插件可以采集Spring Cloud和Dubbo应用的契约信息和调用依赖关系，在不修改代码的前提下可以通过Backend查看所有服务对外提供的接口信息以及服务之间的调用关系信息。

本插件基于Spring Cloud和Dubbo应用的服务注册、服务订阅等功能完成服务注册的接口信息以及服务订阅时的提供者信息的采集，以便于用户统一管理。

## 参数配置

### Sermant Agent配置

服务可见性插件需要在Sermant Agent的配置文件`${path}/sermant-agent-x.x.x/agent/config/config.properties`中配置心跳开关（`agent.service.heartbeat.enable`）、网关开关（`agent.service.gateway.enable`）、通知开关（`notification.enable`)以及服务元数据（`service.meta.*`）。

```properties
agent.service.heartbeat.enable=false # 心跳开关，控制心跳功能是否开启。可见性插件依赖于心跳功能监听服务是否下线，服务下线时不展示该服务的可见性信息。默认为false：关闭，使用时需要设置为true：开启。
agent.service.gateway.enable=false   # 网关开关，控制消息发送功能是否开启。可见性插件依赖于消息发送功能插件通过消息发送功能将采集到的信息发送给Backend进行展示。默认为false：关闭，使用时需要设置为true：开启。
notification.enable=false            # 通知开关，控制Netty链接等通知的开关。可见性插件依赖于Netty链接的通知监听Netty是否重连。Netty重连时可见性插件会把采集的可见性数据给Backend重新发送一份，防止Backend重启导致数据丢失。默认为false：关闭，使用时需要设置为true：开启。
service.meta.application=default     # 指定应用名称。服务可见性插件采集该信息用于数据展示。
service.meta.version=1.0.0           # 指定服务版本。服务可见性插件采集该信息用于数据展示。
service.meta.project=default         # 指定服务命名空间。服务可见性插件采集该信息用于数据展示。
service.meta.environment=            # 指定服务所在环境。服务可见性插件采集该信息用于数据展示。
service.meta.zone=                   # 指定服务所在az（可用区）。服务可见性插件采集该信息用于数据展示。
```

### 插件配置

服务可见性插件需要开启采集开关，可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件，配置如下所示：

```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关。控制是否需要进行指标采集上报。为true时插件进行数据采集上报，为false时则不进行数据采集上报。
```

|             参数键             |    说明     |  默认值  | 是否必须 |
|:---------------------------:|:---------:|:-----:|:----:|
| visibility.config.startFlag | 服务可见性采集开关 | false |  是   |

## 支持版本与限制

框架支持：

- SpringBoot 1.5.10.Release及以上
- Dubbo 2.6.x-2.7.x

## 操作和结果验证

下面将演示如何使用服务可见性插件，验证采集Dubbo应用的契约和调用依赖关系信息场景。

### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-visibility-demo-2.0.0.tar.gz) Demo二进制产物压缩包
- [下载](https://zookeeper.apache.org/releases.html#download)ZooKeeper（动态配置中心&注册中心），并启动

### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`dubbo-integration-consumer.jar`和`dubbo-integration-provider.jar`。

### 3 修改配置

- 修改Sermant Agent配置
在`${path}/sermant-agent-x.x.x/agent/config/config.properties`找到该配置文件，修改的配置项如下所示：

```yaml
agent.service.heartbeat.enable=true # 心跳服务开关
agent.service.gateway.enable=true   # 统一网关服务开关
notification.enable=true            # 内部事件通知开关
```

- 修改服务可见性插件配置
在`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件， 修改的配置项如下所示：

```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关。为true时进行数据采集上报。
```

### 4 启动应用

- 参考如下命令, 启动backend应用。

```shell
# Run under Linux
java -jar ${path}/sermant-agent-x.x.x/server/sermant/sermant-backend-x.x.x.jar
```

```shell
# Run under Windows
java -jar ${path}\sermant-agent-x.x.x\server\sermant\sermant-backend-x.x.x.jar
```

- 参考如下命令, 启动dubbo-2-6-integration-consumer应用。

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

- 参考如下命令, 启动dubbo-2-6-integration-provider应用。

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

> **说明：** ${path}为sermant实际安装路径，x.x.x代表sermant某个版本号。

### 5 验证

访问可见性信息查询接口`http://127.0.0.1:8900/visibility/getCollectorInfo`可以看到采集的信息，则说明插件生效。

服务可见性信息的数据结构如下所示：

- 契约信息的数据结构：

```json
{
 "contractList ": [{
  "serviceType": "dubbo",
  "interfaceName": "io.sermant.integration.service.BarService",
  "serviceKey": "io.sermant.integration.service.BarService",
  "url": "io.sermant.integration.service.BarService",
  "methodInfoList": [{
   "name": "bar",
   "paramInfoList": [{
    "paramType": "java.lang.String",
    "paramName": "str"
   }],
   "returnInfo": {
    "paramType": "java.lang.String",
   }
  }]
 }]
}
```

- 依赖关系信息的数据结构：

```json
{
 "consanguinityList": [{
  "serviceType": "dubbo",
  "interfaceName": "io.sermant.integration.service.BarService",
  "url": "io.sermant.integration.service.BarService",
  "serviceKey": "io.sermant.integration.service.BarService",
  "providers": [{
   "ip": "x.x.x.x",
   "port": "28821",
   "serviceType": "dubbo",
   "serviceKey": "io.sermant.integration.service.BarService",
   "url": "io.sermant.integration.service.BarService"
  }]
 }]
}
```
