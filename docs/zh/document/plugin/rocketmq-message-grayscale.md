# 消息灰度插件

本文将介绍[消息灰度插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-mq-grayscale/mq-grayscale-rocketmq-plugin)及其使用方式，目前仅支持RocketMQ消息灰度。

## 功能介绍

在微服务快速迭代中，灰度发布和蓝绿发布已成为常见的升级手段。为了确保业务正常运行，一般通过配置路由策略，将不同流量路由到指定的版本实例，确保业务链路的正确执行。然而，目前在消息队列（MQ）中，灰度路由仍有不足，难以实现消息的定向消费。

消息灰度插件实现了消息的灰度能力，灰度实例生产者或者灰度流量生产灰度消息，灰度消费者消费灰度消息。

项目中引入RocketMQ消息灰度插件后，消息生产者以灰度实例启动或者基线实例收到灰度流量都生产灰度消息，消费者通过配置实现不同的消费效果，具体实现如下图下：

<MyImage src="/docs-img/mq-msg-grayscale-auto-base.png"/>
<MyImage src="/docs-img/mq-msg-grayscale-auto-base-gray.png"/>
<MyImage src="/docs-img/mq-msg-grayscale-base-base.png"/>
<MyImage src="/docs-img/mq-msg-grayscale-base-base-gray.png"/>

## 参数配置

### Sermant-agent配置

消息灰度插件需要在Sermant-agent中配置服务元数据（版本号、其它元数据），参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。判断是否为灰度实例时需要根据下列配置的标签值进行匹配。

- service.meta.version: 版本号，用来标识当前微服务实例的版本。

- service.meta.parameters: 其它元数据，用来给当前微服务实例打标签，形如k1:v1,k2:v2。

## 支持版本和限制

### 支持版本

| 框架类型            | 版本                |
|-----------------|-------------------|
| RocketMQ-client | 4.8.x+            |
| RocketMQ-server | 4.8.x+            |

### 限制

1、RocketMQ服务端需开启enablePropertyFilter过滤消息能力，以支持SQL92语句执行。

2、如果需要根据灰度流量生产灰度消息，需要结合标签透传插件一起使用。

3、消费者端需结合路由和流量标签透传插件实现基于消息标签的路由能力。注意，消息的标签透传需触发消息的getBody方法。

## 参数配置

### 插件静态配置

消息灰度插件的静态配置文件位于Sermant构建的产品包下，可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/mq-grayscale/config/config.yaml`找到该插件的配置文件， 配置如下所示：

```yaml
# MQ消息灰度配置
grayscale.mq.config:
  # 消息灰度插件开启开关，默认为false不开启
  enabled: false
  # 灰度组信息集合，每个灰度组包含consumerGroupTag(灰度组标识)、serviceMeta(微服务实例属性标签)及trafficTag(流量标签)。
  grayscale:
    # 灰度组标签，例如基线消费组名称为basic_group，那么灰度名称为basic_group_${consumerGroupTag}
    - consumerGroupTag: gray
      serviceMeta:
        # ServiceMeta匹配标签，如果服务启动时service_meta_parameters设置为x_lane_tag:gray，那么当前消费者为灰度节点。
        # 如果通过service_meta_version设置匹配信息，配置中的key一定要是'version'，像version:1.0.1。
        x_lane_tag: gray
        version: 1.0.1
      trafficTag:
        # 流量标签匹配，配合sermant-tag-transmission插件一起生效，如果请求header中包含x_lane_canary=gray，并且开启标签透传插件，设置配置
        # tag.transmission.config.matchRule.exact: ['x_lane_canary']，这时生产的消息为灰度消息.
        x_lane_canary: gray
      # serviceMeta与trafficTag关系如下:
      # 如果服务启动是service_meta_parameters设置信息x_lane_tag:gray，那么匹配为灰度实例。
      #   1、如果是生产者，那么消息的property中设置属性'x_lane_canary: gray'标识为灰度消息。
      #   2、如果是消费者，仅消费property包含'x_lane_canary: gray'属性的消息。
  # 基线消费组信息定义
  base:
    # 基线消费者消费消息模式，包含BASE/AUTO两个模式，默认值为AUTO模式
    # BASE模式消费除excludeGroupTags设置的消费组标识以外的消息
    # AUTO模式除excludeGroupTags设置的消费组标识及正在运行的灰度组以外的消息
    consumeMode: AUTO
    # auto模式下，基线消费者定期检查灰度消费者时间间隔
    autoCheckDelayTime: 15
    # 基线消费者默认剔除的灰度组标识，对应上面consumerGroupTag设置的值，auto/base模式都会生效
    excludeGroupTags: ["gray"]
