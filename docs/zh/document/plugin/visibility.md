# 服务可见性

本文档主要用于[Visibility模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-visibility)的使用说明

## 功能介绍

该插件为Spring Cloud和Dubbo应用提供契约信息和血缘关系采集展示的功能，方便用户在不修改代码的前提下可以通过backend查看所有服务对外提供的接口信息以及服务之间的调用关系信息。

插件基于Spring Cloud和Dubbo服务的服务注册、服务订阅等功能完成服务注册的接口信息以及服务订阅时的提供者信息的采集，以便于用户统一管理。

## 参数配置

### agentCore配置（必须）
服务可见性插件需要使用agentCore的配置，包括服务可见性重连开关、服务元数据配置以及黑名单配置。参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

### 服务可见性插件配置（必须）
您可在路径`${agent path}/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件， 配置如下所示：

```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关。为true时插件生效
```

### backend配置（必须）
您可在路径`${Sermant path}/sermant-backend/src/main/resources/application.properties`找到该配置文件，其中`Sermant path`为Sermant项目所在路径。 配置如下所示：

```yaml
visibility.effectiveTimes=60000        # 心跳有效时间（ms），超过这个时间没有收到下一次心跳认为服务下线。删除对应服务的契约、血缘关系信息。
```

如上配置， **请注意务必确保`startFlag`与`visibility.service.flag`、`serviceBlackList`正确配置**， 否则插件不会生效！

除以上用户需要注意的配置外，如下为可选配置， 用户可采用环境变量的方式进行配置

| 参数键                          | 说明 | 默认值            |
| ------------------------------- |--| ----------------- |
| appName             | 应用名称 | - |

## 支持版本与限制

框架支持：
- SpringBoot 1.5.10.Release及以上
- Dubbo 2.6.x-2.7.x

## 操作和结果验证

下面以dubbo-test项目为例，演示如何使用插件

### 环境准备

- JDK1.8及以上
- Maven
- 完成下载[dubbo-test源码](https://github.com/huaweicloud/Sermant/tree/develop/sermant-integration-tests/dubbo-test)
- 完成编译打包sermant。
- 下载zookeeper并启动应用。使用默认端口2181。

### 修改服务可见性配置

- 修改agentCore配置。
您可在路径`${agent path}/agent/config/config.properties`找到该配置文件， 修改的配置项如下所示：

```yaml
agent.config.serviceBlackList=              # 黑名单配置。插件生效时需要删除HeartbeatServiceImpl和NettyGatewayClient。开启心跳和消息发送
visibility.service.flag=true                # 服务可见性重连开关（用于backend重连时将全部信息发送给backend）。修改为true时开启
```

- 修改服务可见性插件配置。
您可在路径`${agent path}/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件， 修改的配置项如下所示：
```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关。修改为tue
```

### 编译打包dubbo-test应用

执行如下命令对dubbo-test项目的子项目dubbo-2-6-integration-consumer和dubbo-2-6-integration-provider进行打包:

```shell
mvn clean package
```

您可得到dubbo-2-6-integration-consumer项目的Jar包dubbo-integration-consumer.jar和dubbo-2-6-integration-provider项目的Jar包dubbo-integration-provider.jar

### 启动应用

参考如下命令启动dubbo-2-6-integration-consumer应用

```shell
java --javaagent:${agent path}\agent\sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

参考如下命令启动dubbo-2-6-integration-provider应用

```shell
java --javaagent:${agent path}\agent\sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

参考如下命令启动backend应用。backend JAR包地址为

```shell
java -jar ${agent path}\server\sermant\sermant-backend-1.0.0.jar
```

### 验证

访问血缘关系信息展示页面<http://127.0.0.1:8900/#/consanguinity>或契约信息展示页面<http://127.0.0.1:8900/#/contract>，页面成功显示采集信息则说明插件生效。