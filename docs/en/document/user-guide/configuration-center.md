# Sermant Dynamic Configuration Center User Manual

This paper introduces the scenario model of Dynamic Configuration Center in Sermant and how to use it.

## Dynamic Configuration Center in Sermant Scene and Positioning

The dynamic configuration center is a supporting component for the dynamic configuration function of Sermant, which allows Sermant to dynamically pull configuration from the configuration center to achieve a variety of service governance capabilities. Users can enable dynamic configuration capabilities and deploy dynamic configuration centers on demand.

Configuration center makes Sermant have the key ability of dynamic configuration on the basis of static configuration, and solves the problem of immutable configuration provided by the former, which is the implementation basis of service management diversification in Sermant. For example, 

- In the flowcontrol plugin, the configuration and delivery of traffic marking and flow control rules are realized by Sermant dynamic configuration and configuration center as the medium to achieve dynamic flow control. 

- In the routing plugin, the configuration of label routing rules is also effective through this configuration center capability.

There are many mature open source products in the field of real-time configuration center and Sermant does not provide a single implementation of configuration center, but integrates the open source configuration center to achieve the business goal of real-time dynamic configuration of service governance rules.

In the concrete implementation, sermant-agent defines a set of general interfaces for dynamic configuration. Based on this architecture,

- The user determines the type of configuration center that the Sermant actually connects to through the configuration of the sermant-agent. It is also possible to directly operate the dynamic configuration center in the operation and maintenance scenario according to the manual of each service governance plugin to achieve the business goal of dynamic configuration.
- In the development of plugins, developers only need the common interface of Sermant dynamic configuration to realize the function of dynamic configuration, and do not need to pay attention to the selection and implementation of the dynamic configuration center itself.

The following architecture diagram illustrates the principle of the architecture.

<MyImage src="/docs-img/dynamic-configuration-center.png"/>

## Parameter Configuration

