# Dynamic Configuration Center User Manual

This document introduces the scenarios, model descriptions, and usage of the Dynamic Configuration Center in Sermant.

## Scenarios and Positioning of the Dynamic Configuration Center in Sermant

The Dynamic Configuration Center is a supporting component for Sermant's dynamic configuration feature. This feature allows Sermant to pull configurations from the Dynamic Configuration Center to achieve diverse service governance capabilities. Users can enable dynamic configuration as needed and deploy the Dynamic Configuration Center.

The configuration center enables Sermant to have key dynamic configuration capabilities on top of static configurations, addressing the issue of unchangeable configurations provided by the latter. For example:

- In the flow control plugin, dynamic flow control is achieved through the Sermant Dynamic Configuration Center, which manages the configuration and distribution of flow tags and control rules.
- In the routing plugin, the configuration and distribution of label routing rules are also implemented through this dynamic configuration capability.

Since there are many mature open-source products in the industry for real-time configuration centers, Sermant does not provide a standalone implementation of a configuration center but integrates with open-source configuration centers to achieve the business goal of real-time dynamic configuration of service governance rules.

In terms of implementation, Sermant Agent defines a set of general interfaces for dynamic configuration internally. Based on this architecture:

- Users determine the type of configuration center Sermant interfaces with through Sermant Agent's configuration. In operational scenarios, users can directly operate the Dynamic Configuration Center according to the user manuals of various service governance plugins to achieve dynamic configuration goals.
- Developers need only interface with Sermant’s general dynamic configuration interface during Plugin development to implement dynamic configuration functionality without needing to focus on various selection and implementation details of the configuration center itself.

The following architecture diagram illustrates the principle of this architecture.

<MyImage src="/docs-img/dynamic-configuration-center-en.png"/>

## Parameter Configuration

