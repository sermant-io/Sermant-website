# 负载均衡

本文档主要介绍[负载均衡插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-loadbalancer)的使用方法。

## 功能介绍

根据配置中心的配置，无侵入地动态修改宿主应用的负载均衡策略。

## 参数配置

负载均衡基于配置中心进行动态配置，因此使用该能力需在配置中心配置对应负载均衡策略。负载均衡插件采用**流量标记+负载均衡规则**的方式规则，即配置一条规则需**同时配置两者**，下面分别介绍两项配置：

### 流量标记

流量标记用于标记当前针对那些服务生效，若服务为空，则会应用与所有微服务，配置示例如下:

**配置key:**  `servicecomb.matchGroup.testLb`

> 配置键说明: 
>
> `servicecomb.matchGroup. `：流量标记的固定前缀，所有key均需已此为前缀配置流量标记
>
> `testLb`：业务场景名，对应的负载均衡规则需配置相同的业务场景名

**配置content:**

```yaml
alias: loadbalancer-rule
matches:
- serviceName: zk-rest-provider  # 目标服务名
```

示例规则说明:  `serviceName`为下游服务名，即针对请求微服务`zk-rest-provider`将应用匹配的负载均衡规则；若配置项`serviceName`未配置，则应用于所有微服务。需要注意的是，该配置仅需配置`serviceName`配置项，其他的格式需保持不变。

> 优先级说明：若同时配置了多个负载均衡规则，插件会优先匹配配置服务名的负载均衡规则，否则采用未配置服务名的匹配的负载均衡规则。

### 负载均衡规则

