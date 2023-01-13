# Service-Registry

This document describes the [service registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry) and how to use the plugin.

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