For configuration details of the Dynamic Configuration Center, please refer to the corresponding open-source dynamic configuration centers (e.g., [ZooKeeper](https://zookeeper.apache.org/releases.html), [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/), [Nacos](https://github.com/alibaba/nacos/releases)). This document does not elaborate further.

First, enable the dynamic configuration service by setting `agent.service.dynamic.config.enable=true` in the product package `agent/config/config.properties` of Sermant Agent. Other parameters related to the dynamic configuration center in Sermant Agent can also be configured in this file.

## Sermant Dynamic Configuration Center Model

The configuration model in Sermant can be illustrated by the [KeyGroupService.publishConfig](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/api/KeyGroupService.java) interface function in Sermant Agent.

```java
/**
 * Set the configuration value for a key in a group.
 *
 * @param key     key
 * @param group   group
 * @param content configuration value
 * @return success
 */
boolean publishConfig(String key, String group, String content);
```

In this example, the two parameters for determining configuration items in Sermant Agent are:

- key: The key for the smallest configuration unit.
- group: The group, similar to a prefix for the key. Sermant primarily uses Group to interface with some configuration center tenant isolation features.

Different configuration centers have different matching models for group and key. Details are provided below.

For users, using the Dynamic Configuration Center requires obtaining an instance of DynamicConfigService during plugin development and calling the various abstract interfaces provided by `DynamicConfigService` according to their specific scenarios for corresponding service governance. Detailed API interface analysis and development guidance can be found in the developer guide's [Dynamic Configuration Function Development Guide](../developer-guide/dynamic-config-func.md).

## Sermant’s Implementation of Configuration Models Based on Different Dynamic Configuration Centers

The following sections discuss typical implementations of several configuration centers. Understanding these model implementations helps users find the corresponding configuration items in different configuration centers and perform dynamic configuration to achieve service governance management goals.

### ZooKeeper-Based Configuration Model Implementation

For `ZooKeeper` servers, dynamic configuration refers to the value of `ZooKeeper` nodes, where `Key` and `Group` should be elements in the node path. Since `Group` includes user-specific information, it should be used as a prefix in the node path, with the `Key` value as the latter part:

```txt
/${group}/${key} -> ${value}
```

### ServiceComb Kie-Based Configuration Model Implementation

For `Kie` services, dynamic configuration refers to `Kie` configuration keys. `Kie` queries associated configurations based on labels, with `Key` and `Group` as elements of the associated configuration. `Key` is the name of the configuration key, and `Group` is the label associated with the `Key`. Each `Key` can be configured with one or more labels, usually in the following format:

```properties
{
  "key": "keyName",                # Configuration key
  "value": "value",                # Configuration value
  "labels": {
    "service": "serviceName"     # Label, kv format, supporting one or more
  },
  "status": "enabled"
}
```

Compared to `ZooKeeper`, `Kie` focuses more on `Group`, and the format of the values is different. The format for `Kie` values is as follows:

```txt
groupKey1=groupValue1[&groupKey2=groupValue2...]
```

> Here, `groupKey` is the label key, `groupValue` is the label value, and multiple labels are concatenated with `&`. `Group` can be generated using `LabelGroupUtils#createLabelGroup`.
>
> **Special Note:**
>
> If the provided `Group` does not match the above format, the label `GROUP=providedGroup` will be added by default.

### Nacos-Based Configuration Model Implementation

For `Nacos` services, dynamic configuration refers to `Nacos` configuration values, which include `namespaceId`, `group`, and `dataId`. The `namespaceId` defaults to the `service.meta.project` in `agent/config/config.properties` specifying the service namespace; `group` aligns with the dynamic configuration core's `group`; `dataId` is set to the dynamic configuration core's `Key`, i.e., the configuration key name, in the following format:

```properties
{
    "group": "Group",         # Configuration group
    "dataId": "Key",          # Configuration key
    "content": "config",      # Configuration value
    "namespaceId": "default"  # Specified service namespace
}
```

`Nacos` has naming format requirements for `group` and `dataId` as follows; for details, refer to the [Nacos documentation](https://nacos.io/zh-cn/docs/sdk.html):

- `dataId` allows only English characters and four special characters (".", ":", "-", "_"), with a maximum of 256 bytes.
- `group` allows only English characters and four special characters (".", ":", "-", "_"), with a maximum of 128 bytes.

> **Special Note:**
>
> If the provided `group` contains illegal characters such as `=`, `&`, or `/`, the dynamic configuration core will automatically convert them to legal characters: `=` to `:`, `&` to `_`, `/` to `.`.

## Components and Versions Supported by the Dynamic Configuration Center

Currently, Sermant supports the following configuration center components:

- [ZooKeeper](https://zookeeper.apache.org/releases.html), version 3.6.3.
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/), version 0.2.0.
- [Nacos](https://github.com/alibaba/nacos/releases), version 2.1.0.

## Startup and Result Verification

This tutorial demonstrates dynamic configuration capabilities using the Demo plugin and microservices from the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/first-plugin-demo) repository, which includes a listener to monitor changes in dynamic configurations.

### 1 Preparation

- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-first-plugin-demo-2.0.0.tar.gz) the Demo binary package
- [Download](https://zookeeper.apache.org/releases.html#download) the ZooKeeper server
- [Download](https://servicecomb.apache.org/cn/release/kie-downloads) the Kie server
- [Download](https://github.com/alibaba/nacos/releases/download/2.1.0/nacos-server-2.1.0.tar.gz) the Nacos server

### 2 Obtain Demo Binary Package

Extract the Demo binary package to get the `agent\` directory files.

### 3 Verify ZooKeeper

Start the ZooKeeper server.

#### Starting Demo Microservice

Modify the `agent\config\config.properties` file to specify the configuration center type and server address:
```properties
# Specify the address of the configuration center server
dynamic.config.serverAddress=127.0.0.1:2181
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS
dynamic.config.dynamicConfigType=ZOOKEEPER
```

Execute the following command in the `agent` directory to mount the sermant-agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Use the ZooKeeper command line tool or a visualization tool to publish the configuration. Here, we use the command line tool as an example. Execute the following commands:

```shell
create /app=default
create /app=default/demo "test"
```

In this, `app=default` is the group value, `demo` is the key value, and `test` is the value.

After successfully creating the node data, the dynamic configuration has been published to the configuration center.

#### Verification

Check if the Demo microservice console contains the following log output:

```log
Configuration item changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration has been successfully published and the Sermant Agent has detected the dynamic configuration.

### 4 Verify Kie

Start the Kie server.

#### Starting Demo Microservice

Modify the `agent\config\config.properties` file to specify the configuration center type and server address:
```properties
# Specify the address of the configuration center server
dynamic.config.serverAddress=127.0.0.1:30110
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS
dynamic.config.dynamicConfigType=KIE
```

Execute the following command in the `agent` directory to mount the sermant-agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Publish the following dynamic configuration through Kie:

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

In this, `app=default` is the group value, `demo` is the key value, and `test` is the value.

After successfully creating the node data, the dynamic configuration has been published to the configuration center.

#### Verification

Check if the Demo microservice console contains the following log output:

```log
Configuration item changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration has been successfully published and the Sermant Agent has detected the dynamic configuration.

### 5 Verify Nacos

Start the Nacos server.

#### Starting Demo Microservice

Modify the `agent\config\config.properties` file to specify the configuration center type and server address:

```properties
# Specify the address of the configuration center server
dynamic.config.serverAddress=127.0.0.1:8848
# Specify the type of dynamic configuration center, options are NOP (no implementation), ZOOKEEPER, KIE, NACOS
dynamic.config.dynamicConfigType=NACOS
```

Execute the following command in the `agent` directory to mount the sermant-agent and start the Demo microservice:

```shell
java -javaagent:sermant-agent.jar -jar Application.jar
```

#### Publish Configuration

Publish the following dynamic configuration through the console command line:

```properties
curl -d 'dataId=demo' \
  -d 'group=app:default' \
  -d 'namespaceId=default' \
  -d 'content=test' \
  -X POST 'http://ip:port/nacos/v2/cs/config'
```

In this, `app:default` is the legalized group value, `demo` is the key value, `test` is the content value, and `default` is the specified service namespace, which corresponds to `agent/config/config.properties`'s `service.meta.project`.

After successfully creating the node data, the dynamic configuration has been published to the configuration center.

#### Verification

Check if the Demo microservice console contains the following log output:

```log
Configuration item changed, value: test
```

If the log output is correct, it indicates that the dynamic configuration has been successfully published and the Sermant Agent has detected the dynamic configuration.