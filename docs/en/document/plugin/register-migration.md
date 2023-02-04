# Service-Registry

This article describes how to use the [service registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry), as well as the migration capabilities of the registration center based on the [Spring Cloud](#registry-migration-spring-cloud) framework and the [Dubbo](#registry-migration-dubbo) framework.

## Function

The service registration plug-in has the ability to achieve registration migration in a non-intrusive way. Microservices originally registered in mainstream registries such as Eureka, Nacos, Zookeeper and Consul can be non-intrusively registered in [ServiceComb](https://github.com/apache/servicecomb-service-center) based on dual registration or single registration mode Or [Nacos](https://nacos.io/) On.

## Parameter Configuration

### Sermant-agent configuration

Service registry plugin requires configuring the service metadata (application, project, version, environment, other metadata) in Sermant-agent, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

- service.meta.application: application/group, service discovery is only possible for microservices that belong to the same application.

- service.meta.project: project, service discovery is only possible for microservices that belong to the same project.

- service.meta.version: version, used to identify the current version of the microservice.

- service.meta.environment: environment, used to identify the current microservice's environment, and only microservices belonging to the same environment can perform service discovery.

- service.meta.parameters: other metadata, used to tag the current microservice, like k1:v1,k2:v2.

### Plugin configuration

Service registry plugin requires modification of the plugin configuration file on demand, which can be found in the path `${path}/sermant-agent-x.x.x/agent/pluginPackage/service-registry/config/config.yaml`. The configuration file for the plugin is shown below:

```yaml
register.service:
  registerType: SERVICE_ COMB         # The type of new registry, which controls the registration method used for service registration. Different registries have different registration implementations.
  address:  http://localhost:30100    # New registration center address. Controls where the service is registered when it is registered.
servicecomb.service:
  heartbeat interval: 15              # heartbeat sending interval of service instance. Monitor the status of the service instance through the heartbeat.
  openMigration: false                # Register the migration switch. When enabled, the original registration function of the host service will be blocked and only registered to the new registry.
  enableSpringRegister: false         # The spring cloud plug-in registration ability switch. After being opened, it will be registered as a Spring Cloud service to the new registry. Cannot be turned on at the same time as the dubbo plug-in registration ability switch.
  enableDubboRegister: false          # Dubbo plug-in registration ability switch. After being opened, it will be registered as a dubbo service to the new registry. It cannot be turned on at the same time as the Spring plug-in registration ability switch.
  sslEnabled: false                   # ssl switch. Controls whether SSL security access is enabled.
  preferIpAddress: false              # Whether to use IP. Controls whether the service instance is registered using IP or domain name.
nacos.service:
  username: ""                        # nacos verifies the account. When the new registration center is nacos, you need to use nacos to verify your account when you register.
  password: ""                        # nacos verifies the account. When the new registration center is nacos, the password needs to be verified by nacos when registering.
  namespace: ""                       # ID value of the nacos namespace. Control the namespace to which the nacos is registered when registering, and only microservices belonging to the same namespace can perform service discovery.
  weight: 1                           # Service instance weight value. Used during service registration. When a service instance is called, the higher the weight, the higher the access frequency.
  clusterName: DEFAULT                # Cluster name. It is used for service registration and discovery. When the service instance is called, only the instances under the same cluster will be called.
  ephemeral: true                     # Whether it is a temporary node. Used during service registration. The temporary node is used when the node does not need to exist after the service is offline.
```

The configuration items are described as follows:

| Parameter Key                            | Description                                                                                                                                                                                                                      | Default Value          | Affiliated Registration Center | Required |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|--------------------------------|----------|
| register.service.registerType            | Registration Center Type, support NACOS/SERVICE_COMB                                                                                                                                                                             | SERVICE_COMB           | common                         | Yes      |
| register.service.address                 | Registration center address, service_comb: like http://localhost:30100, nacos: like 127.0.0.1:8848                                                                                                                               | http://127.0.0.1:30100 | common                         | Yes      |
| servicecomb.service.heartbeatInterval    | Interval at which service instance heartbeats are sent (unit: second)                                                                                                                                                            | 15                     | SERVICE_COMB                   | Yes      |
| servicecomb.service.openMigration        | Whether to enable the migration function                                                                                                                                                                                         | false                  | SERVICE_COMB                   | Yes      |
| servicecomb.service.enableSpringRegister | Whether to enable the Spring Cloud plug-in registration capability. This capability must be enabled for the Spring Cloud framework and disabled for the Dubbo framework.Cannot be opened at the same time as enableDubboRegister | false                  | common                         | Yes      |
| servicecomb.service.enableDubboRegister  | Whether to enable the dubbo plug-in registration capability. This capability must be enabled for the dubbo framework and disabled for the spring cloud framework.Cannot be opened at the same time as enableSpringRegister       | false                  | common                         | Yes      |
| servicecomb.service.sslEnabled           | Whether to enable SSL                                                                                                                                                                                                            | false                  | SERVICE_COMB                   | Yes      |
| servicecomb.service.prefererIpAddress    | Whether to use IP access                                                                                                                                                                                                         | false                  | SERVICE_ COMB                  | Yes      |
| nacos.service.username                   | nacos username                                                                                                                                                                                                                   | -                      | NACOS                          | No       |
| nacos.service.password                   | nacos password                                                                                                                                                                                                                   | -                      | NACOS                          | No       |
| nacos.service.namespace                  | namespace, nacos setting the id of namespace                                                                                                                                                                                     | -                      | NACOS                          | No       |
| nacos.service.weight                     | service instance weight                                                                                                                                                                                                          | 1                      | NACOS                          | Yes      |
| nacos.service.clusterName                | cluster name                                                                                                                                                                                                                     | DEFAULT                | NACOS                          | Yes      |
| nacos.service.ephemeral                  | Whether to enable ephemeral endpoint, true for yes，false for no                                                                                                                                                                  | true                   | NACOS                          | Yes      |

> Notice:
> - group of nacos can setting by [Sermant-agent configuration](#sermant-agent-configuration)'s service.meta.application.
> - nacos configs current only show normal use type, others see [NACOS config class](https://github.com/huaweicloud/Sermant/blob/develop/sermant-plugins/sermant-service-registry/registry-common/src/main/java/com/huawei/registry/config/NacosRegisterConfig.java).

## Supported Versions and Limitations

Framework Supported:

- SpringCloud Edgware.SR2 - 2021.0.0

- Dubbo 2.6.x - 2.7.x

Limitations:

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

> Note: For **existing dubbo applications**, (Applications which hava already set up it's own registry address) **This step is not required**.

## Operation and Result Verification

The following will demonstrate how to use the service registration plug-in to verify the registration and migration function of the dubbo application in the single registration mode.

### Preparations

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo) dubbo-registry-demo source code

- [Download](https://github.com/apache/servicecomb-service-center) ServiceComb (used as a registry), and start

> Note: [Dynamic Configuration Center](../user-guide/configuration-center.md) will be used by default in this scenario. Since it is not the core component of this scenario, it will not be described in this article.

### Step 1: Compile and package the dubbo-registry-demo application

Execute the following command in the `${path}/Sermant-examples/registry-demo/dubbo-registry-demo` directory:

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

After successful packaging, you can get `dubbo-registry-consumer.jar` in `${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-consumer/target` , get `dubbo-registry-provider.jar` in `${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-provider/target`.

> Note: path is the path where the dubbo-registry-demo application is downloaded.

### Step 2: Deploy the applications

(1) Start Consumer

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

(2) Start Provider

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

> Note: To facilitate the test, the DUBBO registration function is enabled in -Dservicecomb.service.enableDubboRegister=true mode. If the DUBBO registration function is enabled in other [parameter configuration method](../user-guide/sermant-agent.md#parameter-configuration-options), you do not need to add this parameter.

> Description: Replace `${path}` with the Sermant project path, replace x.x.x with the actual Sermant version number, and appName with the application name in the agent startup parameter, which is irrelevant to registration parameters. The directory for running commands must be the JAR package directory of the demo application.

### Verification

After the preceding two applications are started, log in to the ServiceComb background `http://127.0.0.1:30103/` and check whether related service instances have been registered.

<MyImage src="/docs-img/registry-result-en.png"/>

Access the application interface `http://localhost:28820/hello` to check whether the interface returns a normal response. If the interface returns a successful response, the registration is successful.

<MyImage src="/docs-img/registry-request-result.png"/>

## Registry Migration - Spring Cloud

### Function

Provides the capability of quickly migrating the registration center to the [ServiceComb](https://github.com/apache/servicecomb-service-center) or [Nacos](https://nacos.io/) based on the dual-registration mode without interrupting online services business. The following original registration centers are supported:

| Original Registration Center | Supported or Not |
|------------------------------|------------------|
| Eureka                       | ✅                |
| Consul                       | ✅                |
| Nacos                        | ✅                |
| Zookeeper                    | ✅                |

**Schematic diagram of migration**

<MyImage src="/docs-img/sermant-register-migration-en.png"/>

### Parameter configuration

#### Modify plugin configuration

For details about the configuration, see the [Plugin configuration](#plugin-configuration).

Based on the preceding configuration, **the migration configuration is added and the Spring Cloud registration plugin is enabled**. The configuration content is as follows:

```yaml
servicecomb.service:
  openMigration: true # Specifies whether to enable the migration function. To migrate the registration center, set this parameter to true.
  enableSpringRegister: true # Enabling the spring cloud registration plugin
```

#### Close the Original Registry Heartbeat

The registration center migration plugin provides the method of disabling the heartbeat mechanism of the original registration center based on the dynamic configuration center to prevent continuous error log output.

Please refer to [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#sermant-dynamic-configuration-center-model), the configuration content is as follows:

```json
{
  "content为": "origin.__registry__.needClose: true",
  "group": "app=${service.meta.application}&environment=${service.meta.environment}&service={spring.application.name}",
  "key": "sermant.agent.registry"
}
```

> Group recommends configuring it to microservice level. When configuring, please modify service.meta.application, service.meta.environment, and spring.application.nam to specific values. For the configuration of service.meta.application, service.meta.environment, please refer to the [Service Agent User Manual] (../user-guide/service-agent. md # parameter configuration of service-agent), and spring.application.name is the microservice name (that is, the service name configured in the spring application).

The key value is **sermant.agent.registry**.

It is recommended to configure the group to microservice level, i.e. **app=${service.meta.application}&environment=${service.meta.environment}&service={spring.application.name}**, for the configuration of service.meta.application and service.meta.environment, please refer to the [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration), spring.application.name is the microservice name (i.e. the name of the service configured in the spring application).

The content is **origin.\_\_registry\_\_.needClose: true**.

> ***Notices :***
>
> This operation is a one-off operation. After the registration center heartbeat function is disabled, the heartbeat function cannot be enabled. It can be restored only after the application instance is restarted.

### Supported Versions and Limitations

Framework Supported:

- SpringCloud Edgware.SR2 - 2021.0.0

Limitations: None

### Operation and Result Verification

The following will demonstrate how to use the service registration plug-in to verify the registration and migration function of the SpringCloug application in the dual registration mode (the scenario of migrating from Zookeeper to ServiceComb).

#### Preparations

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/spring-cloud-registry-demo) spring-cloud-registry-demo source code

- [Download](https://github.com/apache/servicecomb-service-center) ServiceComb (used as a registry), and start

- [Download](https://zookeeper.apache.org/releases.html#download) Zookeeper (used as a registry), and start

### Step 1: Compile and package the spring-cloud-registry-demo application

Execute the following command in the `${path}/Sermant-examples/registry-demo/spring-cloud-registry-demo` directory:

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

After successful packaging, you can get `spring-cloud-registry-consumer.jar` in `${path}/Sermant-examples/registry-demo/spring-cloud-registry-demo/spring-cloud-registry-consumer/target` , get `spring-cloud-registry-provider.jar` in `${path}/Sermant-examples/registry-demo/spring-cloud-registry-demo/spring-cloud-registry-provider/target`.

> Note: path is the path where the spring-cloud-registry-demo application is downloaded.

#### Step 2: Deploy the applications

(1) Start the original provider and original consumer (registered in Zookeeper)

```shell
# windows
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar

# mac, linux
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar
```

After successful startup, visit the consumer interface `http://localhost:8161/hello` to confirm that the interface is returning properly.

<MyImage src="/docs-img/springcloud-migration-1.png"/>

(2) Start up double registration providers

```shell
# windows
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar

# mac, linux
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar
```

> Notices: To facilitate the test, the spring migration function is enabled in -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true mode. If the spring migration function is enabled in other [parameter configuration method](../user-guide/sermant-agent.md#parameter-configuration-options), you do not need to add this parameter. For perspective, the provider port is modified using -Dserver.port=8262.

> Description: Replace path with the actual Sermant package path**, x.x.x is the actual Sermant version number, and appName with the agent startup parameter, which is irrelevant to registration parameters.

After a successful start, visit the consumer interface `http://localhost:8161/hello` several times to confirm that the interface can access the 2 providers.

<MyImage src="/docs-img/springcloud-migration-2.png"/>

<MyImage src="/docs-img/springcloud-migration-1.png"/>

(3) Close the original provider

(4) Start up double registration consumers

```shell
# windows
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar

# mac, linux
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar
```

> Notices: To facilitate the test, the spring migration function is enabled in -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true mode. If the spring migration function is enabled in other [parameter configuration method](../user-guide/sermant-agent.md#parameter-configuration-options), you do not need to add this parameter. For perspective, the consumer port is modified using -Dserver.port=8261.

> Description: Replace path with the actual Sermant package path**, x.x.x is the actual Sermant version number, and appName with the agent startup parameter, which is irrelevant to registration parameters.

After successful startup, visit the consumer interface `http://localhost:8161/hello` and `http://localhost:8261/hello` several times to confirm that the 2 interfaces can access the double registered provider.

<MyImage src="/docs-img/springcloud-migration-3.png"/>

<MyImage src="/docs-img/springcloud-migration-4.png"/>

(5) Close the original consumer

(6) Stop the old registry center (Zookeeper)

> ***Notices：***
>
> Stop the original register center. Because most of the registry centers have the heartbeat check mechanism, the instance may continuously update error logs, but the application invoking is not affected.
>
> To stop such error logs, see [**Close the Original Registry Heartbeat**](#close-the-original-registry-heartbeat).
>
> When issuing a configuration to a provider, key is **sermant.agent.registry**, group is **app=default&environment=&service=spring-cloud-registry-provider**，content is **origin.\_\_registry\_\_.needClose: true**.
>
> When issuing a configuration to a consumer, key is **sermant.agent.registry**, group is **app=default&environment=&service=spring-cloud-registry-consumer**，content is **origin.\_\_registry\_\_.needClose: true**.

#### Verification

<MyImage src="/docs-img/springcloud-migration-5-en.png"/>

The producer service and consumer service successfully migrate the registry to servicecomb, and the producer can always invoke the consumer during the migration of the registry without interrupting the service.

## Registry Migration - Dubbo

### Function

Provides the capability of quickly migrating the registration center to the [ServiceComb](https://github.com/apache/servicecomb-service-center) or [Nacos](https://nacos.io/) based on the dual-registration mode without interrupting online services business. The following original registration centers are supported:

| Original Registration Center | Support |
|------------------------------|---------|
| Nacos                        | ✅       |
| Zookeeper                    | ✅       |

**Schematic diagram of migration**

<MyImage src="/docs-img/sermant-register-migration-en.png"/>

### Parameter configuration

#### Modify plugin configuration

For details about the configuration, see the [Plugin configuration](#plugin-configuration).

Based on the preceding configuration, **the migration configuration is added and the Dubbo registration plugin is enabled**. The configuration content is as follows:

```yaml
servicecomb.service:
  openMigration: true # Specifies whether to enable the migration function. To migrate the registration center, set this parameter to true.
  enableDubboRegister: true # Enabling the Dubbo registration plugin
```

**Notices**: If the migration function is enabled, you do not need to change the address of the original registration center (i.e. dubbo.registry.address). Otherwise, the registration will not be performed at the same time with two registration centers (original registration center + SC).

### Supported Versions and Limitations

Framework Supported:

- Dubbo 2.6.x - 2.7.x

Limitations: None

### Operation and Result Verification

The following will demonstrate how to use the service registration plug-in to verify the registration and migration function of Dubbo application in the dual registration mode (the scenario of migrating from Zookeeper to ServiceComb).

#### Preparations

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo) dubbo-registry-demo source code

- [Download](https://github.com/apache/servicecomb-service-center) ServiceComb (used as a registry), and start

- [Download](https://zookeeper.apache.org/releases.html#download) Zookeeper (used as a registry), and start

### Step 1: Compile and package the dubbo-registry-demo application

Execute the following command in the `${path}/Sermant-examples/registry-demo/dubbo-registry-demo` directory:

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

After successful packaging, you can get `dubbo-registry-consumer.jar` in `${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-consumer/target` , get `dubbo-registry-provider.jar` in `${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-provider/target`.

> Note: path is the path where the dubbo-registry-demo application is downloaded.

#### Step 2: Deploy the applications

(1) Start up double registration consumer

```shell
# windows
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

> Notices: To facilitate the test, the dubbo migration function is enabled in -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true mode. If the dubbo migration function is enabled in other [parameter configuration method](../user-guide/sermant-agent.md#parameter-configuration-options), you do not need to add this parameter.

(2) Start the original provider (registered with the Zookeeper).

```shell
# windows
java -jar dubbo-registry-provider.jar

# mac, linux
java -jar dubbo-registry-provider.jar
```

(3) Starting a New Provider (Registering to the SC)

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

> Notice: To facilitate the test, the Dubbo registration function is enabled in -Dservicecomb.service.enableDubboRegister=true mode. If the Dubbo registration function is enabled in other [parameter configuration method](../user-guide/sermant-agent.md#parameter-configuration-options), you do not need to add this parameter. In addition, to solve the port conflict problem when two providers are started on the same server, you need to add the -Dserver.port=48021 -Ddubbo.protocol.port=48821 parameter. If the two providers are on different servers, you do not need to add this parameter.

> Description: Please replace `${path}` with the Sermant project path, replace x.x.x with the actual Sermant version number, and appName with the application name in the agent startup parameter, which is irrelevant to the registration parameter. The directory for running the command must be the directory where the JAR package of the demo application is located.

#### Verification

<MyImage src="/docs-img/dubbo-migration-en.png"/>

After starting the above 3 applications, log in to ServiceComb backend `http://127.0.0.1:30103/` and check the Zookeeper node data, all of them can view the consumer and provider applications.

<MyImage src="/docs-img/dubbo-migration-1.png"/>

<MyImage src="/docs-img/dubbo-migration-2.png"/>

visit the application interface `http://localhost:28820/hello` several times to confirm whether the interface returns normally. If the interface returns successfully and the producer instances of the 2 registries can be accessed, it means the registration and migration are successful.

<MyImage src="/docs-img/dubbo-migration-3.png"/>

<MyImage src="/docs-img/dubbo-migration-4.png"/>