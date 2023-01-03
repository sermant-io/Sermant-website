# Service-Registry

This document describes the [service registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry) and how to use the plugin.

## Function

The service registration plug-in allows microservices that have been registered with popular registration centers, such as Eureka, Nacos, ZooKeeper, and Consul, to be registered with [Service Center](https://github.com/apache/servicecomb-service-center) in a non-intrusive manner. It also supports Dubbo and SpringCloud frameworks.

## Parameter configuration

### Modify [Core Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-config/config/config.properties) On Demand


The file path is `${agent_package_path}/agent/config/config.properties`. Please replace `${agent_package_path}` with the actual package path.

The configuration items are described as follows:

```properties
#application name
service.meta.application=default
#service version
service.meta.version=1.0.0
#namespace, just keep default
service.meta.project=default
#you environment, currently, testing/development/production are supported
service.meta.environment=development
```

### Modify The [Plugin Configuration File](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml) On Demand

The file path is `${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml`. Please replace `${agent_package_path}` with the actual package path.

The configuration items are described as follows:

```yaml
servicecomb.service:
  address: http://127.0.0.1:30100 # Registration center address. Use commas (,) to separate multiple registration center addresses.
  heartbeatInterval: 15 # Interval at which service instance heartbeats are sent (unit: second)
  openMigration: false # Whether to enable the migration function.
  enableSpringRegister: false # Whether to enable the Spring plug-in registration capability. This capability must be enabled for the Spring Cloud framework and disabled for the Dubbo framework.
  enableDubboRegister: false # Whether to enable the dubbo plug-in registration capability. This capability must be enabled for the dubbo framework and disabled for the spring cloud framework.
  sslEnabled: false # Whether to enable SSL.
```

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

## Operation and Result Verification

- Start the Service Center. For details about how to download, use, and start the Service Center, see the [official website](https://github.com/apache/servicecomb-service-center).
- Compile [demo application](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/demo-registry/demo-registry-dubbo)

```shell
mvn clean package
```

- Start Consumer

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=dubbo-consumer -jar dubbo-consumer.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=dubbo-consumer -jar dubbo-consumer.jar
```

- Start Provider

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=dubbo-provider -jar dubbo-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=dubbo-provider -jar dubbo-provider.jar
```

Note: To facilitate the test, the DUBBO registration function is enabled in -Dservicecomb.service.enableDubboRegister=true mode. If the DUBBO registration function is enabled in other modes, you do not need to add this parameter.

Replace `${path}` with the Sermant project path, replace x.x.x with the actual Sermant version number, and appName with the application name in the agent startup parameter, which is irrelevant to registration parameters. The directory for running commands must be the JAR package directory of the demo application.

- Test

After the preceding two applications are started, log in to the [Service Center](http://127.0.0.1:30103/) background and check whether related service instances have been registered. Access the application interface http://localhost:28020/test to check whether the interface returns a normal response. If the interface returns a successful response, the registration is successful.