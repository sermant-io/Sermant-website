# Graceful Online/Offline

This article introduces how to use the graceful log-in and log-in plugin. Currently, the elegant log-in and log-out function is currently integrated in the [registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry), Can be used independently.

## Functions

For any online application, operations such as release, expansion, reduction, and restart are unavoidable, and the following problems are often encountered in the process:

- For a newly launched instance, due to excessive traffic, the instance is accessed by a large amount of traffic when it is initialized, resulting in request blocking or even downtime, such as lazy loading scenarios.
- When the instance goes offline, due to the delayed refresh problem found in the registration, the upstream cannot be notified in time, resulting in traffic loss or errors.

In order to solve the above problems, graceful log-off came into being. For the above two problems, the plug-in provides **preheating** and **graceful log-off** capabilities to provide protection for the above-mentioned scenario problems.

**Warm up**, as the name suggests, uses a small amount of traffic to access the instance first, and gradually increases the traffic based on time to ensure that the newly started instance can successfully transition.

**Graceful offline**,  The plugin quickly updates the upstream cache based on the **real-time notification** + **cache update mechanism**. In addition, traffic statistics are collected to ensure that the instances that are about to go offline can process traffic as much as possible, preventing traffic loss to the greatest extent.

## Supported Versions and Limitations

Currently, the graceful online/offline capability **supports only SpringCloud applications**. Ensure that the SpringCloud version is `Edgware.SR2` or later.

Regitry Center Support：Zookeeper、Consul、Naocs、Eureka、Service Center

**Notice**：The graceful online/offline capability is developed based on the default load balancing capability of SpringCloud. If you have implemented the custom load balancing capability, this capability is no longer applicable.

## Parameter configuration

### Enabling Graceful Online and Offline

The graceful log-in plug-in needs to enable the graceful log-in switch (`grace.rule.enableSpring`), configure the startup delay time (`grace.rule.startDelayTime`), enable the warm-up (`grace.rule.enableWarmUp`), and other configurations. Find the configuration file of the plugin in `${path}/sermant-agent-x.x.x/agent/pluginPackge/service-registry/config/config.yaml`, the configuration is as follows:

```yaml
grace.rule:
  enableSpring: true # SpringCloud graceful online/offline switch
  startDelayTime: 0  # Graceful online/offline start delay, unit is seconds
  enableWarmUp: true # Whether to enable warm up
  warmUpTime: 120    # Warm up time unit is seconds
  enableGraceShutdown: true # Whether to enable graceful offline
  shutdownWaitTime: 30  # The maximum waiting time before traffic detection is disabled. Unit: s. This parameter takes effect only after enabledGraceShutdown is enabled.
  enableOfflineNotify: true # Whether to enable proactive offline notification.
  httpServerPort: 16688 # Enable the http server port for proactive offline notification.
  upstreamAddressMaxSize: 500 # Default size of the cache upstream address
  upstreamAddressExpiredTime: 60 # Expiration time of the cached upstream address. Unit: s.
```

| Parameter key                        | Description                                                             | Default value | Required |
| :----------------------------------- | :---------------------------------------------------------------------- | :------------| :------- |
| grace.rule.enableSpring              | springCloud elegant online and offline switch                           | false         | YES    |
| grace.rule.startDelayTime            | Graceful online and offline startup delay time, unit S                  | 0             | YES    |
| grace.rule.enableWarmUp              | Whether to enable preheating                                            | false         | YES    |
| grace.rule.enableGraceShutdown       | Whether to enable graceful offline                                      | false         | YES    |
| grace.rule.shutdownWaitTime          | The maximum waiting time for related traffic detection before shutdown, unit S. EnabledGraceShutdown needs to be enabled to take effect  | 30            | YES    |
| grace.rule.enableOfflineNotify       | Whether to open the offline active notification                         | false         | YES    |
| grace.rule.httpServerPort            | The httpServer port for active offline notification is enabled          | 16688          | YES    |
| grace.rule.upstreamAddressMaxSize    | The default size of cached upstream addresses                           | 5000           | YES    |
| grace.rule.upstreamAddressExpiredTime| Expiration time of cache upstream address, unit S                       | 60            | YES    |

## Supported Versions and Limitations

Framework support:

- **Only supports SpringCloud applications**, you need to ensure that the SpringCloud version is `Edgware.SR2` and above
- Registry support: Zookeeper, Consul, Naocs, Eureka, ServiceCenter

Limit:

- The ability to go online and offline gracefully is developed based on SpringCloud's default load balancing capability. If you implement a custom load balancing capability, this capability will no longer apply

## Operation and result validation

The following demonstrates how to use the graceful online and offline plugin.

### Preparation

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package
- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/grace-demo/spring-grace-nacos-demo) Demo source code
- [Download](https://github.com/alibaba/nacos/releases) nacos, and start
- [Download](https://zookeeper.apache.org/releases.html#download) zookeeper, and start

### Step 1: Compile and package the demo application

Execute the following command in the `${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo` directory:

```shell
mvn clean package
```

After successful packaging, you can get ` nacos-rest-data-2.2.0.RELEASE.jar in `${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-data/target` `package, get `nacos-rest-consumer-2.2.0.RELEASE.jar` at `${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-consumer/target` , get `nacos-rest-provider-2.2.0.RELEASE.jar` in `${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-provider/target`.

> Note: path is the path where the demo application is downloaded.

### Step 2: Deploy the application

We will deploy a consumer instance, 2 provider instances, and a data instance. as follows:

`consumer -----------> provider (two instances) -------------> data`

Among them, the consumer enables the graceful log-off capability, one provider instance enables the warm-up and graceful log-off capabilities, and the other provider instance only enables the graceful log-off capability.

> Note: The parameters of the graceful log-in and log-out plug-in are configured below through the -D parameter when the application starts.

(1) start data

```shell
   java -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -jar nacos-rest-data-2.2.0.RELEASE.jar
```

(2) Start the first provider instance (port 8880, **Turn off preheating function**)

```shell
# Run under Linux
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=false -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8880 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

```shell
# Run under Windows
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=false -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8880 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

(3) Start the second provider instance (port 8890, **enable preheating capability**)

```shell
# Run under Linux
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8890 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

```shell
# Run under Windows
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8890 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar nacos-rest-provider-2.2.0.RELEASE.jar
```

(4) start consumer
```shell
# Run under Linux
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8800 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar nacos-rest-consumer-2.2.0.RELEASE.jar
```

```shell
# Run under Windows
java -Dgrace.rule.enableSpring=true -Dgrace.rule.enableWarmUp=true -Dgrace.rule.enableGraceShutdown=true -Dgrace.rule.enableOfflineNotify=true -Dspring.cloud.nacos.discovery.server-addr=localhost:8848 -Dserver.port=8800 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar nacos-rest-consumer-2.2.0.RELEASE.jar
```


> **Description**:
> where path needs to be replaced with the actual installation path of Sermant.
> x.x.x represents a Sermant version number.

### Verification

#### Preheating capability verification

<MyImage src="/docs-img/springcloud-grace-warm-up.png"/>

Access the interface `localhost:8800/graceHot`, and judge whether the preheating is effective according to the ip and port returned by the interface. If during the warm-up period (default 120s) the access is biased towards the provider whose port is `8880`, and the traffic becomes **average** over time, it means that the pre-heating takes effect.

#### Elegant offline verification

<MyImage src="/docs-img/springcloud-grace-graceful-offline.png"/>

Continue to access the interface `localhost:8800/graceDownOpen`, and then log off one of the provider instances to observe whether there is an error in the request. If there is no error, the graceful offline capability verification is successful.