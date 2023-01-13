# Registry Migration - Spring Cloud

This document describes the migration capability of the [service registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry) based on the Spring Cloud framework registration center.

Dubbo migration  referring [Dubbo Registry Migration](dubbo-registry-migiration.md)

## Function

Provides the capability of quickly migrating the registration center to the [Service Center](https://github.com/apache/servicecomb-service-center) based on the dual-registration mode without interrupting online services business. The following registration centers are supported:

| Registration Center | Supported or Not |
| ------------------- | ---------------- |
| Eureka              | ✅                |
| Consul              | ✅                |
| Nacos               | ✅                |
| Zookeeper           | ✅                |

**Schematic diagram of migration**

<MyImage src="/docs-img/sermant-register-migration-en.png"/>

## Parameter configuration

#### Modify [Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

For details about the configuration, see the [service registration plugin document](./README.md#modify-the-plugin-configuration-file-on-demand).

Based on the preceding configuration, **the migration configuration is added and the Spring registration plugin is enabled**. The configuration content is as follows:

```yaml
servicecomb.service:
  openMigration: true # Specifies whether to enable the migration function. To migrate the registration center, set this parameter to true.
  enableSpringRegister: true # Enabling the spring registration plugin
```

### Delivering Heartbeat Configurations

The registration center migration plugin provides the method of disabling the heartbeat mechanism of the original registration center based on the dynamic configuration center to prevent continuous error log output.

Please refer to [Dynamic Configuration Center User Manual](../../user-guide/configuration-center.md#sermant-dynamic-configuration-center-model)。

The key value is **sermant.agent.registry**.

It is recommended to configure the group to microservice level, i.e. **app=app=${yourApp}&environment=${yourEnvironment}&service={yourServiceName}**, app defaults to default, environment defaults to empty, service is the name of the microservice (usually the value configured for spring.application.name).

The content is **origin.\_\_registry\_\_.needClose: true**.

> ***Notices :***
>
> This operation is a one-off operation. After the registration center heartbeat function is disabled, the heartbeat function cannot be enabled. It can be restored only after the application instance is restarted.

## Supported Versions and Limitations

| Spring Cloud Version | Spring Boot Version | Zookeeper Discovery Version | Nacos Discovery Version     | Consul Discovery Version   | Eureka Client Version                               |
| -------------------- | ------------------- | --------------------------- | --------------------------- | -------------------------- | --------------------------------------------------- |
| Edgware.SR2          | 1.5.x               | 1.x.x, 2.0.x                | 1.5.x                       | 1.x.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Finchley.x           | 2.0.x, 2.1.x        | 2.x.x                       | 1.5.x, 2.0.x, 2.1.x         | 1.3.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Hoxton.x             | 2.2.x, 2.3.x        | 2.x.x, 3.0.0 - 3.1.0        | 2.x.x, 2020.0.RC1, 2021.1   | 1.3.x, 2.0.x, 2.1.x, 2.2.x | 1.4.4.RELEASE - 1.4.7.RELEASE, 2.x.x, 3.0.0 - 3.1.0 |
| 2020.0.x             | 2.4.x, 2.5.x        | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 2.1.x, 2.2.x, 3.0.0 - 3.1.0                         |
| 2021.0.0             | 2.6.x               | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 3.0.0 - 3.1.0                                       |

## Operation and Result Verification

### Deploying Applications

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

### Result Verification

During the migration of the registry, the provider can always invoke the consumer without interrupting the service.