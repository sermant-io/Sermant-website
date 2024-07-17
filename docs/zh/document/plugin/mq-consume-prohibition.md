# 消息队列禁止消费

本文介绍[消息队列禁止消费插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-mq-consume-prohibition)及其使用方式。

## 功能介绍

消息队列是分布式系统中重要的的组件，主要用来解决应用解耦、异步消息、流量削峰等问题，实现高性能、高可用，可伸缩和最终一致性架构。目前使用较多的消息队列有Kafka、RocketMQ等。

在某些特定场景中，用户希望能够暂停个别或全部消息队列消费者的消费动作，以保证业务处理流程中的消息在系统处于非常规环境或状态时暂时不处理。待系统恢复后再继续执行消息的正常消费，完成业务逻辑的处理。例如，在多云多活架构系统中，如果发生区域性故障需要对流量做切流处理，可在发生故障的可用区开启消息队列禁止消费功能，让正常可用区的消费者来处理业务，避免故障区域消费流量导致业务异常，保障系统的高可用。待故障处理完成后，可重新开启消费。

本插件着手于以非侵入的方式解决消息队列消费者在运行过程中的禁止消费以及恢复消费的问题。用户可以通过下发动态配置，指定微服务中的消费者停止消费某个Topic，也可以在停止消费后重新恢复原始Topic的消费。在此过程中会保证消息队列的消费顺序、消费进度等是正常无误的，以确保不遗漏消费。

###  快速开始

