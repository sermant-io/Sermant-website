# Dynamic Configuration Center User Manual

This document introduces the scenarios, model descriptions, and usage of the Dynamic Configuration Center in Sermant. The dynamic configuration capability of Sermant is implemented through the [Dynamic Configuration Service](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/DynamicConfigService.java) in the Sermant framework layer, which pulls configurations from the Dynamic Configuration Center to enable a rich variety of service governance capabilities.

## Scenarios and Positioning of the Dynamic Configuration Center in Sermant

The Dynamic Configuration Center serves as a supporting component for the dynamic configuration function in Sermant, allowing it to pull configurations to enable diverse service governance capabilities. Users can enable dynamic configuration capabilities as needed and deploy the Dynamic Configuration Center.

The configuration center equips Sermant with the key capability of dynamic configuration on top of static configuration, solving the issue of immutability associated with the latter. This forms the foundation for the diversification of service governance in Sermant. For example:

- In the flow control plugin, the configuration and issuance of traffic markers and flow control rules are achieved through dynamic flow control mediated by the Sermant Dynamic Configuration Center.
- In the routing plugin, the issuance of tag routing rules is also activated through this dynamic configuration capability.

Since there are many mature open-source products in the industry for real-time configuration centers, Sermant does not provide a standalone implementation of a configuration center. Instead, it integrates with open-source configuration centers to achieve the business goal of real-time dynamic configuration of service governance rules.

In terms of specific implementation, a set of general interfaces for dynamic configuration is defined within the Sermant Agent. Based on this architecture:

- Users determine the type of configuration center that Sermant connects to through the configuration of the Sermant Agent. In operational scenarios, they can also directly interact with the Dynamic Configuration Center based on the usage manuals of various service governance plugins to achieve the business goals of dynamic configuration.
- Developers only need to interface with the general dynamic configuration interfaces in Plugin development to implement dynamic configuration functionality, without needing to focus on the various options and implementations of the Dynamic Configuration Center itself.

The following architecture diagram illustrates the principles of this architecture.

<MyImage src="/docs-img/dynamic-configuration-center-en.png"/>

## Parameter Configuration

