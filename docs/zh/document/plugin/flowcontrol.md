# 流控
本文介绍[流控插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-flowcontrol)及其使用方式。

## 功能介绍

流控插件基于[resilience4j](https://github.com/resilience4j) 框架实现，以"流量"为切入点，实现"非侵入式"流量控制；当前支持[限流](#限流)、[熔断](#熔断)、[隔离](#隔离)、[错误注入](#错误注入)、[重试](#重试)、[系统规则](#系统级流控)，并且支持通过配置中心动态下发流控规则，实时生效。

### 快速开始
本插件的快速上手使用教程可参考[操作和结果验证](#操作和结果验证)。

## 限流
**限流能力对指定接口限制1S秒内通过的QPS，当1S内流量超过指定阈值，将触发限流，限制请求流量，在客户端和服务端都可生效。**

执行限流策略需要通过配置中心下发流量匹配规则和限流规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发限流规则：** 下发限流规则对匹配的流量执行限流策略。

### 示例 

现有如下场景：在名称为flowcontrol的微服务中，对于API访问路径为/rateLimiting的流量，如果每秒请求数超过2次，将触发限流机制。具体下发的规则如下所示：

#### 下发流量匹配规则
为实现上述限流场景，首先下发流量匹配规则来匹配需要执行限流策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.matchGroup.rateLimitingScene
* **content：**
```yaml
  # 精确匹配api访问路径为/rateLimiting的流量
  matches:          
  - apiPath:          
      exact: /rateLimiting     
  ```
流量匹配的更多规则说明请参考[流量匹配规则说明](#流量匹配规则说明)，
动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`rateLimitingScene`。流量匹配规则和限流规则的key的自定义场景名称需保持一致，才能对匹配的流量执行限流策略。
#### 下发限流规则
下发流量匹配规则后，对匹配的流量执行限流策略还需要下发限流规则。根据动态配置中心的配置模型，限流规则由group、key和content三部分组成，group用来约束限流规则生效的微服务，key用来约束限流规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的限流规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.rateLimiting.rateLimitingScene
* **content：**
```yaml
  # 1秒内超过2个请求，则触发限流能力
  limitRefreshPeriod: 1000
  rate: 2    
  ```
  限流配置的更多规则说明请参考[限流规则说明](#限流规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：限流规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：限流规则的key由前缀`servicecomb.rateLimiting`和自定义场景名称组成，本示例设定场景名称为`rateLimitingScene`。流量匹配规则和限流规则的key的自定义场景名称需保持一致，才能对匹配的流量执行限流策略。

## 熔断
**熔断指对指定接口配置熔断策略，可从单位统计时间窗口内的错误率或者慢请求率进行统计，当请求错误率或者慢请求率达到指定比例阈值，即触发熔断，在时间窗口重置前，隔离所有请求，在客户端和服务端都可生效。**

执行熔断策略需要通过配置中心下发流量匹配规则和熔断规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发熔断规则：** 下发熔断规则对匹配的流量执行熔断策略。

### 示例 

现有如下场景：在名称为flowcontrol的微服务中，对api访问路径为/circuitBreaker的流量，在10秒内，若流量标记的接口请求次数超过3次，且错误率超过90%或者慢请求占比超过80%则触发熔断。具体下发的规则如下所示：

#### 下发流量匹配规则
为实现上述熔断场景，首先下发流量匹配规则来匹配需要执行熔断策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol 
* **key：** servicecomb.matchGroup.circuitBreakerScene
* **content：**
```yaml
  # 精确匹配api访问路径为/circuitBreaker的流量
  matches:          
  - apiPath:          
      exact: /circuitBreaker     
  ```
流量匹配的更多规则说明请参考[流量匹配规则说明](#流量匹配规则说明)，
动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`circuitBreakerScene`。流量匹配规则和熔断规则的key的自定义场景名称需保持一致，才能对匹配的流量执行熔断策略。

#### 下发熔断规则
下发流量匹配规则后，对匹配的流量执行熔断策略还需要下发熔断规则。根据动态配置中心的配置模型，熔断规则由group、key和content三部分组成，group用来约束熔断规则生效的微服务，key用来约束熔断规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的熔断规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.circuitBreaker.circuitBreakerScene
* **content：**
```yaml
  # 在10秒内，若流量标记的接口请求次数超过3次，且错误率超过90%或者慢请求占比超过80%则触发熔断
  failureRateThreshold: 90
  minimumNumberOfCalls: 3
  slidingWindowSize: 10S
  slidingWindowType: time
  slowCallRateThreshold: 80  
  ```
熔断配置的更多规则说明请参考[熔断规则说明](#熔断规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：熔断规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：熔断规则的key由前缀`servicecomb.circuitBreaker`和自定义场景名称组成，本示例设定场景名称为`circuitBreakerScene`。流量匹配规则和熔断规则的key的自定义场景名称需保持一致，才能对匹配的流量执行熔断策略。

### 熔断指标采集
服务配置了[熔断策略](#熔断)后，可以开启监控开关，插件会异步采集[熔断指标](./monitor.md#熔断指标)，并通过[监控插件](./monitor.md)进行指标上报。
在`${sermant-path}/agent/pluginPackage/flowcontrol/config/config.yaml`配置文件中开启监控开关：
```yaml
  flow.control.plugin:
    enable-start-monitor: true 
  ```
> 说明：${sermant-path}为sermant包路径。

## 隔离
**隔离对指定接口设置允许的最大并发量，当超过最大并发量时，对并发流量进行排队等待控制，等待超过最大等待时间则拒绝调用，避免瞬时并发流量过大导致服务崩溃，在客户端和服务端都可生效。**

执行隔离策略需要通过配置中心下发流量匹配规则和限流规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发隔离规则：** 下发隔离规则对匹配的流量执行隔离策略。

### 示例

现有如下场景：在名称为flowcontrol的微服务中，对api访问路径为/bulkhead的流量，若最大并发数超过5，且新的请求等待10S，还未获取资源，则触发隔离异常。

#### 下发流量匹配规则
为实现上述隔离场景，首先下发流量匹配规则来匹配需要执行隔离策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.matchGroup.bulkheadScene
* **content：**
```yaml
  # 精确匹配api访问路径为/bulkhead的流量
  matches:          
  - apiPath:          
      exact: /bulkhead     
  ```
流量匹配的更多规则说明请参考[流量匹配规则说明](#流量匹配规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`bulkheadScene`。流量匹配规则和隔离规则的key的自定义场景名称需保持一致，才能对匹配的流量执行隔离策略。
#### 下发隔离规则
下发流量匹配规则后，对匹配的流量执行隔离策略还需要下发隔离规则。根据动态配置中心的配置模型，隔离规则由group、key和content三部分组成，group用来约束隔离规则生效的微服务，key用来约束隔离规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的隔离规则，其内容如下所示：
* **group：** service=flowcontroll
* **key：** servicecomb.bulkhead.bulkheadScene
* **content：**
```yaml
  # 最大并发数超过5，且新的请求等待10S，还未获取资源，则触发隔离异常
  maxConcurrentCalls: 5
  maxWaitDuration: 10S
  ```
隔离配置的更多规则说明请参考[隔离规则说明](#隔离规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：隔离规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：隔离规则的key由前缀`servicecomb.bulkhead`和自定义场景名称组成，本示例设定场景名称为`bulkheadScene`。流量匹配规则和隔离规则的key的自定义场景名称需保持一致，才能对匹配的流量执行隔离策略。
## 错误注入
**错误注入指在服务运行时，给指定服务配置错误注入策略，在客户端访问目标服务前，以指定策略模式返回。该策略多用于减少目标服务的访问负载，可作为降级的一种措施。**

执行错误注入策略需要通过配置中心下发流量匹配规则和限流规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发错误注入规则：** 下发错误注入规则对匹配的流量执行错误注入策略。

### 示例 

现有如下场景：在名称为flowcontrol的微服务中，对api访问路径为/faultInjection的流量，访问接口时100%将返回空值。 

#### 下发流量匹配规则
为实现上述错误注入场景，首先下发流量匹配规则来匹配需要执行错误注入策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.matchGroup.faultInjectionScene
* **content：**
```yaml
  # 精确匹配api访问路径为/faultInjection的流量
  matches:          
  - apiPath:          
      exact: /faultInjection     
  ```
流量匹配的更多规则说明请参考[流量匹配规则说明](#流量匹配规则说明)，
动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`faultInjectionScene`。流量匹配规则和错误注入规则的key的自定义场景名称需保持一致，才能对匹配的流量执行错误注入策略。
#### 下发错误注入规则
下发流量匹配规则后，对匹配的流量执行错误注入策略还需要下发错误注入规则。根据动态配置中心的配置模型，错误注入规则由group、key和content三部分组成，group用来约束错误注入规则生效的微服务，key用来约束错误注入规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的错误注入规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.faultInjection.faultInjectionScene
* **content：**
```yaml
  # 访问接口时100%将返回空值
  type: abort
  percentage: 100
  fallbackType: ReturnNull
  forceClosed: false
  errorCode: 503
  ```
错误注入配置的更多规则说明请参考[错误注入规则说明](#错误注入规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：错误注入规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：错误注入规则的key由前缀`servicecomb.faultInjection`和自定义场景名称组成，本示例设定场景名称为`faultInjectionScene`。流量匹配规则和错误注入规则的key的自定义场景名称需保持一致，才能对匹配的流量执行错误注入策略。
## 重试
**重试策略指当服务遇到非致命的错误时，可以通过重试的方式避免服务的最终失败。**

执行重试策略需要通过配置中心下发流量匹配规则和限流规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发重试规则：** 下发重试规则对匹配的流量执行重试策略。

### 示例 

现有如下场景：在名称为flowcontrol的微服务中，对api访问路径为/retry的流量，访问接口时，当请求抛出500异常时进行重试，直到重试成功或者达到最大重试次数。 

#### 下发流量匹配规则
为实现上述重试场景，首先下发流量匹配规则来匹配需要执行重试策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.matchGroup.retryScene
* **content：**
```yaml
  # 精确匹配api访问路径为/retry的流量
  matches:          
  - apiPath:          
      exact: /retry     
  ```
流量匹配的更多规则说明请参考[流量匹配规则说明](#流量匹配规则说明)，
动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`retryScene`。流量匹配规则和重试规则的key的自定义场景名称需保持一致，才能对匹配的流量执行重试策略。
#### 下发重试规则
下发流量匹配规则后，对匹配的流量执行重试策略还需要下发重试规则。根据动态配置中心的配置模型，重试规则由group、key和content三部分组成，group用来约束重试规则生效的微服务，key用来约束重试规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的重试规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.retry.retryScene
* **content：**
```yaml
  # 访问接口时，当请求抛出500异常时进行重试，直到重试成功或者达到最大重试次数
  waitDuration: 2000
  retryStrategy: FixedInterval
  maxAttempts: 2
  retryOnResponseStatus:
    - 500
  ```
重试配置的更多规则说明请参考[重试规则说明](#重试规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：重试规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：重试规则的key由前缀`servicecomb.retry`和自定义场景名称组成，本示例设定场景名称为`retryScene`。流量匹配规则和重试规则的key的自定义场景名称需保持一致，才能对匹配的流量执行重试策略。

## 系统级流控
**系统级别的流控策略是指，在服务运行过程中，当系统的负载、CPU使用率、并发线程数、请求的平均响应时间或请求的每秒数量（qps）任何一个指标超过预设阈值时，将会启动流控机制，对请求流量进行限制。**

使用系统级流控能力，需要在`${sermant-path}/agent/pluginPackage/flowcontrol/config/config.yaml`配置文件中开启系统级流控开关：
```yaml
  flow.control.plugin:
    enable-system-rule: true 
  ```
> 说明：${sermant-path}为sermant包路径。

执行系统规则策略需要通过配置中心下发流量匹配规则和限流规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发系统级流控规则：** 下发系统级流控规则对匹配的流量执行系统级流控策略。

### 示例 

现有如下场景：在名称为flowcontrol的微服务中，对api访问路径为/system的流量，当系统负载超过5，或cpu使用率超过0.6，或qps超过1000，或请求响应时间小于100ms，或并发线程数大于200时，即触发限流，返回对应异常信息。
#### 下发流量匹配规则
为实现上述系统规则场景，首先下发流量匹配规则来匹配需要执行系统规则策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.matchGroup.systemScene
* **content：**
```yaml
  # 精确匹配api访问路径为/system的流量
  matches:          
  - apiPath:          
      exact: /system     
  ```
流量匹配的更多规则说明请参考[流量匹配规则说明](#流量匹配规则说明)，
动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`systemScene`。流量匹配规则和系统规则的key的自定义场景名称需保持一致，才能对匹配的流量执行系统规则策略。
#### 下发系统级流控规则
下发流量匹配规则后，对匹配的流量执行系统规则策略还需要下发系统规则。根据动态配置中心的配置模型，系统规则由group、key和content三部分组成，group用来约束系统规则生效的微服务，key用来约束系统规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的系统规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.system.systemScene
* **content：**
```yaml
  # 当系统负载超过5，或cpu使用率超过0.6，或qps超过1000，或请求响应时间小于100ms，或并发线程数大于200时，即触发限流，返回异常信息
  systemLoad: 5
  cpuUsage: 0.6
  qps: 1000
  aveRt: 100
  threadNum: 200
  ```
系统级流控配置的更多规则说明请参考[系统级流控规则说明](#系统级流控规则说明)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.
md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：系统规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：系统规则的key由前缀`servicecomb.system`和自定义场景名称组成，本示例设定场景名称为`systemScene`。流量匹配规则和系统规则的key的自定义场景名称需保持一致，才能对匹配的流量执行系统规则策略。
### 系统自适应
**系统自适应指在服务运行时，根据系统当前负载状态，以及过去一段时间内系统数据，对请求进行自适应流控。**

使用系统自适应规则，需要在`${sermant-path}/agent/pluginPackage/flowcontrol/config/config.yaml`配置文件中开启系统规则开关和系统自适应开关，并下发[系统级流控规则](#下发系统级流控规则)。根据上述下发的系统级流控规则，系统自适应的规则为当系统负载大于5时，若当前并发线程数大于系统容量（系统容量由qps * minRt计算得出），则触发限流：
```yaml
  flow.control.plugin:
    enable-system-rule: true 
    enable-system-adaptive: true
  ```
> 说明1：${sermant-path}为sermant包路径。
## 多流控能力配置
**上述文档介绍了如何针对单个流控能力进行配置，本节介绍对于匹配的流量如何执行多个流控策略的配置。**

执行多个流控策略需要通过配置中心下发流量匹配规则和流控规则，主要分为两步：

**下发流量匹配规则：** 下发流量匹配规则匹配满足要求的流量。

**下发流控规则：** 下发多个流控规则对匹配的流量执行流控规则策略。

### 示例

现有如下场景：在名称为flowcontrol的微服务中，对api访问路径为/mutliCapability的流量，若1秒内超过2个请求，则触发限流能力，或者访问接口时，当请求抛出500异常时进行重试，直到重试成功或者达到最大重试次数。

#### 下发流量匹配规则
为实现上述流控策略场景，首先下发流量匹配规则来匹配需要执行流控策略的流量。根据动态配置中心的配置模型，流量匹配规则由group、key和content组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.matchGroup.mutliCapabilityScene
* **content：**
```yaml
  # 精确匹配api访问路径为/mutliCapability的流量
  matches:          
  - apiPath:          
      exact: /mutliCapability     
  ```
流量匹配的更多配置规则请参考[流量匹配配置项](#流量匹配配置项)，
动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`mutliCapabilityScene`。流量匹配规则和多个流控规则的key的自定义场景名称需保持一致，才能对匹配的流量执行多个流控策略。
#### 下发限流规则
下发流量匹配规则后，对匹配的流量执行限流策略还需要下发限流规则。根据动态配置中心的配置模型，限流规则由group、key和content三部分组成，group用来约束限流规则生效的微服务，key用来约束限流规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的限流规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.rateLimiting.mutliCapabilityScene
* **content：**
```yaml
  # 1秒内超过2个请求，则触发限流能力
  limitRefreshPeriod: 1000
  rate: 2    
  ```
  限流配置的更多配置规则请参考[限流策略配置项](#限流策略配置项)一节，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：限流规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：限流规则的key由前缀`servicecomb.rateLimiting`和自定义场景名称组成，本示例设定场景名称为`mutliCapabilityScene`。流量匹配规则和限流规则的key的自定义场景名称需保持一致，才能对匹配的流量执行限流策略。
#### 下发重试规则
下发流量匹配规则后，对匹配的流量执行重试策略还需要下发重试规则。根据动态配置中心的配置模型，重试规则由group、key和content三部分组成，group用来约束重试规则生效的微服务，key用来约束重试规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的重试规则，其内容如下所示：
* **group：** service=flowcontrol
* **key：** servicecomb.retry.mutliCapabilityScene
* **content：**
```yaml
  # 访问接口时，当请求抛出500异常时进行重试，直到重试成功或者达到最大重试次数
  waitDuration: 2000
  retryStrategy: FixedInterval
  maxAttempts: 2
  retryOnResponseStatus:
    - 500
  ```
重试配置的更多配置规则请参考[重试策略配置项](#重试策略配置项)，动态配置的配置模型请参考[动态配置中心配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)。如何使用不同的动态配置中心请参考：[基于-zookeeper-的配置模型实现](../user-guide/configuration-center.md#基于-zookeeper-的配置模型实现)，[基于-nacos-的配置模型实现](../user-guide/configuration-center.md#基于-nacos-的配置模型实现)，[基于-servicecomb-kie-的配置模型实现](../user-guide/configuration-center.md#基于-servicecomb-kie-的配置模型实现)。
> 说明1：重试规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，由微服务配置文件的`dubbo.application.name`、`spring.applicaton.name`或`application`确定，优先级`dubbo.application.name` > `spring.applicaton.name` > `application`，本示例设定微服务名称为flowcontrol。

> 说明2：重试规则的key由前缀`servicecomb.retry`和自定义场景名称组成，本示例设定场景名称为`mutliCapabilityScene`。流量匹配规则和重试规则的key的自定义场景名称需保持一致，才能对匹配的流量执行重试策略。
## 详细规则说明
### 流量匹配规则说明
流量匹配是使用流控能力的前提配置，用于给不同的流控能力匹配相应的流量。
流量匹配规则的详细说明如下所示：
 ```yaml
  # 匹配器集合，可配置多个
  matches:
  # 匹配的api路径， 支持各种比较方式，相等(exact)、包含(contains)等            
  - apiPath:
      # 具体匹配路径          
      exact: /degrade 
    # 请求头
    headers:          
      key:
        # 请求头值，此处为key=value
        exact: value  
    method:
    # 支持方法类型           
    - GET
    # 可选，自定义配置名
    name: degrade     
  ```
该示例流量匹配规则用于匹配api路径为/degrade，请求头包含exact=value，请求方法类型为get的流量。

**流量标记请求路径（apiPath）规则说明**

  流量标记的请求路径会因不同的请求协议配置而存在差异，当前主要为Http（Spring）与Rpc（Dubbo）协议，下面分别说明两种请求协议的规则配置方式：

  - Http协议

    该协议依据请求路径进行匹配，例如请求路径为localhost:8080/test/flow，则实际拿到的路径为`/test/flow`，因此若需设置匹配规则，需依据该路径进行配置。

    值得注意的是，如果用户配置了contextPath，则需要加上contextPath前缀才可生效，即流量标记中请求路径为`${contextPath}/test/flow`。

  - Rpc协议（Dubbo）

    该协议调用需要基于接口+方法，例如请求的接口为com.demo.test，其方法为flow， 则对应的请求路径为`com.demo.test.flow`，特别的，如果用户有配置接口的版本，例如指定的version为1.0.0， 则请求路径为`com.demo.test:1.0.0.flow`。同时需要配置请求方法为`POST`，RPC协议仅支持POST类型。

### 限流规则说明
| 规则项             | 说明                                                         | 默认值 | 是否必须 |
  | ------------------ | ------------------------------------------------------------ | ---- | ---- |
  | limitRefreshPeriod | 单位统计时间，单位毫秒，若需配置秒则可增加单位`S`， 例如`10S` | 1000ms | 否 |
  | rate               | 单位统计时间所能通过的**请求个数**                           | 1000 | 否 |
### 熔断规则说明
| 规则项                     | 说明                                                          | 默认值 | 是否必须 |
  | ------------------------- | ------------------------------------------------------------ | ---- | ---- |
  | failureRateThreshold      | 熔断所需达到的错误率                                             | 50   | 否 |
  | minimumNumberOfCalls      | 滑动窗口内的最小请求数， 超过最小请求数才开始判断熔断条件               | 100  | 否 |
  | name                      | 配置项名称，可选参数                                             | null | 否 |
  | slidingWindowSize         | 滑动统计窗口大小，支持毫秒与秒，例如`1000`为1000毫秒，`10S`代表10秒    | 100ms | 否 |
  | slidingWindowType         | 滑动窗口类型，目前支持`time`与`count`两种类型，前者基于时间窗口统计，后者基于请求次数 | time | 否 | 
  | slowCallDurationThreshold | 慢请求阈值，单位同滑动窗口配置                                     | 60s | 否 |
  | slowCallRateThreshold     | 慢请求占比，当慢调用请求数达到该比例触发通断                          | 100 | 否 |
  | waitDurationInOpenState   | 熔断后恢复时间                                                  | 60s | 否 |
### 隔离规则说明
| 规则项             | 说明                                                         | 默认值 | 是否必须 |
  | ------------------ | ------------------------------------------------------------ | ---- | ---- |
  | maxConcurrentCalls | 最大并发数                                                   | 1000 | 否 |
  | maxWaitDuration    | 最大等待时间，若线程超过`maxConcurrentCalls`，会尝试等待，若超出等待时间还未获取资源，则抛出隔离仓异常 | 0 | 否 |
  | name               | 可选，配置名称                                               | null | 否 |
### 错误注入规则说明
| 规则项       | 说明                                                         | 默认值 | 是否必须 |
  | ------------ | ------------------------------------------------------------ | ---- | ---- |
  | type         | 错误注入类型，目前支持abort(请求直接返回)与delay（请求延时） | delay | 否 |
  | percentage   | 错误注入触发概率                                             | -1 | 是 |
  | fallbackType | 请求调用返回类型，仅`type=abort`生效。当前支持两种`ReturnNull`:直接返回空内容，状态码200；`ThrowException`: 按照指定错误码返回，关联配置`errorCode` | ThrowException | 否 |
  | errorCode    | 指定错误码返回，默认500，仅在`type=abort`且`fallbackType=ThrowException`生效 | 500 | 否 |
  | forceClosed  | 是否强制关闭错误注入能力，当为true时，错误注入将不会生效。默认false | false | 否 |

### 重试规则说明
| 规则项                | 说明                                                         | 默认值 | 是否必须 |
  | --------------------- | ------------------------------------------------------------ | ---- | ---- |
  | waitDuration          | 重试等待时间，默认毫秒；支持秒单位，例如2S                   | 10ms | 否 |
  | retryStrategy         | 重试策略，当前支持两种重试策略：固定时间间隔（FixedInterval）， 指数增长间隔(RandomBackoff) | FixedInterval | 否 |
  | maxAttempts           | 最大重试次数                                                 | 3 | 否 |
  | retryOnResponseStatus | HTTP状态码，当前仅支持HTTP请求；针对dubbo请求，可通过配置异常类型确定是否需要重试，默认为RpcException | null | 否 |

### 系统级流控规则说明  

  | 规则项       | 说明                                                         | 默认值 | 是否必须 |
  | ----------  | ------------------------------------------------------------ | ---- | ---- |
  | systemLoad  | 系统负载阈值，仅支持linux | Double.MAX_VALUE | 否 |
  | cpuUsage    | 系统cpu使用率阈值 | 1.0 | 否 |
  | qps         | 入口流量的qps阈值 | Double.MAX_VALUE | 否 |
  | aveRt       | 入口流量的平均响应时间阈值，单位ms | Long.MAX_VALUE | 否 |
  | threadNum   | 入口流量的并发线程数阈值 | Long.MAX_VALUE | 否 |

### 基于配置文件设置流控规则

若应用未采用配置中心的方式配置流控规则，也可采用配置文件的方式使用流控能力。

流控插件在应用启动时，会尝试从SpringBoot框架加载的配置源读取流控规则，用户需要在启动之前进行配置。如下为流控规则的配置示例，示例配置直接基于`application.yml`文件进行配置：

```yaml
servicecomb:                            
  matchGroup:            
    # 重试场景下的流量匹配规则
    demo-retry:                         
      matches:                          
        - apiPath:                      
            prefix: "/retry"            
          serviceName: rest-provider    
          method:                       
          - GET
    # 限流场景下的流量匹配规则                        
    demo-rateLimiting:                  
      matches:
        - apiPath:
            exact: "/flow"
  rateLimiting:                         
    # 限流场景下的流控规则
    demo-rateLimiting:
      rate: 1
  retry:                                
    # 重试场景下的流控规则
    demo-retry: |
      maxAttempts: 3
      retryOnResponseStatus:
      - 500
```

## 支持版本与限制

### 支持版本

| 框架类型 | 版本支持 |
| --- | --- |
| SpringBoot | 1.2.x - 2.6.x |
| SpringWebMvc | 4.1.3.RELEASE - 5.3.x |
| Dubbo | 2.6.x-2.7.x |

### 限制

- 系统规则与系统自适应规则中`systemLoad`配置仅限于**Linux**。
- 上述[基于配置文件设置配置](#基于配置文件设置流控规则) 仅限于**Springboot**应用。

## 操作和结果验证
下面我们通过限流场景开始使用流控插件，通过简单的几个步骤，就可以开始对微服务执行限流。本次示例使用ZooKeeper作为动态配置中心。
### 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-dynamic-demo-2.0.0.tar.gz)流控Demo二进制产物压缩包
- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz)Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://zookeeper.apache.org/releases#download)并启动ZooKeeper

### 限流示例
#### 步骤一：启动流控Demo

解压准备工作下载的流控Demo获得可执行JAR包，即spring-provider.jar文件，参考如下命令启动Demo

```shell
#linux mac
java -javaagent:${sermant-path}/agent/sermant-agent.jar -Dspring.application.name=spring-flow-provider -jar spring-provider.jar
```

> **说明：** ${sermant-path}为Sermant包路径。

#### 步骤二：发布流量匹配规则

参考[动态配置中心使用手册配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)，流量匹配规则由group、key和content三部分组成，group用来约束流量匹配规则生效的微服务，key用来约束流量匹配规则生效的场景，需和限流规则的场景名称保持一致，content为具体的流量匹配规则，其内容如下所示：
* **group：** service=spring-flow-provider
* **key：** servicecomb.matchGroup.flowScene
* **content：**
```yaml
  # 精确匹配api路径为/flow并且请求方法类型为GET的流量
  matches:
  - apiPath:
      exact: /flow
    method:
    - GET    
  ```
> 说明1：流量匹配规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，本示例所使用Demo的微服务名称为spring-flow-provider。

> 说明2：流量匹配规则的key由前缀`servicecomb.matchGroup`和自定义场景名称组成，本示例设定场景名称为`flowScene`。流量匹配规则和限流规则的key的自定义场景名称需保持一致，才能对匹配的流量执行限流策略。

利用ZooKeeper提供的命令行工具下发流量匹配规则：

1. 在`${zookeeper-path}/bin/`目录执行以下命令创建配置模型的group节点`/service=spring-flow-provider`：

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider
```

2. 创建完成group节点后，在`${zookeeper-path}/bin/`目录执行以下命令创建配置模型的key节点`/service=spring-flow-provider/servicecomb.matchGroup.flowScene`，并设置节点的content：

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider/servicecomb.matchGroup.flowScene "matches:
- apiPath:
    exact: /flow
  method:
  - GET"
```
> 说明：${zookeeper-path}为ZooKeeper的安装目录。
#### 步骤三：发布限流规则
参考[动态配置中心使用手册配置模型](../user-guide/configuration-center.md#sermant动态配置中心模型)，限流规则由group、key和content三部分组成，group用来约束限流规则生效的微服务，key用来约束限流规则生效的场景，需和流量匹配规则的场景名称保持一致，content为具体的限流规则，其内容如下所示：
* **group：** service=spring-flow-provider
* **key：** servicecomb.rateLimiting.flowScene
* **content：**
```yaml
  # 限制两秒内不能访问超过四次
  limitRefreshPeriod: 2S
  rate: 4
  ```
> 说明1：限流规则的group由`service=`和`${service.name}`组成，其中`${service.name}`为微服务的名称，本示例所使用Demo的微服务名称为spring-flow-provider。

> 说明2：限流规则的key由前缀`servicecomb.rateLimiting`和自定义场景名称组成，本示例设定场景名称为`flowScene`。流量匹配规则和限流规则的key的自定义场景名称需保持一致，才能对匹配的流量执行限流策略。

利用ZooKeeper提供的命令行工具下发限流规则：
1. 步骤二已经创建了group节点，在`${zookeeper-path}/bin/`目录执行以下命令创建配置模型的key节点`/service=spring-flow-provider/servicecomb.rateLimiting.flowScene`并设置节点的content：

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider/servicecomb.rateLimiting.flowScene "limitRefreshPeriod: 2S
rate: 4"
```

> 说明：${zookeeper-path}为ZooKeeper的安装目录。

### 验证

通过浏览器多次请求`localhost:8003/flow`若在2秒内请求数超过4个时返回`rate limited`，则触发流控成功，效果如下：
<MyImage src="/docs-img/flowcontrol-verity.jpg"/>