负载均衡规则需为应用配置具体的负载均衡策略，负载均衡策略目前完全依赖与宿主本身存在的负载均衡策略，即宿主本身支持才可配置，支持列表见[支持版本和限制](#支持版本和限制)。

**配置key：**`servicecomb.loadbalance.testLb`

> 配置键说明: 
>
> `servicecomb.loadbalance. `：负载均衡规则配置的固定前缀，所有key均需已此为前缀配置负载均衡规则
>
> `testLb`：业务场景名，需与流量标记的业务场景相同才可生效

**配置content:**

```yaml
rule: Random
```

示例配置项说明: 即配置**随机负载均衡规则**， 配置值见表[支持版本和限制](#支持版本和限制)的**配置值**

> 以上需确认宿主自身应用的框架版本，确定当前支持的负载均衡策略。

### 发布配置

负载均衡的配置发布可以参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)

负载均衡插件默认会存在三种订阅标签的发布：

- 自定义标签：默认会订阅标签`public=default`，您也可以通过设置环境变量修改自定义标签，启动参数添加如下参数：`-Dservice.meta.customLabel=public -Dservice.meta.customLabelValue=default`
- 微服务标签:  默认会订阅标签`app=default&service=${yourServiceName}&environment=`，其中`${yourServiceName}`为微服务的名称，`environment`默认为空。当然同样可以采用环境变量进行变更，启动参数添加如下参数：`-Dservice.meta.application=default -Dservice.meta.environment=${yourEnvironment}`, 分别对应`app`与`envrionment`，而服务名为动态获取。
- 应用标签：默认会订阅标签`app=default&&environment=`, `environment`默认为空, 环境变量配置方式同**微服务标签**。

### 版本说明

- 在spring cloud 2020.0.x之前，spring cloud负载均衡默认使用的核心组件为spring-cloud-netflix-ribbon（宿主应用可通过排除ribbon相关的组件使用spring-cloud-loadbalancer组件），从spring cloud 2020.0.x开始，负载均衡的核心组件为spring-cloud-loadbalancer。

- 在spring cloud Hoxton.SR10之前，spring-cloud-loadbalancer的负载均衡策略只有轮询（ROUND_ROBIN），所以插件并不支持修改Hoxton. SR10之前的spring-cloud-loadbalancer组件的负载均衡策略，spring cloud Hoxton.SR10之前版本建议使用spring-cloud-netflix-ribbon组件进行负载均衡。


## 支持版本和限制

| 框架类型                    | 策略名                       | 配置值 / 负载均衡策略                          | 版本支持                                                     |
| --------------------------- | ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| dubbo                       | 随机（dubbo默认）            | Random / RANDOM                                | 2.6.x, 2.7.x                                                 |
| dubbo                       | 轮询                         | RoundRobin / ROUNDROBIN                        | 2.6.x, 2.7.x                                                 |
| dubbo                       | 最少活跃                     | leastActive / LEASTACTIVE                      | 2.6.x, 2.7.x                                                 |
| dubbo                       | 一致性HASH                   | consistentHash / CONSISTENTHASH                | 2.6.x, 2.7.x                                                 |
| dubbo                       | 最短响应时间                 | shortestResponse / SHORTESTRESPONSE            | 2.7.7+                                                       |
| spring-cloud-netflix-ribbon | 区域权重（ribbon默认）       | zoneAvoidance / ZONE_AVOIDANCE                 | ZONE_AVOIDANCEspring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 随机                         | Random / RANDOM                                | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 轮询                         | RoundRobin / ROUND_ROBIN                       | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 重试                         | retry / RETRY                                  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 最低并发                     | bestAvailable / BEST_AVAILABLE                 | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 筛选过滤轮询                 | availabilityFiltering / AVAILABILITY_FILTERING | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 响应时间加权重（Deprecated） | ResponseTimeWeighted / RESPONSE_TIME_WEIGHTED  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-netflix-ribbon | 响应时间加权重               | weightedResponseTime / WEIGHTED_RESPONSE_TIME  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring-cloud-loadbalancer   | 轮询（loadbalancer默认）     | RoundRobin / ROUND_ROBIN                       | spring cloud Hoxton.SR10+, spring cloud 2020.0.x, spring cloud 2021.0.x |
| spring-cloud-loadbalancer   | 随机                         | Random / RANDOM                                | spring cloud Hoxton.SR10+, spring cloud 2020.0.x, spring cloud 2021.0.x |


## 操作和结果验证

### 环境准备

- JDK1.8及以上
- Maven
- 完成下载[demo源码](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-register)
- 完成编译打包sermant
- [下载](https://zookeeper.apache.org/releases.html#download)并启动zookeeper
- 启动backend, 参考[后端模块介绍](../user-guide/backend.md)

### 编译打包demo应用
```shell
mvn clean package
```

### 发布流量标记
参考使用[发布配置](#发布配置)的灰度策略进行下发， 下发如下配置

```json
{
    "content": "alias: loadbalancer-rule\nmatches:\n- serviceName: zk-rest-provider", 
    "group": {
        "app": "default", 
        "environment": "", 
        "service": "zk-rest-consumer"
    }, 
    "key": "servicecomb.matchGroup.testLb"
}
```

### 发布匹配的负载均衡规则（以Random为例）
参考使用[发布配置](#发布配置)的灰度策略进行下发， 下发如下配置

```json
{
    "content": "rule: Random", 
    "group": {
        "app": "default", 
        "environment": "", 
        "service": "zk-rest-consumer"
    }, 
    "key": "servicecomb.loadbalance.testLb"
}
   ```

### 启动demo应用
参考如下命令启动生产者

```shell
java -javaagent:${agent path}\agent\sermant-agent.jar=appName=default -Dserver.port=${port} -jar zk-rest-provider.jar
```
其中`path`需要替换为Sermant实际打包路径, `port`为生产者端口，这里需要启动两个实例, 请分别配置不同的端口，有利于结果观察

参考如下命令启动消费者（一个实例即可）

```shell
java -javaagent:${agent path}\agent\sermant-agent.jar=appName=default -Dserver.port=8005 -jar zk-rest-consumer.jar
```

### 验证

上面步骤全部完成后，访问接口`localhost:8005/hello`, 通过返回的端口判断随机负载均衡规则（默认为轮询）是否生效。
