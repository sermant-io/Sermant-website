# Outlier instance removal

This article introduces how to use the [Outlier instance removal plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-removal)。

## Function Introduction

The outlier instance removal plugin detects the availability of application instances in a non-invasive manner, and performs removal operations on abnormal application instances to ensure service stability. The outlier instance removal plugin will retest the availability of the removed instance after a period of time. If the instance returns to normal, it will not be removed again.

## Parameter configuration

### Plugin Configuration

The outlier instance removal plugin requires configuration of the outlier instance removal plugin switch (`remove.config.enableRemoval`), instance call information expiration time (`remove.config.expireTime`), service call exceptions supported by the plugin (`remove.config.exceptions`), recovery time after instance removal (`remove.config.recoveryTime`), and outlier instance removal rules (`remove.config.rules`), The configuration file for the plugin can be found in `${path}/sermant-agent-x.x.x/agent/pluginPackage/service-removal/config/config.yaml`, as shown below:

```yaml
# Outlier instance removal plugin configuration
removal.config:
  expireTime: 60000         # The expiration time of instance call information. Unit: milliseconds
  exceptions:               # Service invocation exceptions supported by plugins
    - com.alibaba.dubbo.remoting.TimeoutException
    - org.apache.dubbo.remoting.TimeoutException
    - java.util.concurrent.TimeoutException
    - java.net.SocketTimeoutException
  enableRemoval: false      # Outlier instance removal switch
  recoveryTime: 30000       # Recovery time after instance removal
  rules:                    # Outlier instance removal rules, key: Service name (default rule applies to all services), scaleUpLimit: The upper limit of the outlier instance removal ratio. MinInstanceNum: The minimum number of instances.
    - { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }
```

|Parameter key | Description | Default value | Is it required|
| :----------------------------------- | :------------------------- | :------------| :------- |
|removal.config.expireTime | Instance call information expiration time | 60000 | Yes|
|removal.config.exceptions | Service call exceptions supported by plugins | com. alibaba. dubbo. remoting. TimeoutException<br>org. apache. dubo. remoting. TimeoutException<br>java. util. concurrent. TimeoutException<br>java. net. SocketTimeoutException | Yes|
|removal.config.enableRemoval | Switch for instance removal plugins | false | Yes|
|removal.config.recoveryTime | Recovery time after instance removal | 30000 | Yes|
|removal.config.rules | Outlier instance removal rules:<br>key: service name (valid for all services when default rule is set)<br>scaleUpLimit: upper limit of outlier instance removal ratio<br>minInstanceNum: minimum number of instances | {key: default rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6} | Yes|

## Detailed removal rules

The outlier instance extraction plugin also supports configuration publishing based on the dynamic configuration center. For configuration publishing, please refer to the [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#publish-configuration).

The key value is **servant.remove.config**. The group value is **app=${service.meta.application}&environment=${service.meta.environment}**, which is the application configuration. For the configuration of service.meta.application and service.meta.environment, please refer to the [Service Agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

> **Note:** Application configuration instructions refer to [CSE Configuration Center Overview](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html)。
The content value is the specific outlier instance extraction rule configuration. The configuration content is as follows:

```yaml
expireTime: 60000         # The expiration time of instance call information. Unit: milliseconds
exceptions:               # Service invocation exceptions supported by plugins
  - com.alibaba.dubbo.remoting.TimeoutException
  - org.apache.dubbo.remoting.TimeoutException
  - java.util.concurrent.TimeoutException
  - java.net.SocketTimeoutException
enableRemoval: false      # Outlier instance removal switch
recoveryTime: 30000       # Recovery time after instance removal
rules:                    # Outlier instance removal rules, key: Service name (default rule applies to all services), scaleUpLimit: The upper limit of the outlier instance removal ratio. MinInstanceNum: The minimum number of instances.
  - { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }
```

> **Note:** When adding a new configuration, please remove the comments, otherwise it may cause the addition to fail.
## Supported versions and limitations

Framework support:
- SpringBoot 1.5.10. Release and above
- Dubbo 2.6.x-2.7.x

## Operation and result verification

The following will demonstrate how to use the outlier instance extraction plugin to verify the scenario of using the Zookeeper configuration center to configure outlier extraction rules for SpringCloud applications.

### Preparation work
- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/removal-demo) Removal-demo source code
- [Download](https://github.com/huaweicloud/Sermant/releases) Or compile the Sermant package
- [Download](https://zookeeper.apache.org/releases#download) And start zookeeper

> **Note:** [Dynamic Configuration Center](../user-guide/configuration-center.md) will be used by default in this scenario. As it is not a core component of this scenario, it will not be further elaborated in this article.

### Step 1: Compile and package the demo application

Execute the following command in the `${path}/Sermant-examples/removal-demo` directory:

```shell
# windows,Linux,mac
mvn clean package
```
After successful packaging:
Get `rest-consumer-1.0.0.jar` in `${path}/Sermant-examples/removal-demo/rest-consumer/target`.
Get `rest-provider-1.0.0.jar` in `${path}/Sermant-examples/removal-demo/rest-provider/target`.

> **Note:** ${path} is the path where the demo application is downloaded.

### Step 2: Modify the configuration
- Modify the configuration of the outlier removal plugin, which can be found in `${path}/sermant-agent-x.x.x/agent/pluginPackage/service-removal/config/config.yaml`.
```yaml
removal.config:
  expireTime: 60000         # The expiration time of instance call information. Unit: milliseconds
  exceptions:               # Service invocation exceptions supported by plugins
    - com.alibaba.dubbo.remoting.TimeoutException
    - org.apache.dubbo.remoting.TimeoutException
    - java.util.concurrent.TimeoutException
    - java.net.SocketTimeoutException
  enableRemoval: true      # Outlier instance removal switch
  recoveryTime: 30000       # Recovery time after instance removal
  rules:                    # Outlier instance removal rules, key: Service name (default rule applies to all services), scaleUpLimit: The upper limit of the outlier instance removal ratio. MinInstanceNum: The minimum number of instances.
    - { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }
```
### Step 3: Start the application
- Start the demo application using the following command
(1) Launch Consumer

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dniws.loadbalancer.availabilityFilteringRule.filterCircuitTripped=false -jar rest-consumer-1.0.0.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dniws.loadbalancer.availabilityFilteringRule.filterCircuitTripped=false -jar rest-consumer-1.0.0.jar
```

(2) Start Producer

```shell
# windows,Linux,mac
java -jar rest-provider-1.0.0.jar
```

(3) Start the second producer

```shell
# windows,Linux,mac
java -Dtimeout=2000 -Dserver.port=8006 -jar rest-provider-1.0.0.jar
```
> **Note:** ${path} is the actual installation path of the server, and x.x.x represents a certain version number of the server.

### Verification
Always access through browser`http://localhost:8005/hello` At the beginning, there will be two situations: successful service request and abnormal request. After 30 seconds, the abnormal instance will be removed and the request will continue to be successful. Abnormal instances removed after 30 seconds will recover and request exceptions will reappear.

The query effect is shown below:

- Request successful rendering

<MyImage src="/docs-img/removal-req-success.png"/>

- Request failure rendering

<MyImage src="/docs-img/removal-req-fail.png"/>