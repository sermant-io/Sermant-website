# 服务可见性

本文介绍如何使用[服务可见性插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-visibility)。

## 功能介绍

服务可见性插件可以采集Spring Cloud和Dubbo应用的契约信息和血缘关系，在不修改代码的前提下可以通过Backend查看所有服务对外提供的接口信息以及服务之间的调用关系信息。

本插件基于Spring Cloud和Dubbo应用的服务注册、服务订阅等功能完成服务注册的接口信息以及服务订阅时的提供者信息的采集，以便于用户统一管理。

## 参数配置

### Sermant-agent配置
服务可见性插件需要在Sermant-agent中配置黑名单（`agent.config.serviceBlackList`）、开启服务可见性重连开关(`visibility.service.flag`)以及配置服务元数据（`service.meta.*`），具体参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

### 插件配置
服务可见性插件需要开启采集开关，可在路径`${sermant-agent-x.x.x}/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件，配置如下所示：

```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关。为true时插件生效
```

| 参数键                          | 说明 | 默认值            | 是否必须 |
| ------------------------------- | ---------------- | ------ | ------ |
| visibility.config.startFlag     | 服务可见性采集开关 | false | 是 |


**注意事项**：请务必确保`agent.config.serviceBlackList`、`visibility.service.flag`与`visibility.config.startFlag`正确， 否则插件不会生效！

## 支持版本与限制

框架支持：
- SpringBoot 1.5.10.Release及以上
- Dubbo 2.6.x-2.7.x

## 操作和结果验证

下面以dubbo-test项目为例，演示如何使用服务可见性插件。

### 准备工作

- 下载/编译Sermant包
- 下载[dubbo-test源码](https://github.com/huaweicloud/Sermant/tree/develop/sermant-integration-tests/dubbo-test)
- 下载zookeeper并启动应用

### 步骤一：修改配置

- 修改Sermant-agent配置
在路径`${sermant-agent-x.x.x}/agent/config/config.properties`找到该配置文件，修改的配置项如下所示：

```yaml
agent.config.serviceBlackList=              # 黑名单配置，插件生效时需要删除HeartbeatServiceImpl和NettyGatewayClient。
visibility.service.flag=true                # 服务可见性重连开关（用于backend重连时将全部信息发送给backend）。
```

- 修改服务可见性插件配置
在路径`${sermant-agent-x.x.x}/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件， 修改的配置项如下所示：
```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关
```

### 步骤二：编译打包dubbo-test应用

执行如下命令，对dubbo-test项目中的子项目dubbo-2-6-integration-consumer和dubbo-2-6-integration-provider进行打包:

```shell
mvn clean package
```

可在dubbo-2-6-integration-consumer项目中得到dubbo-integration-consumer.jar包和dubbo-2-6-integration-provider项目中得到dubbo-integration-provider.jar包。

### 步骤三：启动应用

参考如下命令, 启动dubbo-2-6-integration-consumer应用。

```shell
java -javaagent:${sermant-agent-x.x.x}\agent\sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

参考如下命令, 启动dubbo-2-6-integration-provider应用。

```shell
java -javaagent:${sermant-agent-x.x.x}\agent\sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

参考如下命令, 启动backend应用。

```shell
java -jar ${sermant-agent-x.x.x}\server\sermant\sermant-backend-x.x.x.jar
```

### 验证

访问血缘关系信息展示页面<http://127.0.0.1:8900/#/consanguinity>或契约信息展示页面<http://127.0.0.1:8900/#/contract>，页面成功显示采集信息则说明插件生效。