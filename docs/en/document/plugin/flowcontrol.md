# Flow Control

This article describes how to use [Flow Control Plugin](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-flowcontrol).

## Functions

The flow control plugin is based on the [resilience4j]((https://github.com/resilience4j)) framework and implements non-intrusive flow control based on the "traffic" entry point. Currently, **Traffic Limiting, Circuit Breaker, Bulkhead, Error Injection, Retry and Fusing index collection** are supported. In addition, rules can be dynamically configured in the configuration center and take effect in real time.

- **Traffic Limiting**：The number of QPS that pass through a specified interface within 1s is limited. When the traffic within 1s exceeds the specified threshold, flow control is triggered to limit the requested traffic.
- **Circuit Breaker**：Configure a circuit breaker policy for a specified interface to collect statistics on the error rate or slow request rate in a specified time window. When the error rate or slow request rate reaches a specified threshold, the circuit breaker is triggered. Before the time window is reset, all requests are isolated.
- **Bulkhead**：Controls concurrent traffic for a large number of concurrent traffic to prevent service breakdown caused by excessive instantaneous concurrent traffic.
- **Retry**：If a service encounters a non-fatal error, you can retry the service to prevent the service failure.
- **Error Injection**：An error injection policy is configured for a specified service when the service is running. Before the client accesses the target service, the error injection policy is used. This policy is mainly used to reduce the access load of the target service and can be used as a measure of downgrading the target service.
- **Fusing index collection**： During the service operation, collect the information related to the fuse, and report the indicators with the help of the [monitoring plugin](./monitor.md)
- **System Rule**：When the instance is running, if the system load, CPU, number of threads, average response time, and any index of qps exceed the preset value, flow control will be triggered to limit the request flow.
- **System Adaptive**：When the instance is running, the request is adaptively flow controlled according to the current load status of the system and the system data in the past period.

## Parameter configuration

### Configure Sermant-agent

To modify service information and dynamically configure the type and address of the center, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md).

### Configure the Flow Control Plugin

Modify the Configuration File`${javaagent path}/pluginPackage/flowcontrol/config/config.yaml`

```yaml
flow.control.plugin:
  useCseRule: false # Whether to enable ServiceComb adaptation
  enable-start-monitor: false # Whether to start indicator monitoring
  enable-system-adaptive: false # Whether the system adaptive flow control is enabled. Enabling this switch requires that the enable-system-rule configuration item also be enabled
  enable-system-rule: false # Whether to enable system rule flow control
```

| Key in Input Parameters       | Description                     | Default Value | Required |
| ----------  | ----------------------- | ----- | ------ |
| useCseRule  | If adaptation is enabled, the plugin subscribes to the configuration center based on the application configuration, service configuration, and customized tag configuration.If useCseRule is set to false, the flow control plugin configures subscription based on the service name of the current instance. For example, if spring.application.name is set to flowControlDemo, the flow control plugin receives configuration based on the service=flowControlDemo tag during actual subscription. | true  | true |
| enable-start-monitor | Indicator monitoring switch | false | false |
| enable-system-adaptive | Whether to turn on the system adaptive flow control switch. To turn on this switch, the **enable-system-rule** configuration item should also be turned on, set to true, and after the corresponding flow control strategy is issued, adaptive flow control will be performed on the request flow according to the system load status | false | false |
| enable-system-rule | Whether to turn on the system rule flow control switch, set it to true and issue the corresponding flow control policy, then the request flow will be controlled according to the system parameter threshold set in the policy | false | false |

## Detailed governance rules

Traffic governance uses traffic marking and flow control rules to control specified traffic. Traffic marking refers to request information, such as the interface path, interface method type, request header, and downstream service name. 

Whether a flow control rule takes effect depends on the traffic flag. A flow control rule takes effect only when the traffic flag matches the request. The mapping between traffic marks and specific rules depends on the service scenario name. Generally, a specified prefix must be configured for traffic marks and traffic control rules. 

Prefixes of flow marking and flow control rules are as follows:

| rule | prefix |
| -- | -- |
| traffic marks | servicecomb.matchGroup |
| traffic Limiting | servicecomb.rateLimiting |
| Circuit Breaker | servicecomb.circuitBreaker |
| Bulkhead | servicecomb.bulkhead |
| Retry | servicecomb.retry |
| Error Injection | servicecomb.faultInjection |
| System Rule | servicecomb.system |
| System Adaptive | servicecomb.system |

For example, the key of traffic marks must be prefixed with `servicecomb.matchGroup`. The traffic limiting rule is 
prefixed with `servicecomb.rateLimiting`. The following is an example:

> The traffic marking configuration key：`servicecomb.matchGroup.flow`
> 
> The key for configuring the traffic limiting rule：`servicecomb.rateLimiting.flow`
> 
> In the preceding information, `flow `is the service scenario name. The traffic limiting rule takes effect only when the two service scenario names are the same and the request matches a traffic flag.

The following describes the related configurations:

- **Traffic Marking**

  ```yaml
  matches:            # Matcher set. Multiple matchers can be configured.
  - apiPath:          # Matched API path. Various comparison modes are supported, such as exact and contain.
      exact: /degrade # Specific Matching Path
    headers:          # Request header
      key: 
        exact: value  # Request header value. The value is key=value. The comparison method is the same as that of apiPath.
    method:           # Supported Method Types
    - GET
    name: degrade     # Configuration name, which is optional.
  ```

  **what traffic marking above can match  :**

  - If the request path is `/degrade`, the method type is `GET`, and the request header contains `key=value`, the matching is successful.
  
  > For details about the configuration items, see the traffic marking section in the [ServiceComb development document](http://servicecomb.gitee.io/servicecomb-java-chassis-doc/java-chassis/zh_CN/references-handlers/governance.html#_2).

  **Traffic marking request path (apiPath) configuration description**

  The request path for traffic marking varies according to the request protocol configuration. Currently, HTTP (Spring) and RPC (Dubbo) protocols are used. The following describes how to configure the two request protocols:

  - **Http protocol**

    This protocol performs matching based on the request path. For example, if the request path is `localhost:8080/test/flow`, the actual path is `/test/flow`. Therefore, if you need to set a matching rule, you need to configure the matching rule based on the path.

    It should be noted that if the contextPath configured by the user is valid only after the contextPath prefix is added.

  - **Rpc protocol(Dubbo)**

    The protocol invoking needs to be based on an interface+method. For example, if the requested interface is `com.demo.test`, and the method is `flow`, a corresponding request path is `com.demo.test.flow`. Specially, if a user configures an interface version, for example, a specified version is `1.0.0`, The request path is `com.demo.test:1.0.0.flow`. In addition, set the request method to `POST`. The RPC protocol supports only POST.

- **Traffic Limiting**

  | Configuration      | Description                                                  | Default Value | Required |
  | ------------------ | ------------------------------------------------------------ | ---- | ---- |
  | limitRefreshPeriod | Unit of statistics time, in milliseconds. If you need to set this parameter, the unit can be set to `S`, for example, `10s`. | 1000ms | false |
  | rate               | Number of requests that can be processed in the unit of statistical time. | 1000 | false |

- **Circuit Breaker**

  | Configuration             | Description                                                  | Default Value | Required |
  | ------------------------- | ------------------------------------------------------------ | ---- | ---- |
  | failureRateThreshold      | Error rate required for fuse                                 | 50 | false |
  | minimumNumberOfCalls      | Minimum number of requests in the sliding window. The fuse condition is determined only when the minimum number of requests is exceeded. | 100 | false |
  | name                      | Specifies the name of a configuration item. This parameter is optional. | null | false |
  | slidingWindowSize         | Size of the sliding statistics window. The value can be milliseconds or seconds. For example, 1000 indicates 1000 milliseconds, and 10s indicates 10 seconds. | 100ms | false |
  | slidingWindowType         | Sliding window type. Currently, `time` and `count` are supported. The former is based on the time window and the latter is based on the number of requests. | time | false |
  | slowCallDurationThreshold | Slow request threshold. The unit is the same as that of the sliding window. | 60s | false |
  | slowCallRateThreshold     | Percentage of slow invoking requests. When the number of slow invoking requests reaches this percentage, connectivity is triggered. | 100 | false |
  | waitDurationInOpenState   | Recovery time after a circuit breaker. The default value is `60s`. | 60s | false |

- **Bulkhead**

  | Configuration      | Description                                                  | Default Value | Required |
  | ------------------ | ------------------------------------------------------------ | ---- | ---- |
  | maxConcurrentCalls | Maximum number of concurrent calls                           | 1000 | false |
  | maxWaitDuration    | Maximum waiting time. If the thread exceeds maxConcurrentCalls, the thread attempts to wait. If the thread does not obtain resources after the waiting time expires, an isolation warehouse exception is thrown. | 0 | false |
  | name               | name of configuration, which is optional.                    | null | false |

- **Retry**

  | Configuration         | Description                                                  | Default Value | Required |
  | --------------------- | ------------------------------------------------------------ | ---- | ---- |
  | waitDuration          | Retry wait time. The default value is milliseconds. The unit is second, for example, 2s. | 10ms | false |
  | retryStrategy         | Retry policy. Currently, two retry policies are supported: fixed interval (FixedInterval) and exponential increase interval (RandomBackoff). | FixedInterval | false |
  | maxAttempts           | Maximum number of retries                                    | 3 | false |
  | retryOnResponseStatus | HTTP status code. Currently, only HTTP requests are supported. For dubbo requests, you can configure the exception type to determine whether to retry. The default value is RpcException. | null | false |

- **Error Injection**

  | Configuration | Description                                                  | Default Value | Required |
  | ------------- | ------------------------------------------------------------ | ---- | ---- |
  | type          | Error injection type. Currently, `abort (request response)` and `delay (request delay)` are supported. | delay | false |
  | percentage    | Error Injection triggering probability                       | -1 | true |
  | fallbackType  | Return type of the request invoking. This parameter is valid only when `type is set to abort`. Currently, two types are supported, `ReturnNull`: empty content is directly returned and the status code is 200. `ThrowException`: The error code is returned based on the specified error code.` | ThrowException | false |
  | errorCode     | Specifies the returned error code. The default value is 500. This parameter is valid only `when type is abort and fallbackType is ThrowException`. | 500 | false |
  | forceClosed   | Indicates whether to forcibly disable the error injection capability. If this parameter is set to true, error injection does not take effect. The default value is false. | false | false |

- **System Rule**

  | Configuration | Configuration                                                          | Default Value | Required |
  | ----------    | ------------------------------------------------------------ | ---- | ---- | 
  | systemLoad    | System load threshold, only supports linux | Double.MAX_VALUE | false |
  | cpuUsage      | System cpu usage threshold | 1.0 | false |
  | qps           | Qps threshold of inlet flow | Double.MAX_VALUE | false |
  | aveRt         | Average response time threshold of inlet flow, Unit: ms | Long.MAX_VALUE | false |
  | threadNum     | Number of concurrent threads for the inlet traffic | Long.MAX_VALUE | false |

- **System Adaptive**

  | Configuration | Configuration                                                         | Default Value | Required |
  | ----------    | ------------------------------------------------------------ | ---- | ---- | 
  | systemLoad    | System load threshold, only supports linux | Double.MAX_VALUE | false |

### Configuring Flow Control Rules Based On The Configuration File

When an application is started, the flow control plugin attempts to read the flow control rules and corresponding traffic flags from the configuration source loaded by SpringBoot. You need to configure the flow control rules before starting the application. The following is a configuration example. The example configuration is based on the `application.yml` file.

```yaml
servicecomb:
  matchGroup:
    demo-fault-null: |
      matches:
        - apiPath:
            exact: "/flow"
    demo-retry: |
      matches:
        - apiPath:
            prefix: "/retry"
          serviceName: rest-provider
          method:
          - GET
    demo-rateLimiting: |
      matches:
        - apiPath:
            exact: "/flow"
    demo-circuitBreaker-exception: |
      matches:
        - apiPath:
            exact: "/exceptionBreaker"
    demo-bulkhead: |
      matches:
        - apiPath:
            exact: "/flowcontrol/bulkhead"
    demo-system: |
      matched:
        - apiPath:
            prefix: /
  rateLimiting:
    demo-rateLimiting: |
      rate: 1
  retry:
    demo-retry: |
      maxAttempts: 3
      retryOnResponseStatus:
      - 500
  circuitBreaker:
    demo-circuitBreaker-exception: |
      failureRateThreshold: 44
      minimumNumberOfCalls: 2
      name: circuit breaker
      slidingWindowSize: 10000
      slidingWindowType: time
      waitDurationInOpenState: 5s
  bulkhead:
    demo-bulkhead: |
      maxConcurrentCalls: 1
      maxWaitDuration: 10
  faultInjection:
    demo-fault-null: |
      type: abort
      percentage: 100
      fallbackType: ReturnNull
      forceClosed: false
  system:
    demo-system: |
      systemLoad: 0.6
      cpuUsage: 0.6
      qps: 100
      aveRt: 20
      threadNum: 100
```

### Publishing rules of dynamic configuration capability based on Sermant

For details, refer to [Dynamic Configuration User Manual](../user-guide/configuration-center.md)

## Supported Versions and Limitations

### Version Required

| Framework | Version |
| --- | --- |
| SpringBoot | 1.2.x - 2.6.x |
| SpringWebMvc | 4.1.3.RELEASE - 5.3.x |
| Dubbo | 2.6.x-2.7.x |

### Limitations

- The `systemLoad` configuration in system rules and system adaptive rules is only limited to **linux**
- The above [Configuring Flow Control Rules Based On The Configuration File](#Configuring Flow Control Rules Based On The Configuration File) is only applicable to **Springboot** applications

## Operation and result validation

The following will demonstrate how to use the flow control plugin.

### Preparation

- [Download](https://github.com/sermant-io/Sermant-examples/tree/main/flowcontrol-demo/spring-cloud-demo/spring-provider) Demo source code
- [Download](https://github.com/sermant-io/Sermant/releases) or build Sermant package
- [Download](https://zookeeper.apache.org/releases#download) and start zookeeper
- [Download](https://github.com/vran-dev/PrettyZoo/releases) PrettyZoo  and connect zookeeper

### Step 1: Compile and package the demo application

In the `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider` directory execute the following command：

```shell
# windows,Linux,mac
mvn clean package
```

After successful packaging， generate `spring-provider.jar` int the `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target` directory

> **Explain**： Path is the path where the demo application is downloaded

### Step 2: Modify plug-in configuration

Refer to [Plug-in Configuration](#Plugin Configurations) for modification`${path}/sermant-agent-x.x.x/agent/pluginPackage/dynamic-config/config/config.yaml`：
```shell
flow.control.plugin:
  useCseRule: false 
  enable-start-monitor: false 
  enable-system-adaptive: false 
  enable-system-rule: false 
```

### Step 3: Start the demo application

Start the demo application with the following command

```shell
# windwos
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar

#linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar
```

> **Explain**：
> The ${path} in the above command needs to be replaced with the actual installation path of Sermant。
> x.x.x represents a certain version number of Sermant。

### Step 4: Publish traffic tags

Refer to [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md)

```json
{
  "content": "alias: scene\nmatches:\n- apiPath:\n    exact: /flow\n  headers: {}\n  method:\n  - GET\n  name: flow\n",
  "group": "service=spring-flow-provider",
  "key": "servicecomb.matchGroup.sceneFlow"
}
```

Take Zookeeper as an example, use PrettyZoo tool to publish traffic marking strategy and flow control strategy:

1. create node `/service=spring-flow-provider`

<MyImage src="/docs-img/flowcontrol-create-node-1.jpg"/>

2. create node `/service=spring-flow-provider/servicecomb.matchGroup.sceneFlow` and data `"alias: scene\nmatches:\n- apiPath:\n    exact: /flow\n  headers: {}\n  method:\n  - GET\n  name: flow\n"`

<MyImage src="/docs-img/flowcontrol-create-node-2.jpg"/>

3. create node `/service=spring-flow-provider/servicecomb.rateLimiting.sceneFlow` and data `"limitRefreshPeriod: \"2S\"\nname: flow\nrate: \"4\"\n"`

<MyImage src="/docs-img/flowcontrol-create-node-3.jpg"/>

### Verify Result

Request `localhost:8003/flow` for multiple times. If `rate limited` is returned when the number of requests exceeds 4 within 2 seconds, flow control is triggered successfully.

<MyImage src="/docs-img/flowcontrol-verity.jpg"/>
