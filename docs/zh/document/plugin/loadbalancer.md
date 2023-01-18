# 负载均衡

本文介绍如何使用[负载均衡插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-loadbalancer)。

## 功能介绍

负载均衡插件主要用于无侵入地动态修改宿主应用的负载均衡策略。

## 参数配置

### 插件配置

负载均衡插件需要配置默认的负载均衡策略、是否强制使用插件的负载均衡等信息。可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/loadbalancer/config/config.yaml`找到该插件的配置文件，配置如下所示：

```yml
loadbalancer.plugin:
  defaultRule:        # 默认的负载均衡策略。没有配置负载均衡策略时，使用默认的负载均衡策略。
  forceUseSermantLb:  # 是否强制使用插件的负载均衡。负载均衡插件通过该配置决定是否强制修改用户的负载均衡策略。当前配置仅对ribbon生效。ribbon可能存在用户自身的负载均衡配置, 若用户不想影响自身的负载均衡配置, 则可将之设置为false。
  useCseRule:         # 是否使用CSE规则。负载均衡插件根据是否使用CSE规则订阅不同的动态配置路径。
```

| 参数键                                   | 说明            | 默认值  | 是否必须 |
|---------------------------------------|---------------|------|------|
| loadbalancer.plugin.defaultRule       | 默认的负载均衡策略     | 空    | 否    |
| loadbalancer.plugin.forceUseSermantLb | 是否强制使用插件的负载均衡 | true | 否    |
| loadbalancer.plugin.useCseRule        | 是否使用cse规则     | true | 否    |

## 详细治理规则

负载均衡插件基于动态配置中心进行配置发布，配置发布可以参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)。

负载均衡插件需要配置的动态配置信息如下:

- servicecomb.matchGroup.xxx: 流量标记（动态配置的key值）。用于标记当前业务场景针对那些服务生效。其对应的content为
```yaml
alias: loadbalancer-rule
matches:
- serviceName: zk-rest-provider  # 目标服务名
```
`serviceName`为下游服务名，若配置项`serviceName`未配置，则应用于所有微服务。需要注意的是，该配置仅需配置`serviceName`配置项，其他的格式需保持不变。

- servicecomb.loadbalance.xxx: 负载均衡规则（动态配置的key值）。用于配置具体业务场景下生效的负载均衡规则。其对应的content为

```yaml
rule: Random
```

> 说明： **xxx为具体的业务场景名称， 流量标记和负载均衡策略的场景一致时负载均衡策略生效**。

配置值的范围见表[支持版本和限制](#支持版本与限制)的**配置值**。

负载均衡插件默认支持两种级别的group配置：

- 微服务级别：即group的值为`app=default&environment=&service=${yourServiceName}`，其中`${yourServiceName}`为动态获取的微服务名称，`environment`默认为空。可以参考[参数配置方式](../user-guide/sermant-agent.md#参数配置方式)对`app`与`envrionment`进行变更。

- 应用级别：即group的值为 `app=default&environment=`, `environment`默认为空, 环境变量配置方式同**微服务级别**。

## 支持版本与限制

| 框架类型                        | 策略名                 | 配置值 / 负载均衡策略                                   | 版本支持                                                                                                           |
|-----------------------------|---------------------|------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| dubbo                       | 随机（dubbo默认）         | Random / RANDOM                                | 2.6.x, 2.7.x                                                                                                   |
| dubbo                       | 轮询                  | RoundRobin / ROUNDROBIN                        | 2.6.x, 2.7.x                                                                                                   |
| dubbo                       | 最少活跃                | leastActive / LEASTACTIVE                      | 2.6.x, 2.7.x                                                                                                   |
| dubbo                       | 一致性HASH             | consistentHash / CONSISTENTHASH                | 2.6.x, 2.7.x                                                                                                   |
| dubbo                       | 最短响应时间              | shortestResponse / SHORTESTRESPONSE            | 2.7.7+                                                                                                         |
| spring-cloud-netflix-ribbon | 区域权重（ribbon默认）      | zoneAvoidance / ZONE_AVOIDANCE                 | ZONE_AVOIDANCEspring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 随机                  | Random / RANDOM                                | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-netflix-ribbon | 轮询                  | RoundRobin / ROUND_ROBIN                       | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-netflix-ribbon | 重试                  | retry / RETRY                                  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-netflix-ribbon | 最低并发                | bestAvailable / BEST_AVAILABLE                 | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-netflix-ribbon | 筛选过滤轮询              | availabilityFiltering / AVAILABILITY_FILTERING | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-netflix-ribbon | 响应时间加权重（Deprecated） | ResponseTimeWeighted / RESPONSE_TIME_WEIGHTED  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-netflix-ribbon | 响应时间加权重             | weightedResponseTime / WEIGHTED_RESPONSE_TIME  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x               |
| spring-cloud-loadbalancer   | 轮询（loadbalancer默认）  | RoundRobin / ROUND_ROBIN                       | spring cloud Hoxton.SR10+, spring cloud 2020.0.x, spring cloud 2021.0.x                                        |
| spring-cloud-loadbalancer   | 随机                  | Random / RANDOM                                | spring cloud Hoxton.SR10+, spring cloud 2020.0.x, spring cloud 2021.0.x                                        |


## 操作和结果验证

下面将演示如何使用负载均衡插件。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-register)demo源码
- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包
- [下载](https://zookeeper.apache.org/releases.html#download)并启动zookeeper
- [下载](https://github.com/vran-dev/PrettyZoo/releases)PrettyZoo并启动连接zookeeper

### 步骤一：编译打包demo应用

在`${path}/Sermant-examples/sermant-template/demo-register`目录执行如下命令：

```shell
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/sermant-template/demo-register/resttemplate-consumer/target`得到`resttemplate-consumer.jar`包，在`${path}/Sermant-examples/sermant-template/demo-register/resttemplate-provider/target`得到`resttemplate-provider.jar`。

> 说明：path为demo应用下载所在路径。

### 步骤二：发布流量标记
参考使用[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)进行配置发布，发布如下配置

```json
{
    "content": "alias: loadbalancer-rule\n matches:\n- serviceName: zk-rest-provider", 
    "group": "app=default&environment=&service=zk-rest-consumer", 
    "key": "servicecomb.matchGroup.testLb"
}
```

以zookeeper为例，利用PrettyZoo工具来发布流量标记策略：

1. 创建节点`/app=default&environment=&service=zk-rest-consumer`

<MyImage src="/docs-img/loadbalancer_node.png"/>

2. 创建节点`/app=default&environment=&service=zk-rest-consumer/servicecomb.matchGroup.testLb`和数据`alias: loadbalancer-rule\n matches:\n- serviceName: zk-rest-provider`

<MyImage src="/docs-img/loadbalance_matchgroup.png"/>

### 步骤三：发布匹配的负载均衡规则（以Random为例）
参考使用[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)进行配置发布， 发布如下配置

```json
{
    "content": "rule: Random", 
    "group": "app=default&environment=&service=zk-rest-consumer", 
    "key": "servicecomb.loadbalance.testLb"
}
```

以zookeeper为例，利用PrettyZoo工具来发布负载均衡策略：

1. 创建节点`/app=default&environment=&service=zk-rest-consumer/servicecomb.loadbalance.testLb`和数据`rule: Random`

<MyImage src="/docs-img/loadbalance_lb.png"/>

### 步骤四：启动demo应用

参考如下命令启动两个生产者

- 参考如下命令启动服务提供者，端口为8006
```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dserver.port=8006 -jar resttemplate-provider.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dserver.port=8006 -jar resttemplate-provider.jar
```
- 参考如下命令启动服务提供者，端口为8007

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dserver.port=8007 -jar resttemplate-provider.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dserver.port=8007 -jar resttemplate-provider.jar
```

- 参考如下命令启动消费者（一个实例即可），端口为8005

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dserver.port=8005 -jar resttemplate-consumer.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dserver.port=8005 -jar resttemplate-consumer.jar
```
> **说明**：
> 其中path需要替换为Sermant实际安装路径。
> x.x.x代表Sermant某个版本号。

### 验证

上面步骤全部完成后，访问接口 `http://localhost:8005/hello`, 多次调用，如果返回的端口信息中8006、8007随机展示则表示随机负载均衡规则（默认为轮询）已生效。

效果图如下所示：

<MyImage src="/docs-img/loadbanlance1.png"/>

<MyImage src="/docs-img/loadbanlance2.png"/>
