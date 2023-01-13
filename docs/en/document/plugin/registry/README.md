# Service-Registry

This article mainly introduces how to use the [service registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry), as well as the migration capabilities of the registration center based on the [Spring Cloud](#registry-migration-spring-cloud) framework and the [Dubbo](#registry-migration-dubbo) framework.

## Function

The service registration plug-in allows microservices that have been registered with popular registration centers, such as Eureka, Nacos, ZooKeeper, and Consul, to be registered with [Service Center](https://github.com/apache/servicecomb-service-center) in a non-intrusive manner. It also supports Dubbo and SpringCloud frameworks.

## Parameter configuration

### Modify [Core Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-config/config/config.properties) On Demand

Modify service information (application name, version number, namespace, environment), refer to [Sermant-agent User Manual](../../user-guide/sermant-agent.md).

### Modify The [Plugin Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml) On Demand

The file path is `${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml`. Please replace `${agent_package_path}` with the actual package path.

The configuration file is as follows:

```yaml
register.service:
  registerType: SERVICE_COMB
servicecomb.service:
  address: http://localhost:30100
  heartbeatInterval: 15
  openMigration: false
  enableSpringRegister: false
  enableDubboRegister: false
  sslEnabled: false
  preferIpAddress: false
nacos.service:
  address: 127.0.0.1:8848
  username: ""
  password: ""
  namespace: ""
  weight: 1
  clusterName: DEFAULT
  ephemeral: true
```

The configuration items are described as follows:

|Parameter Key|Default Value|Affiliated Registration Center|Description|
|---|---|---|---|
|register.service.registerType|SERVICE_COMB|common|Registration Center Type, support NACOS/SERVICE_COMB|
|register.service.registerType.address|http://127.0.0.1:30100|common|Registration center address, service_comb: http://localhost:30100, nacos: 127.0.0.1:8848|
|servicecomb.service.heartbeatInterval|15|SERVICE_COMB|Interval at which service instance heartbeats are sent (unit: second)|
|servicecomb.service.openMigration|false|SERVICE_COMB|Whether to enable the migration function|
|servicecomb.service.enableSpringRegister|false|SERVICE_COMB|Whether to enable the Spring plug-in registration capability. This capability must be enabled for the Spring Cloud framework and disabled for the Dubbo framework|
|servicecomb.service.enableDubboRegister|false|SERVICE_COMB|Whether to enable the dubbo plug-in registration capability. This capability must be enabled for the dubbo framework and disabled for the spring cloud framework|
|servicecomb.service.sslEnabled|false|SERVICE_COMB|Whether to enable SSL|
|nacos.service.username|-|NACOS|nacos username|
|nacos.service.password|-|NACOS|nacos password|
|nacos.service.namespace|-|NACOS|namespace, nacos setting the id of namespace|
|nacos.service.weight|1|NACOS|service instance weight|
|nacos.service.clusterName|DEFAULT|NACOS|cluster name|
|nacos.service.ephemeral|true|NACOS|Whether to enable ephemeral endpoint, true for yes，false for no|

### Notice:

- group of nacos can setting by core config service.meta.application.

- nacos configs current only show normal use type, others see [NACOS config class](https://github.com/huaweicloud/Sermant/blob/develop/sermant-plugins/sermant-service-registry/registry-common/src/main/java/com/huawei/registry/config/NacosRegisterConfig.java).

- For springcloud single registration scenario, the registration plugin will block all beans related to the original registration center, so please do not inject beans related to the original registration center in the business code, otherwise it will lead to service startup failure.

- For **newly developed dubbo applications**, you also need to configure the address of the dubbo registration center. This configuration item is generally in the configuration file of the dubbo application, for example, in the dubbo/provider.xml file.

```xml
<dubbo:registry address="sc://127.0.0.1:30100"/>
```

Alternatively, in application.yml (or application.properties), application.yml is used as an example.

```yml
dubbo:
  registry:
    address: sc://127.0.0.1:30100
```

Note that the address information of **this configuration item is not used**. Only the protocol name sc is used. (That is, the IP address is not important. **You only need to start with sc://**.)

- **Note**: For **existing dubbo applications**, (Applications which hava already set up it's own registry address) **This step is not required**.

## Supported Versions and Limitations

|Microservice Framework Supported|Registration Center Supported|Notice|
|---|---|---|
|SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-service-center<br>Nacos|-|
|Dubbo 2.6.x-2.7.x|servicecomb-service-center<br>Nacos|-|

## Operation and Result Verification

### Deploying Applications

1. Start the Service Center. For details about how to download, use, and start the Service Center, see the [official website](https://github.com/apache/servicecomb-service-center).

2. Compile [demo application](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo)

```shell
mvn clean package
```

3. Start Consumer

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

4. Start Provider

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

Note: To facilitate the test, the DUBBO registration function is enabled in -Dservicecomb.service.enableDubboRegister=true mode. If the DUBBO registration function is enabled in other modes, you do not need to add this parameter.

Replace `${path}` with the Sermant project path, replace x.x.x with the actual Sermant version number, and appName with the application name in the agent startup parameter, which is irrelevant to registration parameters. The directory for running commands must be the JAR package directory of the demo application.

### Result Verification

After the preceding two applications are started, log in to the [Service Center](http://127.0.0.1:30103/) background and check whether related service instances have been registered. Access the application interface <http://localhost:28820/hello> to check whether the interface returns a normal response. If the interface returns a successful response, the registration is successful.

## Registry Migration - Spring Cloud

Provides the capability of quickly migrating the registration center to the [Service Center](https://github.com/apache/servicecomb-service-center) based on the dual-registration mode without interrupting online services business. The following registration centers are supported:

| Registration Center | Supported or Not |
| ------------------- | ---------------- |
| Eureka              | ✅                |
| Consul              | ✅                |
| Nacos               | ✅                |
| Zookeeper           | ✅                |

**Schematic diagram of migration**

<MyImage src="/docs-img/sermant-register-migration-en.png"/>

### Parameter configuration

#### Modify [Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

For details about the configuration, see the [service registration plugin document](./README.md#modify-the-plugin-configuration-file-on-demand).

Based on the preceding configuration, **the migration configuration is added and the Spring registration plugin is enabled**. The configuration content is as follows:

```yaml
servicecomb.service:
  openMigration: true # Specifies whether to enable the migration function. To migrate the registration center, set this parameter to true.
  enableSpringRegister: true # Enabling the spring registration plugin
```

#### Delivering Heartbeat Configurations

The registration center migration plugin provides the method of disabling the heartbeat mechanism of the original registration center based on the dynamic configuration center to prevent continuous error log output.

Please refer to [Dynamic Configuration Center User Manual](../../user-guide/configuration-center.md#sermant-dynamic-configuration-center-model)。

The key value is **sermant.agent.registry**.

It is recommended to configure the group to microservice level, i.e. **app=app=${yourApp}&environment=${yourEnvironment}&service={yourServiceName}**, app defaults to default, environment defaults to empty, service is the name of the microservice (usually the value configured for spring.application.name).

The content is **origin.\_\_registry\_\_.needClose: true**.

> ***Notices :***
>
> This operation is a one-off operation. After the registration center heartbeat function is disabled, the heartbeat function cannot be enabled. It can be restored only after the application instance is restarted.

### Supported Versions and Limitations

| Spring Cloud Version | Spring Boot Version | Zookeeper Discovery Version | Nacos Discovery Version     | Consul Discovery Version   | Eureka Client Version                               |
| -------------------- | ------------------- | --------------------------- | --------------------------- | -------------------------- | --------------------------------------------------- |
| Edgware.SR2          | 1.5.x               | 1.x.x, 2.0.x                | 1.5.x                       | 1.x.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Finchley.x           | 2.0.x, 2.1.x        | 2.x.x                       | 1.5.x, 2.0.x, 2.1.x         | 1.3.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Hoxton.x             | 2.2.x, 2.3.x        | 2.x.x, 3.0.0 - 3.1.0        | 2.x.x, 2020.0.RC1, 2021.1   | 1.3.x, 2.0.x, 2.1.x, 2.2.x | 1.4.4.RELEASE - 1.4.7.RELEASE, 2.x.x, 3.0.0 - 3.1.0 |
| 2020.0.x             | 2.4.x, 2.5.x        | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 2.1.x, 2.2.x, 3.0.0 - 3.1.0                         |
| 2021.0.0             | 2.6.x               | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 3.0.0 - 3.1.0                                       |

### Operation and Result Verification

#### Deploying Applications

1. Prepare the Environment

- Start Service Center. For details about how to download, use, and start Service Center, see the [official website](https://github.com/apache/servicecomb-service-center).

- Start the Zookeeper. For details about how to download, use, and start the Nacos, see the [official website](https://zookeeper.apache.org/index.html).

- Compile [demo application](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/spring-cloud-registry-demo)

```shell
mvn clean package
```

- Notice: In this example, the original registration center is Zookeeper.

2. Start the demo applications

(1) Start the original provider and original consumer (registered in Zookeeper)

```shell
# windows
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar

# mac, linux
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar
```

(2) After successful startup, visit the consumer interface <http://localhost:8161/hello> to confirm that the interface is returning properly.

(3) Start up double registration providers

```shell
# windows
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar

# mac, linux
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar
```

Notices: To facilitate the test, the spring migration function is enabled in -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true mode. If the spring migration function is enabled in other modes, you do not need to add this parameter. For perspective, the provider port is modified using -Dserver.port=8262.

Replace path with the actual Sermant package path**, x.x.x is the actual Sermant version number, and appName with the agent startup parameter, which is irrelevant to registration parameters.

(4) After a successful start, visit the consumer interface <http://localhost:8161/hello> several times to confirm that the interface can access the 2 providers.

(5) Close the original provider

(6) Start up double registration consumers

Notices: To facilitate the test, the spring migration function is enabled in -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true mode. If the spring migration function is enabled in other modes, you do not need to add this parameter. For perspective, the consumer port is modified using -Dserver.port=8261.

Replace path with the actual Sermant package path**, x.x.x is the actual Sermant version number, and appName with the agent startup parameter, which is irrelevant to registration parameters.

```shell
# windows
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar

# mac, linux
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar
```

(7) After successful startup, visit the consumer interface <http://localhost:8161/hello> and <http://localhost:8261/hello> several times to confirm that the 2 interfaces can access the double registered provider.

(8) Close the original consumer

(9) Stop the old registry center (Zookeeper)

> ***Notices：***
>
> Stop the original register center. Because most of the registry centers have the heartbeat check mechanism, the instance may continuously update error logs, but the application invoking is not affected.
>
> To stop such error logs, see [**Delivering Heartbeat Configurations**](#delivering-heartbeat-configurations).
>
> When issuing a configuration to a provider, key is **sermant.agent.registry**, group is **app=default&environment=&service=spring-cloud-registry-provider**，content is **origin.\_\_registry\_\_.needClose: true**.
>
> When issuing a configuration to a consumer, key is **sermant.agent.registry**, group is **app=default&environment=&service=spring-cloud-registry-consumer**，content is **origin.\_\_registry\_\_.needClose: true**.

#### Result Verification

During the migration of the registry, the provider can always invoke the consumer without interrupting the service.

## Registry Migration - Dubbo

Provides the capability of quickly migrating the registration center to the [Service Center](https://github.com/apache/servicecomb-service-center) based on the dual-registration mode without interrupting online services business. The following registration centers are supported:

| Registration Center | Support |
| --------- | -------- |
| Nacos     | ✅        |
| Zookeeper | ✅        |

**Schematic diagram of migration**

<MyImage src="/docs-img/sermant-register-migration-en.png"/>

### Parameter configuration

#### Modify [Plugin Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

The file path is `${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml`. Please replace `${agent_package_path}` with the actual package path.

Set servicecomb.service.openMigration and servicecomb.service.enableDubboRegister to true as follows:

```yaml
servicecomb.service:
  openMigration: true # Enable the migration function
  enableDubboRegister: true # Enable Dubbo plugin registration
```

For details, see the [service registration plugin document](./README.md#modify-the-plugin-configuration-file-on-demand).

**Notices**: If the migration function is enabled, you do not need to change the address of the original registration center. Otherwise, the registration will not be performed at the same time with two registration centers (original registration center + SC).

### Supported Versions and Limitations

|Microservice Framework Supported|Registration Center Supported|Notice|
|:-----|:--|:--|
|Dubbo 2.6.x-2.7.x|**Target Registration Center** supported：servicecomb-service-center, Nacos<br/>**Original Registration Center** supported：Nacos、Zookeeper|-|


### Operation and Result Verification

#### Deploying Applications

1. Prepare the Environment

- Start Service Center. For details about how to download, use, and start Service Center, see the [official website](https://github.com/apache/servicecomb-service-center).

- Start the Zookeeper. For details about how to download, use, and start the Nacos, see the [official website](https://zookeeper.apache.org/index.html).

- Compile [demo application](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo)

```shell
mvn clean package
```

- Notice: In this example, the original registration center is Zookeeper.

2. Start the demo applications

- Start up double registration consumer

```shell
# windows
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

Notices: To facilitate the test, the dubbo migration function is enabled in -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true mode. If the dubbo migration function is enabled in other modes, you do not need to add this parameter.

- Start the original producer (registered with the Zookeeper).

```shell
# windows
java -jar dubbo-registry-provider.jar

# mac, linux
java -jar dubbo-registry-provider.jar
```

- Starting a New Producer (Registering to the SC)

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

Notice: To facilitate the test, the Dubbo registration function is enabled in -Dservicecomb.service.enableDubboRegister=true mode. If the Dubbo registration function is enabled in other modes, you do not need to add this parameter. In addition, to solve the port conflict problem when two providers are started on the same server, you need to add the -Dserver.port=48021 -Ddubbo.protocol.port=48821 parameter. If the two providers are on different servers, you do not need to add this parameter.

Please replace `${path}` with the Sermant project path, replace x.x.x with the actual Sermant version number, and appName with the application name in the agent startup parameter, which is irrelevant to the registration parameter. The directory for running the command must be the directory where the JAR package of the demo application is located.

- Result Verification

After the preceding three applications are started, log in to the [Service Center](http://127.0.0.1:30103/) background Zookeeper to view the consumer and provider applications. Access the application interface <http://localhost:28820/hello> for multiple times and check whether the interface returns a normal response. If the interface successfully returns a response and the producer instances of the two registration centers can be accessed, indiactes that the registration and migration are successful.