```

### 插件动态配置

消息灰度插件支持通过动态配置中心进行配置发布，配置发布可以参考[动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html#发布配置)。动态配置模型中的`group`, `key`, `content` 分别对应如下：

- group

  其中group值为**app=${service.meta.application}&environment=${service.meta.environment}**，即应用配置。service.meta.application、service.meta.environment的配置请参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

- key

  key为**grayscale.mq.config**，表示消息灰度相关的配置节点

- content

  content为具体的消息灰度配置内容。动态配置与静态配置中的`grayscale.mq.config`一致，遵循yaml的格式，参数说明参考上文。在运行时动态修改消息灰度规则时需将该配置刷新至动态配置中心。

  ```yaml
  enabled: false
  grayscale:
    - consumerGroupTag: gray
      serviceMeta:
        x_lane_tag: gray
        version: 1.0.1
      trafficTag:
        x_lane_canary: gray
  base:
    consumeMode: AUTO
    autoCheckDelayTime: 15
    excludeGroupTags: ["gray"]
  ```

> **注意：
> 1、enabled值发生变化后，重启服务才会生效，以确保SQL92过滤语句的正确使用。。
> 2、serviceMeta是以微服务实例属性判断当前实例是否为灰度实例，调整后需要服务重启服务才能生效。
> 3、autoCheckDelayTime为定时检查灰度组时间间隔，如果是AUTO模式已运行过，调整后需要重启服务才能生效。
> 4、trafficTag、consumeMode、excludeGroupTags每次动态配置成功下发后会覆盖原有静态配置或之前的动态配置，且立即生效。

## 操作和结果验证

本节内容以SpringBoot示例微服务来介绍如何使用Sermant消息灰度插件以及验证结果，本示例使用curl命令请求灰度和基线实例生产消息接口，观察灰度、基线消费者消费消息情况。

### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz) Sermant Release包（当前版本推荐2.3.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.3.0/sermant-examples-mq-gray-demo-2.2.0.tar.gz) Demo二进制产物压缩包

### 2 下发配置
  
  本次测试以ZooKeeper为配置中心下发配置，创建父节点: app=default&environment=，再创建子节点：grayscale.mq.config，子节点配置内容如下：

  ```text
  enabled: false
  grayscale:
    - consumerGroupTag: gray
      serviceMeta:
        version: 1.0.1
      trafficTag:
        x_lane_canary: gray
  base:
    consumeMode: AUTO
    autoCheckDelayTime: 15
    excludeGroupTags: []
  ```

### 3 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`rocketmq-gray-producer-demo.jar`和`rocketmq-gray-consumer-demo.jar`。

### 4 部署应用

（1）启动消息灰度生产者应用

```shell
# windows
java -Dagent_service_dynamic_config_enable=false -Dserver.port=9040 -Dservice.meta.version=1.0.1 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar rocketmq-gray-producer-demo.jar

# mac, linux
java -Dagent_service_dynamic_config_enable=false -Dserver.port=9040 -Dservice.meta.version=1.0.1 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar rocketmq-gray-producer-demo.jar
```

（2）启动消息基线生产者应用

```shell
# windows
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar rocketmq-gray-producer-demo.jar

# mac, linux
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar rocketmq-gray-producer-demo.jar
```

（3）启动消息基线消费者应用

```shell
# windows
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar rocketmq-gray-consumer-demo.jar

# mac, linux
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar rocketmq-gray-consumer-demo.jar
```

（4）启动消息灰度消费者应用

```shell
# windows
java -Dagent_service_dynamic_config_enable=false -Dserver.port=9020 -Dservice.meta.version=1.0.1 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar rocketmq-gray-consumer-demo.jar

# mac, linux
java -Dagent_service_dynamic_config_enable=false -Dserver.port=9020 -Dservice.meta.version=1.0.1 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar rocketmq-gray-consumer-demo.jar
```

> 说明：此处${path}为sermant-agent包所在路径。

### 5 验证

通过curl命令调用生产消息接口，观察基线、灰度消费者消费消息情况。

```shell
// 执行命令发起调用灰度生产者生产消息接口
curl --location --request GET 'http://127.0.0.1:9040/sendMessage？message=11111'
// 灰度消费者监听到消息
sub message: version 1.0.1 send message 11111

// 执行命令发起调用基线生产者生产消息接口
curl --location --request GET 'http://127.0.0.1:9030/sendMessage？message=11111'
// 基线消费者监听到消息
sub message: version 1.0.0 send message 11111
```