本插件的快速上手使用教程可参考[操作和结果验证](#操作和结果验证)。

## 支持版本和限制

### 支持版本

消息队列禁止消费插件目前支持Kakfa和RocketMQ两种消息中间件，具体支持版本如下：

| 消息中间件 | 版本                       |
| ---------- | -------------------------- |
| Kafka      | 1.x, 2.x                   |
| RocketMQ   | 4.8.x, 4.9.x, 5.0.x, 5.1.x |

### 使用说明及限制

消息队列禁止消费插件必须使用动态配置中心来下发配置，使用说明请参考[参数配置](#参数配置)章节。

- 整个插件的禁止消费的**配置下发粒度**都是Topic级别，用户在动态配置中心下发需要禁止消费哪些Topic。

- Kafka版本支持Topic粒度的禁止消费以及恢复消费，也即可以精确控制消费者禁止消费某个Topic。
- RocketMQ支持整个消费者所订阅的Topic的同时禁止消费以及恢复消费，这是因为RocketMQ中[同一个消费者组下所有消费者实例订阅关系必须一致](https://rocketmq.apache.org/zh/docs/4.x/bestPractice/07subscribe/)，否则会导致消费消息紊乱，甚至消息丢失。在下发动态配置时，如果配置的Topic包含在当前消费者消费的Topic中，则该消费者将退出消费者组，也即禁止消费所有Topic。恢复消费时则重新消费原来的所有Topic。

## 参数配置

消息队列禁止消费插件必须使用动态配置中心来下发配置，配置发布可以参考[动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html#发布配置)。动态配置模型中的`group`, `key`, `content` 分别对应如下：

- **group**

  group为**app=${service.meta.application}&environment=${service.meta.environment}&zone=${service.meta.zone}**，

  其中`${service.meta.application}`，`${service.meta.environment}`以及`${service.meta.zone}`在Sermant的配置文件`sermant-agent-x.x.x/agent/config.properties`中配置。group的默认值为`app=default&environment=&zone=default`。

- **key**

  key分为两类。

  全局配置：key为固定值**sermant.mq.consume.globalConfig**，其优先级大于局部配置。

  局部配置：微服务的局部配置，key为**sermant.mq.consume.${service.meta.service}**，其中`${service.meta.service}`在Sermant的配置文件`sermant-agent-x.x.x/agent/config.properties`中配置。

  在同时配置的情况下，若全局配置禁止消费开关打开，则全局配置生效，否则局部配置生效。

- **content**

  content为具体的消息队列禁止消费的配置内容，遵循yaml的格式。

  `enableKafkaProhibition`控制Kafka禁止消费开关，`kafkaTopics`配置需要禁止消费的Topic列表。

  `enableRocketMqProhibition`控制RocketMQ禁止消费开关，`rocketMqTopics`配置需要禁止消费的Topic列表。

  ```yaml
  enableKafkaProhibition: true
  kafkaTopics:
   - demo-kafka-topic
  enableRocketMqProhibition: true
  rocketMqTopics:
   - demo-rocketmq-topic-1
   - demo-rocketmq-topic-2
  ```

> 注意：如果是新增或者更新配置，新配置将会在Sermant中直接全部覆盖刷新。如果是删除配置，那么Sermant中的禁止消费开关将关闭，Topic列表置空。

## 操作和结果验证

本节内容以包含Kafka消费者的示例微服务来演示消息队列禁止消费插件的能力。示例中通过在ZooKeeper中下发动态配置，指定需禁止消费的Topic，通过日志以及Kafka官方提供的消费者组查询脚本验证禁止消费生效。

### 1 准备工作

- [下载 ](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://zookeeper.apache.org/releases.html#download) ZooKeeper Release包（作为动态配置中心）
- [下载](https://kafka.apache.org/downloads) Kafka Release包
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-mq-consume-prohibition-demo-2.0.0.tar.gz) Demo二进制产物压缩包

### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`kafka-demo.jar`。

### 3 部署动态配置中心ZooKeeper

解压ZooKeeper Release包，将`conf/zoo_sample.cfg`拷贝至`conf/zoo.cfg`后，通过执行以下脚本即可启动ZooKeeper:

```shell
sh bin/zkServer.sh start
```

ZooKeeper的使用说明可参阅[官网](https://zookeeper.apache.org/doc/current/zookeeperStarted.html)。

### 4 部署消息队列Kafka

解压Kafka Release包，通过执行以下脚本即可启动Kafka:

```shell
sh bin/kafka-server-start.sh  -daemon ../config/server.properties
```

Kafka的使用说明可参阅[官网](https://kafka.apache.org/quickstart)。

### 5 部署应用

执行以下命令挂载Sermant启动Demo应用:

```shell
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar kafka-demo.jar
```

> 说明：此处${path}为sermant-agent包所在路径。

该Demo将会启动一个Kafka消费者，它订阅了名称为"demo-test-topic"的Topic，并会轮询消费该Topic。

### 6 发布配置

配置kafka禁止消费规则，参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)中Zookeeper进行配置发布。

其中key值为**sermant.mq.consume.globalConfig**，group为**app=default&environment=&zone=default**，content为具体的禁止消费规则，如下所示：

```yaml
enableKafkaProhibition: true
kafkaTopics:
 - demo-test-topic
```

其中，通过`enableKafkaProhibition`开启禁止消费能力，通过`kafkaTopics`指定禁止消费的Topic列表。

发布配置后Demo创建的Kafka消费者将停止对demo-test-topic的订阅和消费。

### 7 结果验证

#### 发布配置前查看消费者组状态

在步骤三中解压后的Kafka文件夹下，执行如下脚本可查看当前消费者组的消费者状态：

```shell
sh kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group demo-test-group
```

若输出结果如下，通过查询demo-test-topic的消费者成员，可知此时demo-test-topic正在被Demo应用创建的消费者消费。

```
GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID                                                     HOST            CLIENT-ID
demo-test-group demo-test-topic 0          0               0               0               consumer-demo-test-group-1-61c0c4f5-0ac7-43f4-8704-5f33c2d3f0ea /127.0.0.1      consumer-demo-test-group-1
```

#### 发布配置后查看日志

发布配置后，查看Demo应用在控制台中输出的日志，若出现如下日志内容，可以说明动态配置已下发成功，禁止消费生效。

```txt
INFO --- [main] o.a.k.clients.consumer.KafkaConsumer: [Consumer clientId=consumer-demo-test-group-1, groupId=demo-test-group] Unsubscribed all topics or patterns and assigned partitions
```

#### 发布配置后查看消费者组状态

发布配置后，在步骤三中解压后的Kafka文件夹下，执行如下脚本可查看当前消费者组的消费者状态：

```shell
sh kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group demo-test-group
```

若输出结果如下，提示“Consumer group 'demo-test-group' has no active members.”，可知消费者组中没有消费者在消费demo-test-topic，说明禁止消费生效。

```
Consumer group 'demo-test-group' has no active members.

GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID     HOST            CLIENT-ID
demo-test-group demo-test-topic 0          0               0               0               -               -               -
```