For the configuration of the Dynamic Configuration Center, please refer to the corresponding open-source dynamic configuration centers (such as [ZooKeeper](https://zookeeper.apache.org/releases.html), [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/), and [Nacos](https://github.com/alibaba/nacos/releases)). This document will not elaborate in detail.

First, in the Sermant Agent product package `agent/config/config.properties`, set `agent.service.dynamic.config.enable=true` to **enable the dynamic configuration service**. Other parameters for the corresponding Dynamic Configuration Center in the Sermant Agent can also be configured in this file.

## Sermant Dynamic Configuration Center Model

The configuration model in Sermant is illustrated by the interface function [KeyGroupService.publishConfig](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/api/KeyGroupService.java).

```java
/**
 * Set the configuration value for a key in a group
 *
 * @param key     The key
 * @param group   The group
 * @param content The configuration value
 * @return Whether the operation was successful
 */
boolean publishConfig(String key, String group, String content);
```

In the example above, the two parameters that define the configuration item in the Sermant Agent are:

- **key**: The key value of the minimum configuration unit.
- **group**: Similar to a prefix for the key. Sermant primarily uses the Group to interface with the tenant isolation features of some configuration centers.

Different configuration centers have different matching models for group and key. This will be explained in detail later.

For users, utilizing the Dynamic Configuration Center requires obtaining an instance of `DynamicConfigService` during the plugin development process and calling the various abstract interfaces provided by `DynamicConfigService` based on their specific scenarios for corresponding service governance. Detailed API interface explanations and development guidelines can be found in the [Dynamic Configuration Feature Development Guidance](../developer-guide/dynamic-config-func.md) in the developer guide.

## Implementation of the Configuration Model Based on Different Dynamic Configuration Centers in Sermant

The following sections discuss several typical implementations of configuration centers. By understanding these model implementations, users can learn how to locate corresponding configuration items in different configuration centers and perform dynamic configurations to achieve service governance management goals.

### Configuration Model Implementation Based on ZooKeeper

For the `ZooKeeper` server, dynamic configuration is defined by the values of `ZooKeeper` nodes, with `Key` and `Group` serving as elements in constructing node paths. Since `Group` contains information that distinguishes users, it should be used as a prefix for node paths, with `Key` values occupying the latter half:

```txt
/${group}/${key} -> ${value}
```

### Configuration Model Implementation Based on ServiceComb Kie

For the `Kie` service, dynamic configuration refers to the key values of `Kie` configurations. `Kie` queries associated configurations based on tags, with `Key` and `Group` serving as elements of the associated configuration. `Key` is the name of the configuration key, while `Group` is the label associated with the `Key`. Each `Key` can be configured with one or more labels, typically formatted as follows:

```properties
{
  "key": "keyName",              # Configuration key
  "value": "value",              # Configuration value
  "labels": {
    "service": "serviceName"     # Label in kv format, supports one or more
  },
  "status": "enabled"
}
```

Compared to `Zookeeper`, `Kie` focuses more on `Group`, and its value-passing format differs. The value-passing format for `Kie` is as follows:

```txt
groupKey1=groupValue1[&groupKey2=groupValue2...]
```

> Where `groupKey` is the label key, and `groupValue` is the label value; multiple labels are concatenated with `&`. The `Group` can be generated using `LabelGroupUtils#createLabelGroup`.
>
> **Note:** 
>
> If the passed `Group` does not conform to the above format, it will default to adding the label `GROUP=passedGroup`.

### Configuration Model Implementation Based on Nacos

For the `Nacos` service, dynamic configuration refers to the configuration values of `Nacos`. `Nacos` includes `namespaceId`, `group`, and `dataId`. The `namespaceId` defaults to the value specified in `agent/config/config.properties` as `service.meta.project`; `group` remains consistent with the core `group` of dynamic configuration; `dataId` is set as the `Key`, which is the configuration key name, formatted as follows:

```properties
{
    "group": "Group", 			# Configuration group
    "dataId": "Key",  			# Configuration key
    "content": "config", 		# Configuration value
    "namespaceId": "default"	# Specified service namespace
}
```

The naming format requirements for `group` and `dataId` in `Nacos` are as follows, refer to the [Nacos documentation](https://nacos.io/zh-cn/docs/sdk.html):

- `dataId` only allows English characters and four special characters (".", ":", "-", "_"), not exceeding 256 bytes.
- `group` only allows English characters and four special characters (".", ":", "-", "_"), not exceeding 128 bytes.

> **Note:**
>
> If the passed `group` contains the illegal characters `=`, `&`, or `/`, the dynamic configuration core will automatically convert them into legal characters:
> `=` to `:`, `&` to `_`, `/` to `.`.

## Supported Components and Versions of the Dynamic Configuration Center

Currently, the supported configuration center components for Sermant are:

- [ZooKeeper](https://zookeeper.apache.org/releases.html), using version 3.6.3.
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/), using version 0.2.0.
- [Nacos](https://github.com/alibaba/nacos/releases), using version 2.1.0.
- [Apollo](https://github.com/apolloconfig/apollo/releases), using version 2.4.0.

## Startup and Result Verification

This tutorial demonstrates the dynamic configuration capabilities using the Demo plugin and microservices from the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/first-plugin-demo) repository. The plugin is configured with listeners to monitor dynamic configuration changes.

### 1. Preparation
- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-first-plugin-demo-2.0.0.tar.gz) the Demo binary package.
- [Download](https://zookeeper.apache.org/releases.html#download) the ZooKeeper server.
- [Download](https://servicecomb.apache.org/cn/release/kie-downloads) the Kie server.
- [Download](https://github.com/alibaba/nacos/releases/download/2.1.0/nacos-server-2.1.0.tar.gz) the Nacos server.
- [Download](https://www.apolloconfig.com/#/zh/deployment/distributed-deployment-guide) the Apollo server.

### 2. Obtain Demo Binary Product

Extract the Demo binary package to get the `agent\` directory files.

### 3. Verify ZooKeeper
Start the ZooKeeper server.

#### Start Demo Microservice

Modify the configuration in the `agent\config\config.properties` file to specify the configuration center type and server address:
```properties
# Specify the server address of the configuration center
dynamic.config.serverAddress=127.0.0.1:2181
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS
dynamic.config.dynamicConfigType=ZOOKEEPER
```

In the `agent` directory, execute the following command to mount the Sermant Agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Use the ZooKeeper command line tool or a visualization tool to publish the configuration. Here’s an example using the command line tool:

```shell
create /app=default
create /app=default/demo "test"
```

In this case, `app=default` is the group value, `demo` is the key value, and `test` is the value.

Once the node data is created successfully, the dynamic configuration has been successfully published to the configuration center.

#### Verification

Check the Demo microservice console for the following log output:

```
Configuration item has changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration was successfully published, and the Sermant Agent has detected the dynamic configuration.

### 4. Verify Kie

Start the Kie server.

#### Start Demo Microservice

Modify the configuration in the `agent\config\config.properties` file to specify the configuration center type and server address:
```properties
# Specify the server address of the configuration center
dynamic.config.serverAddress=127.0.0.1:30110
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS
dynamic.config.dynamicConfigType=KIE
```

In the `agent` directory, execute the following command to mount the Sermant Agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Publish the following dynamic configuration via Kie:

```properties
{
  "key": "demo",          
  "value": "test",              
  "labels": {
    "app": "default"     
  },
  "status": "enabled"
}
```

In this case, `app=default` is the group value, `demo` is the key value, and `test` is the value.

Once the node data is created successfully, the dynamic configuration has been successfully published to the configuration center.

#### Verification

Check the Demo microservice console for the following log output:

```
Configuration item has changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration was successfully published, and the Sermant Agent has detected the dynamic configuration.

### 5. Verify Nacos

Start the Nacos server.

#### Start Demo Microservice

Modify the configuration in the `agent\config\config.properties` file to specify the configuration center type and server address:
```properties
# Specify the server address of the configuration center
dynamic.config.serverAddress=127.0.0.1:8848
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS
dynamic.config.dynamicConfigType=NACOS
```

In the `agent` directory, execute the following command to mount the Sermant Agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Publish the following dynamic configuration via the console command line:

```properties
curl -d 'dataId=demo' \
  -d 'group=app:default' \
  -d 'namespaceId=default' \
  -d 'content=test' \
  -X POST 'http://ip:port/nacos/v2/cs/config'
```

In this case, `app:default` is the validated group value, `demo` is the key value, `test` is the content value, and `default` is the specified service namespace as in `agent/config/config.properties` under `service.meta.project`.

Once the node data is created successfully, the dynamic configuration has been successfully published to the configuration center.

#### Verification

Check the Demo microservice console for the following log output:

```
Configuration item has changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration was successfully published, and the Sermant Agent has detected the dynamic configuration.


### 6. Verify Apollo

Start the Apollo server.

#### Start Demo Microservice

Modify the configuration in the `agent\config\config.properties` file to specify the configuration center type and server address:
```properties
# Specify the server address of the configuration center
dynamic.config.serverAddress=127.0.0.1:8080
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS,APOLLO
dynamic.config.dynamicConfigType=APOLLO
```

In the `agent` directory, execute the following command to mount the Sermant Agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Configuration release can be performed via the visual interface on the Apollo server.Operations can also be performed based on the Open API:Log in with an admin account in the visual interface, then obtain the token by navigating to `Admin Tools` -> `Open Platform Authorization Management` -> `Create Third-Party App`, and execute the following commands with the authorized token included.
```shell
# create configuration
curl -X POST 'http://{portal_address}/openapi/v1/envs/{env}/apps/{appId}/clusters/{clusterName}/namespaces/{namespaceName}/items' \
-H 'Authorization: [your-token]' \
-H 'Content-Type: application/json' \
-d '{
    "key": "my.key.one",
    "value": "my value",
    "comment": "create configuration",
    "dataChangeCreatedBy": "[operator]"
}'

# publish configuration
curl -X POST 'http://{portal_address}/openapi/v1/envs/{env}/apps/{appId}/clusters/{clusterName}/namespaces/{namespaceName}/releases' \
-H 'Authorization: [your-token]' \
-H 'Content-Type: application/json' \
-d '{
    "appId": "[appId]",
    "clusterName": "[clusterName]",
    "namespaceName": "[namespaceName]",
    "releaseTitle": "config publishment", 
    "releaseComment": "update my.key.one", 
    "releasedBy": "[operator]"
}'
```

Once the node data is created successfully, the dynamic configuration has been successfully published to the configuration center.

#### Verification

Check the Demo microservice console for the following log output:

```
Configuration item has changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration was successfully published, and the Sermant Agent has detected the dynamic configuration.