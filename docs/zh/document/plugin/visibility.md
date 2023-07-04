# 服务可见性

本文介绍如何使用[服务可见性插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-visibility)。

## 术语

| 术语     | 说明                                     |
|--------|----------------------------------------|
| 契约信息   | 服务对外提供的接口信息，包括接口所属类、请求路径、方法名、参数列表、返回类型 |
| 调用依赖关系信息 | 服务之间的调用关系信息，包括服务提供者和服务消费者的IP、端口信息     |


## 功能介绍

服务可见性插件可以采集Spring Cloud和Dubbo应用的契约信息和调用依赖关系，在不修改代码的前提下可以通过Backend查看所有服务对外提供的接口信息以及服务之间的调用关系信息。

本插件基于Spring Cloud和Dubbo应用的服务注册、服务订阅等功能完成服务注册的接口信息以及服务订阅时的提供者信息的采集，以便于用户统一管理。

## 参数配置

### Sermant-agent配置
服务可见性插件需要在Sermant-agent中配置（`agent.service.visibility.enable=true`）、配置服务元数据（`service.meta.*`），具体参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

- agent.service.visibility.enable：控制服务可见性能力的开关
- service.meta.*：服务元数据信息。例如：组名、版本号、区域等。服务可见性插件采集元数据信息用于页面展示。

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

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译Sermant包
- [下载](https://github.com/huaweicloud/Sermant/tree/develop/sermant-integration-tests/dubbo-test)dubbo-test源码

> 注意：[动态配置中心](../user-guide/configuration-center.md)会在本场景中默认使用，由于非本场景的核心组件，因此在本文中不额外赘述。

### 步骤一：修改配置

- 修改Sermant-agent配置
在`${path}/sermant-agent-x.x.x/agent/config/config.properties`找到该配置文件，修改的配置项如下所示：

```yaml
agent.service.visibility.enable=true # 控制服务可见性能力的开关
```

- 修改服务可见性插件配置
在`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-visibility/config/config.yaml`找到该插件的配置文件， 修改的配置项如下所示：
```yaml
visibility.config:
  startFlag: true        # 服务可见性采集开关。为true时进行数据采集上报。
```

### 步骤二：编译打包dubbo-test应用

执行如下命令，对dubbo-test项目中的子项目dubbo-2-6-integration-consumer和dubbo-2-6-integration-provider进行打包:

```shell
mvn clean package
```

可在dubbo-2-6-integration-consumer项目中的`target`文件夹中得到dubbo-integration-consumer.jar包和dubbo-2-6-integration-provider项目中得到dubbo-integration-provider.jar包。

### 步骤三：启动应用

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

### 验证

访问血缘关系信息展示页面`http://127.0.0.1:8900/#/consanguinity`或契约信息展示页面`http://127.0.0.1:8900/#/contract`，页面成功显示采集信息则说明插件生效。

展示效果如下图所示：

- 契约信息展示效果图
<MyImage src="/docs-img/visibility-contarct.png"/>

- 调用依赖关系信息展示效果图
<MyImage src="/docs-img/visibility-consanguinity.png"/>