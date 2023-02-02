# 流控

本文介绍如何使用[流控插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-flowcontrol)

## 功能介绍

流控插件基于[resilience4j](https://github.com/resilience4j) 框架，以"流量"切入点，实现"无侵入式"流量控制；当前支持**限流**、**熔断**、**隔离仓**、**错误注入**与**重试**、**熔断指标采集**、**系统规则**、**系统自适应**流控能力，并且支持配置中心动态配置规则，实时生效。

- **限流**：对指定接口限制1S秒内通过的QPS，当1S内流量超过指定阈值，将触发流控，限制请求流量，在客户端和服务端都可生效。
- **熔断**：对指定接口配置熔断策略，可从单位统计时间窗口内的错误率或者慢请求率进行统计，当请求错误率或者慢请求率达到指定比例阈值，即触发熔断，在时间窗口重置前，隔离所有请求，在客户端和服务端都可生效。
- **隔离仓**：对指定接口设置允许的最大并发量，当超过最大并发量时，对并发流量进行排队等待控制，等待超过最大等待时间则拒绝调用，避免瞬时并发流量过大导致服务崩溃，在客户端和服务端都可生效。
- **重试**：当服务遇到非致命的错误时，可以通过重试的方式避免服务的最终失败。
- **错误注入**：指在服务运行时，给指定服务配置错误注入策略，在客户端访问目标服务前，以指定策略模式返回。该策略多用于减少目标服务的访问负载，可作为降级的一种措施。
- **熔断指标采集**：当服务配置了熔断策略后，插件会异步采集熔断的相关信息，并通过[监控插件](./monitor.md)进行指标上报。
- **系统规则**：在服务运行时，若系统负载，CPU使用率，并发线程数，请求平均响应时间，请求qps任意指标超出阈值，将触发流控，限制请求流量。
- **系统自适应**：在服务运行时，根据系统当前负载状态，以及过去一段时间内系统数据，对请求进行自适应流控。

## 参数配置

### Sermant-agent配置

流控插件依赖动态配置中心，需要在Sermant-agent中配置动态配置中心的地址（`dynamic.config.serverAddress`），动态配置中心的类型（`dynamic.config.dynamicConfigType`）,具体参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

### 插件配置

流控插件需打开是否开启ServiceComb适配（`flow.control.plugin.useCseRule`），是否开启指标监控（`flow.control.plugin.enable-start-monitor`）等开关，可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/flowcontrol/config/config.yaml`找到插件的配置文件，配置如下所示：

```yaml
flow.control.plugin:
  useCseRule: false # 是否开启ServiceComb适配
  enable-start-monitor: false # 是否启动指标监控
  enable-system-adaptive: false # 是否开启系统自适应流控,开启此开关需enable-system-rule配置项也开启
  enable-system-rule: false # 是否开启系统规则流控
```


| 参数键       | 说明                     | 默认值 | 是否必须 |
| :----------  | ----------------------- | ----- | ------ |
| useCseRule  | 是否开启ServiceComb适配; <br> **true**:插件根据应用配置,服务配置,自定义标签订阅配置 <br> **false**:插件根据实例服务名进行配置订阅  | true  | 是     |
| enable-start-monitor | 是否开启指标监控; **true**:熔断指标数据通过监控插件上传至Prometheus，详情查看[监控插件](./monitor.md) | false | 否 |
| enable-system-adaptive | 是否开启系统自适应流控; <br> **true**:根据系统负载对请求流量进行自适应流控 | false | 否 |
| enable-system-rule | 是否开启系统规则流控; <br> **true**:根据流控策略中的系统参数阈值进行流控 | false | 否 |

> useCseRule说明： Sermant当前支持zookeeper和ServiceComb-kie配置中心，默认采用zookeeper配置中心，若用户使用ServiceComb-kie，则需要设置**useCseRule**配置为**true**

## 详细治理规则

流控配置主要基于`group`进行配置订阅，该`group`由多个键值对组成。下面详细说明`group`和键值对`key`和`value`的设置规则。

> 关于`group` `key` 的介绍以及配置中心的设置参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)

#### 根据采用配置中心的不同，`group`的值将会有所区别,以下介绍`group`的设置规则：

- 采用`zookeeper`

  此时插件将根据宿主应用的服务名进行订阅, 即应用配置的`spring.applicaton.name`, 插件订阅配置的group为`service=${spring.applicaton.name}`

- 采用`KIE`

  此时插件将根据**应用配置**，**服务配置**以及**自定义配置**三项数据配置**同时**订阅， 而这三类配置可参考`${path}/sermant-agent-x.x.x/agent/config/config.properties`, 相关配置如下：

    ```properties
    # 服务app名称
    service.meta.application=default
    # 服务版本
    service.meta.version=1.0.0
    # serviceComb 命名空间
    service.meta.project=default
    # 环境
    service.meta.environment=development
    # 自定义标签，按需配置，用于后续的配置订阅
    service.meta.customLabel=public
    service.meta.customLabelValue=default
    ```

  应用配置，服务配置，自定义配置说明参考[CSE配置中心概述](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html)
  - 应用配置：由`service.meta.application`与`service.meta.environment`组成， 对应的`group`为`app=default&environment=development`
  - 服务配置：由`service.meta.application`、`service.meta.environment`以及服务名组成，此处服务即`spring.application.name`, 对应的`group`为`app=default&environment=development&service=DynamicConfigDemo`
  - 自定义配置：由`service.meta.customLabel`与`service.meta.customLabelValue`组成， 对应的`group`为`public=default`

#### 流控插件根据配置键`key`的前缀进行规则匹配，以下介绍配置键`key`的规则：

流量治理采用流量标记+流控规则的方式对指定的流量进行流控，所谓流量标记，通俗讲为请求信息，例如接口路径、接口方法类型、请求头以及下游服务名。

流控规则是否生效取决于流量标记，当流量标记与请求相匹配，流控规则才会生效。而如何将流量标记对应上具体规则，则取决于业务场景名，通常流量标记与流控规则配置均要配置指定前缀。

例如流量标记的键key需以`servicecomb.MatchGroup`为前缀, 而限流规则的键key需以`servicecomb.rateLimiting`为前缀，以一个具体的例子：

> 流量标记配置键key为：`servicecomb.MatchGroup.flow`
> 
> 限流规则配置键key为：`servicecomb.rateLimiting.flow`
> 
> 如上，`flow`即为业务场景名，仅当两者业务场景名称一致，当请求匹配上流量标记时，限流规则才会生效

#### 下面介绍流控规则配置键`key`对应值`value`的相关信息：

- **流量标记**

  **流量标记配置键前缀:** `servicecomb.MatchGroup`

  以`zookeeper`为例，当使用`zookeeper`配置中心设置流量标记规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.MatchGroup.${sceneName}`,节点内容为流量标记规则，如下述yaml内容。
  
  ```yaml
  matches:            # 匹配器集合，可配置多个
  - apiPath:          # 匹配的api路径， 支持各种比较方式，相等(exact)、包含(contains)等
      exact: /degrade # 具体匹配路径
    headers:          # 请求头
      key: 
        exact: value  # 请求头值，此处为key=value, 比较方式同apiPath
    method:           # 支持方法类型
    - GET
    name: degrade     # 可选，配置名
  ```

  **流量标记解释:**

  - 请求路径为`/degrade`且方法类型为`GET`, 同时满足要求请求头包含`key=value`即匹配成功

    详细配置项可参考[ServiceComb开发文档](http://servicecomb.gitee.io/servicecomb-java-chassis-doc/java-chassis/zh_CN/references-handlers/governance.html#_2) 流量标记部分

  **流量标记请求路径（apiPath）配置说明**

  流量标记的请求路径会因不同的请求协议配置而存在差异，当前主要为Http（Spring）与Rpc（Dubbo）协议，下面分别说明两种请求协议的配置方式：

  - Http协议

    该协议依据请求路径进行匹配，例如请求路径为localhost:8080/test/flow, 则实际拿到的路径为`/test/flow`，因此若需设置匹配规则，需依据该路径进行配置。

    值得注意的是，如果用户配置了contextPath, 则需要加上contextPath前缀才可生效，即流量标记中请求路径为`${contextPath}/test/flow`

  - Rpc协议（Dubbo）

    该协议调用需要基于接口+方法，例如请求的接口为com.demo.test, 其方法为flow， 则对应的请求路径为`com.demo.test.flow`, 特别的，如果用户有配置接口的版本，例如指定的version为1.0.0， 则请求路径为`com.demo.test:1.0.0.flow`。同时需要配置请求方法为`POST`, RPC协议仅支持POST类型。

- **限流**

  **限流规则配置键前缀:** `servicecomb.rateLimiting`

  **限流规则：**：
  
  | 配置项             | 说明                                                         | 默认值 | 是否必须 |
  | ------------------ | ------------------------------------------------------------ | ---- | ---- |
  | limitRefreshPeriod | 单位统计时间，单位毫秒, 若需配置秒则可增加单位`S`， 例如`10S` | 1000ms | 否 |
  | rate               | 单位统计时间所能通过的**请求个数**                           | 1000 | 否 |

  以zookeeper为例，当使用`zookeeper`配置中心设置限流规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.rateLimiting.${sceneName}`,节点内容为限流规则，如下述yaml内容：
  
  ```yaml
  imitRefreshPeriod: 1000
  rate: 2
  ```
  **上述限流规则解释：** 若1秒内超过2个请求，即触发流控效果

- **熔断**

  **熔断规则配置键前缀:** `servicecomb.circuitBreaker`

  **熔断规则：**
  
  | 配置项                     | 说明                                                          | 默认值 | 是否必须 |
  | ------------------------- | ------------------------------------------------------------ | ---- | ---- |
  | failureRateThreshold      | 熔断所需达到的错误率                                             | 50   | 否 |
  | minimumNumberOfCalls      | 滑动窗口内的最小请求数， 超过最小请求数才开始判断熔断条件               | 100  | 否 |
  | name                      | 配置项名称，可选参数                                             | null | 否 |
  | slidingWindowSize         | 滑动统计窗口大小，支持毫秒与秒，例如`1000`为1000毫秒, `10S`代表10秒    | 100ms | 否 |
  | slidingWindowType         | 滑动窗口类型，目前支持`time`与`count`两种类型，前者基于时间窗口统计，后者基于请求次数 | time | 否 | 
  | slowCallDurationThreshold | 慢请求阈值，单位同滑动窗口配置                                     | 60s | 否 |
  | slowCallRateThreshold     | 慢请求占比，当慢调用请求数达到该比例触发通断                          | 100 | 否 |
  | waitDurationInOpenState   | 熔断后恢复时间                                                  | 60s | 否 |

  以zookeeper为例，当使用`zookeeper`配置中心设置熔断规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.circuitBreaker.${sceneName}`,节点内容为熔断规则，如下述yaml内容：

  ```yaml
  failureRateThreshold: 90
  minimumNumberOfCalls: 3
  name: degrade
  slidingWindowSize: 10S
  slidingWindowType: time
  slowCallDurationThreshold: "1"
  slowCallRateThreshold: 80
  waitDurationInOpenState: 10s
  ```
  
  **上述熔断规则解释：** 10秒内，若流量标记的接口请求次数超过3次，且错误率超过90%或者慢请求占比超过80%则触发熔断

- **隔离**

  **隔离规则配置键前缀:**  `servicecomb.bulkhead`

  **隔离规则：**
  
  | 配置项             | 说明                                                         | 默认值 | 是否必须 |
  | ------------------ | ------------------------------------------------------------ | ---- | ---- |
  | maxConcurrentCalls | 最大并发数                                                   | 1000 | 否 |
  | maxWaitDuration    | 最大等待时间，若线程超过`maxConcurrentCalls`，会尝试等待，若超出等待时间还未获取资源，则抛出隔离仓异常 | 0 | 否 |
  | name               | 可选，配置名称                                               | null | 否 |

  以zookeeper为例，当使用`zookeeper`配置中心设置隔离规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.circuitBreaker.${sceneName}`,节点内容为隔离规则，如下述yaml内容：

  ```yaml
  maxConcurrentCalls: "5"
  maxWaitDuration: "10S"
  name: "隔离仓"
  ```
  
  **上述隔离规则解释：** 针对流量标记的接口, 若最大并发数超过5，且新的请求等待10S，还未获取资源，则触发隔离仓异常

- **重试**

  **重试规则配置键前缀:** `servicecomb.retry`

  **重试规则：**
  
  | 配置项                | 说明                                                         | 默认值 | 是否必须 |
  | --------------------- | ------------------------------------------------------------ | ---- | ---- |
  | waitDuration          | 重试等待时间，默认毫秒；支持秒单位，例如2S                   | 10ms | 否 |
  | retryStrategy         | 重试策略，当前支持两种重试策略：固定时间间隔（FixedInterval）， 指数增长间隔(RandomBackoff) | FixedInterval | 否 |
  | maxAttempts           | 最大重试次数                                                 | 3 | 否 |
  | retryOnResponseStatus | HTTP状态码，当前仅支持HTTP请求；针对dubbo请求，可通过配置异常类型确定是否需要重试，默认为RpcException | null | 否 |

  以zookeeper为例，当使用`zookeeper`配置中心设置重试规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.retry.${sceneName}`,节点内容为重试规则，如下述yaml内容：

  ```yaml
  waitDuration: "2000"
  retryStrategy: FixedInterval
  maxAttempts: 2
  retryOnResponseStatus:
    - 500
  ```
  
  **上述重试规则解释：** 针对流量标记的接口, 当请求抛出500异常时进行重试，直到重试成功或者达到最大重试次数

- **错误注入**

  **错误注入规则配置键前缀:** `servicecomb.faultInjection`

  **错误注入规则：**

  | 配置项       | 说明                                                         | 默认值 | 是否必须 |
  | ------------ | ------------------------------------------------------------ | ---- | ---- |
  | type         | 错误注入类型, 目前支持abort(请求直接返回)与delay（请求延时） | delay | 否 |
  | percentage   | 错误注入触发概率                                             | -1 | 是 |
  | fallbackType | 请求调用返回类型，仅`type=abort`生效。当前支持两种`ReturnNull`:直接返回空内容，状态码200；`ThrowException`: 按照指定错误码返回，关联配置`errorCode` | ThrowException | 否 |
  | errorCode    | 指定错误码返回, 默认500, 仅在`type=abort`且`fallbackType=ThrowException`生效 | 500 | 否 |
  | forceClosed  | 是否强制关闭错误注入能力, 当为true时，错误注入将不会生效。默认false | false | 否 |

  以zookeeper为例，当使用`zookeeper`配置中心设置错误注入规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.retry.${sceneName}`,节点内容为错误注入规则，如下述yaml内容：

  ```yaml
  type: abort
  percentage: 100
  fallbackType: ReturnNull
  forceClosed: false
  errorCode: 503
  ```
  
  **上述错误注入规则解释：** 当请求流量标记的接口时，100%将返回空

- **系统规则**

  **系统规则配置键前缀:** `servicecomb.system`

  | 配置项       | 说明                                                         | 默认值 | 是否必须 |
  | ----------  | ------------------------------------------------------------ | ---- | ---- |
  | systemLoad  | 系统负载阈值，仅支持linux | Double.MAX_VALUE | 否 |
  | cpuUsage    | 系统cpu使用率阈值 | 1.0 | 否 |
  | qps         | 入口流量的qps阈值 | Double.MAX_VALUE | 否 |
  | aveRt       | 入口流量的平均响应时间阈值，单位ms | Long.MAX_VALUE | 否 |
  | threadNum   | 入口流量的并发线程数阈值 | Long.MAX_VALUE | 否 |

  以zookeeper为例，当使用`zookeeper`配置中心设置系统规则时，结合上述`group`和`key`的说明，需要在`zookeeper`中创建节点`/service=${spring.applicaton.name}/servicecomb.system.${sceneName}`,节点内容为系统规则，如下述yaml内容：
  
  ```yaml
  systemLoad: 5
  cpuUsage: 0.6
  qps: 1000
  aveRt: 100
  threadNum: 200
  ```
  
  **上述系统规则解释：** 
    - 针对使用流控插件的应用示例来说，当系统负载超过5，或者cpu使用率超过0.6，或者qps超过1000，或者请求响应时间小鱼100ms，或者并发线程数大于200时，即触发限流，返回对应异常信息 
    - 若开启系统自适应开关，则当系统负载大于5时，若当前并发线程数大于系统容量（系统容量由qps * minRt计算得出），则触发限流。

### 基于配置文件设置规则

若应用未采用配置中心的方式配置流控规则，也可采用配置文件的方式使用流控能力。

流控插件在应用启动时，会尝试的从SpringBoot加载的配置源读取流控规则以及对应的流量标记，用户需要在启动之前进行配置。如下为配置示例, 示例配置直接基于`application.yml`进行配置

```yaml
servicecomb:                            # 流量标记前缀
  matchGroup:                           # 流量标记前缀
    demo-fault-null:                    # 错误注入场景
      matches:                          # 匹配器集合
        - apiPath:                      # 匹配的api路径
            exact: "/flow"              # 具体匹配路径
    demo-retry:                         # 重试场景
      matches:                          
        - apiPath:                      
            prefix: "/retry"            
          serviceName: rest-provider    
          method:                       # 支持方法类型
          - GET                         
    demo-rateLimiting:                  # 限流场景
      matches:
        - apiPath:
            exact: "/flow"
    demo-circuitBreaker-exception:      # 熔断场景
      matches:
        - apiPath:
            exact: "/exceptionBreaker"
    demo-bulkhead:                      # 隔离舱场景
      matches:
        - apiPath:
            exact: "/flowcontrol/bulkhead"
    demo-system:                        # 系统规则场景
      matched:
        - apiPath:
            prefix: /
  rateLimiting:                         # 限流规则
    demo-rateLimiting:
      rate: 1
  retry:                                # 重试规则
    demo-retry: |
      maxAttempts: 3
      retryOnResponseStatus:
      - 500
  circuitBreaker:                       # 熔断规则
    demo-circuitBreaker-exception: |
      failureRateThreshold: 44
      minimumNumberOfCalls: 2
      name: 熔断
      slidingWindowSize: 10000
      slidingWindowType: time
      waitDurationInOpenState: 5s
  bulkhead:                             # 隔离规则
    demo-bulkhead: |
      maxConcurrentCalls: 1
      maxWaitDuration: 10
  faultInjection:                       # 错误注入规则
    demo-fault-null: |
      type: abort
      percentage: 100
      fallbackType: ReturnNull
      forceClosed: false
  system:                               # 系统流控规则
    demo-system: |
      systemLoad: 0.6
      cpuUsage: 0.6
      qps: 100
      aveRt: 20
      threadNum: 100
```

### 基于Sermant动态配置中心发布规则

基于Sermant动态配置中心发布规则，可以参考[动态配置中心使用手册](../user-guide/configuration-center.md)

## 支持版本与限制

### 支持版本

| 框架类型 | 版本支持 |
| --- | --- |
| SpringBoot | 1.2.x - 2.6.x |
| SpringWebMvc | 4.1.3.RELEASE - 5.3.x |
| Dubbo | 2.6.x-2.7.x |

### 限制

- 系统规则与系统自适应规则中`systemLoad`配置仅限于**linux**
- 上述[基于配置文件设置配置](#基于配置文件设置配置) 仅限于**Springboot**应用

## 操作和结果验证

下面将演示如何使用流控插件，验证springboot应用采用zookeeper配置中心，设置限流策略场景。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/flowcontrol-demo/spring-cloud-demo/spring-provider) demo源码
- [下载](https://github.com/huaweicloud/Sermant/releases) 或编译Sermant包
- [下载](https://zookeeper.apache.org/releases#download) 并启动zookeeper

### 步骤一：编译打包demo应用

在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider`目录执行以下命令：

```shell
# windows,Linux,mac
mvn clean package
```

打包成功后，在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target`得到`spring-provider.jar`

> **说明**： path为demo应用下载所在路径

### 步骤二：修改插件配置

参考[插件配置](#插件配置) 修改`${path}/sermant-agent-x.x.x/agent/pluginPackage/flowcontrol/config/config.yaml`文件为以下内容：
```shell
flow.control.plugin:
  useCseRule: false # 是否开启ServiceComb适配
  enable-start-monitor: false # 是否启动指标监控
  enable-system-adaptive: false # 是否开启系统自适应流控
  enable-system-rule: false # 是否开启系统规则流控
```

> **说明**： path为sermant所在路径

### 步骤三：启动demo应用

参考如下命令启动demo应用

```shell
# windwos
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar

#linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar
```

> **说明:**
> 上述命令中的${path}需要替换为Sermant实际路径，
> x.x.x代表Sermant某个版本号。

### 步骤四：发布流量标记

参考使用[动态配置中心使用手册](../user-guide/configuration-center.md)，发布如下配置：

```json
{
  "value": "alias: scene\nmatches:\n- apiPath:\n    exact: /flow\n  headers: {}\n  method:\n  - GET\n  name: flow\n",
  "group": "service=spring-flow-provider",
  "key": "servicecomb.matchGroup.sceneFlow"
}
```

以zookeeper为例，利用zookeeper提供的命令行工具来发布流量标记策略和流控策略：

1. 在`${path}/bin/`目录执行以下命令创建节点`/service=spring-flow-provider`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider

# windows
zkCli.cmd -server localhost:2181 create /service=spring-flow-provider
```

> 说明：${path}为zookeeper的安装目录

2. 在`${path}/bin/`目录执行以下命令创建节点`/service=spring-flow-provider/servicecomb.matchGroup.sceneFlow`和数据`"alias: scene\nmatches:\n- apiPath:\n    exact: /flow\n  headers: {}\n  method:\n  - GET\n  name: flow\n"`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider/servicecomb.matchGroup.sceneFlow "alias: scene
matches:
- apiPath:
    exact: /flow
  headers: {}
  method:
  - GET
  name: flow"
  
# windwos
zkCli.cmd -server localhost:2181 create /service=spring-flow-provider/servicecomb.matchGroup.sceneFlow "alias: scene
matches:
- apiPath:
    exact: /flow
  headers: {}
  method:
  - GET
  name: flow"
```

> 说明：${path}为zookeeper的安装目录

3. 在`${path}/bin/`目录执行以下命令创建节点`/service=spring-flow-provider/servicecomb.rateLimiting.sceneFlow`和数据`"limitRefreshPeriod: \"2S\"\nname: flow\nrate: \"4\"\n"`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider/servicecomb.rateLimiting.sceneFlow "limitRefreshPeriod: 2S
name: flow
rate: 4"

#windows
zkCli.cmd -server localhost:2181 create /service=spring-flow-provider/servicecomb.rateLimiting.sceneFlow "limitRefreshPeriod: 2S
name: flow
rate: 4"
```

> 说明：${path}为zookeeper的安装目录

### 验证

通过curl工具多次请求`localhost:8003/flow`, 若在2秒内请求数超过4个时返回`rate limited`，则触发流控成功，效果如下：

<MyImage src="/docs-img/flowcontrol-verity.jpg"/>