For configuration of the dynamic configuration center, see the corresponding open source dynamic configuration center([ZooKeeper](https://zookeeper.apache.org/releases.html) , [ServiceComb Kie](). We will not go into details in this paper.

The corresponding parameters of dynamic configuration center in sermant-agent can be configured in sermant-agent product package `agent/config/config.properties`:

| Parameter Key                    | Description                                                  | Default Value  | Required |
| :------------------------------- | :----------------------------------------------------------- | -------------- | -------- |
| dynamic.config.timeoutValue      | Server connection timeout, in ms                             | 30000          | True     |
| dynamic.config.defaultGroup      | Default group                                                | sermant        | True     |
| dynamic.config.serverAddress     | Server address, configured like: {@code host:port[(,host:port)...]} | 127.0.0.1:2181 | True     |
| dynamic.config.dynamicConfigType | Dynamic config type: NOP、ZOOKEEPER、KIE                     | ZOOKEEPER      | True     |
| dynamic.config.connectRetryTimes | ZOOKEEPER: the number of configuration center reconnects when starting the Sermant | 5              | True     |
| dynamic.config.connectTimeout    | ZOOKEEPER: connection timeout to the configuration center when starting the Sermant | 1000           | True     |
| dynamic.config.userName          | ZOOKEEPER：user name                                         | -              | False    |
| dynamic.config.password          | ZOOKEEPER：password after encryption                         | -              | False    |
| dynamic.config.privateKey        | ZOOKEEPER：decryption key                                    | -              | False    |
| dynamic.config.enableAuth        | ZOOKEEPER：authorization switch                              | false          | False    |

## Sermant Dynamic Configuration Center Model

以sermant-agent中的[KeyGroupService.publishConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)接口函数说明Sermant中的配置模型。

The configuration model in Sermant is illustrated by the interface function [KeyGroupService.publishConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) in sermant-agent.

```java
/**
 * Sets the configuration value for a key under the group
 *
 * @param key     key
 * @param group   group
 * @param content configuration value
 * @return success
 */
boolean publishConfig(String key, String group, String content);
```

As you can see in the example above, the two parameters used to determine the configuration in sermant-agent are:

- `key`: the key value of the smallest configuration unit。
- `group`: group, like a prefix for `key`. Sermant mainly uses the group to be related with some configuration center tenant isolation function。

For different configuration centers, there are different matching models for group and key. This is explained in detail below.

For users, to use the dynamic configuration center, you need to obtain the instance of `DynamicConfigService` in the development process of the plugin, and call various abstract interfaces provided by `DynamicConfigService` according to their own scenarios to perform corresponding service governance. You can refer to [plugin function development related chapters](https://sermant.io/zh/document/developer-guide/dev-complex-plugin.html#%E5%8A%A8%E6%80%81%E9%85%8D%E7%BD%AE%E5%8A%9F%E8%83%BD) for detailed API interface parsing and development guide.

## Sermant Implementation of Configuration Model Based on Different Dynamic Configuration Centers

The following sections discuss several typical implementations of configuration centers. By understanding the implementation of the model, users can understand how to find the corresponding configuration items in different configuration centers and how to configure them dynamically to achieve the goal of service governance management.

### Implementation of Configuration Model Based on Zookeeper

For `ZooKeeper` servers, the dynamic configuration is the value of the ZooKeeper node. The `Key` and `Group` should be used as elements to build the **node path**. Since `Group` contains user-specific information, it should be the prefix string for the **node path** so that the `Key` value exists as the second half:

```txt
/${group}/${key} -> ${value}
```

### **Implementation of Configuration Model Based on ServiceComb Kie**

For the `Kie` service, the so-called dynamic configuration is the value of the `Kie'` configuration. `Kie` queries the associated configuration based on the label. `Key` and `Group` are the elements of the associated configuration. `Key` is the name of the configured Key, and `Group` is the label of the associated Key. Each `Key` can be configured with one or more labels. The format is usually as follows:

```properties
{
  "key": "keyName",                # key
  "value": "value",                # value
  "labels": {
    "service": "serviceName"     #labels, kv form and support multiple labels
  },
  "status": "enabled"
}
```

Compared with `Zookeeper`, `Kie` is more focused on `Group` and its value transfer format is different. The value transfer format of `Kie` is as follows:

```txt
groupKey1=groupValue1[&groupKey2=groupVaue2...]
```

> `groupKey` is the key of label, `groupValue` is the value of label. Multiple labels are spliced by `&`. `Group` could be  generated by LabelGroupUtils.
>
> **NOTE：**
>
> ​	If the input `Group` is not in the above format, the label `Group=input Group` will be added by default.

## Configuration Center and Version Supported

The configuration center components currently supported by Sermant are:

- [ZooKeeper](https://zookeeper.apache.org/releases.html), version 3.6.3.
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/), version 0.2.0.

## Operation and Result Validation

This document uses the demo plugin in [Sermant-examples](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/template) to demonstrate dynamic configuration capability, whose implementation adds a listener to listen for dynamic configuration changes.

### Zookeeper

#### Startup

First, start the configuration center Zookeeper. You can learn how to deployment it by official information.

Then refer to the [Sermant-agent User Manual](sermant-agent.md) startup and result verification section to start the host application mounting sermant-agent.

#### Publish Configuration

Use the Zookeeper command-line tool or visualization tool to publish configuration. Using a command-line tool as an example, enter the following command:

```shell
create /app=default/demo "test"
```

Where `app=default` is the group, `demo` is the key, and `test` is the value.

When the node data is successfully created, the dynamic configuration is successfully published in the configuration center.

#### Validation

Check out the sermant log file sermant-0.log. The default log file path is `./logs/sermant/core`.

Observe if the log file contains the following log output:

```
2022-12-29 15:48:01.963 [ERROR] [com.huawei.example.demo.common.DemoLogger] [println:42] [main-EventThread] [DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app=default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

If the log output is correct, it means that the dynamic configuration is published successfully and the sermant-agent has listened to the dynamic configuration.

### Kie

Kie is used in a similar way to Zoopeepr, with the only difference that publishing configuration is performed in the way of Kie.

#### Startup

First, start the configuration center Kie. You can learn how to deployment it by official information.

Then refer to the [Sermant-agent User Manual](sermant-agent.md) startup and result verification section to start the host application mounting sermant-agent.

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

Where `app=default` is the group, `demo` is the key, and `test` is the value.

When the node data is successfully created, the dynamic configuration is successfully published in the configuration center.

#### Validation

Check out the sermant log file sermant-0.log. The default log file path is `./logs/sermant/core`.

Observe if the log file contains the following log output:

```
2022-12-29 16:45:14.456 [ERROR] [com.huawei.example.demo.common.DemoLogger] [println:42] [main-EventThread] [DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app=default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

If the log output is correct, it means that the dynamic configuration is published successfully and the sermant-agent has listened to the dynamic configuration.

