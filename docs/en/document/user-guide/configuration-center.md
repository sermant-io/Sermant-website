# Configuration Center User Manual

## Function Introduction

The configuration center is a supporting component for the dynamic configuration function of Sermant, which allows Sermant to dynamically pull configuration from the configuration center to achieve a variety of service governance capabilities. Users can enable dynamic configuration capabilities and deploy configuration centers on demand.

Configuration center plays an important role in the service governance capability of Sermant. For example, in the flowcontrol plugin, the configuration and delivery of traffic marking and flow control rules are realized by Sermant dynamic configuration and configuration center as the medium to achieve dynamic flow control. In the routing plugin, the configuration of label routing rules is also effective through this configuration center capability.

Configuration center makes Sermant have the key ability of dynamic configuration on the basis of static configuration, and solves the problem of immutable configuration provided by the former, which is the implementation basis of service management diversification in Sermant.

## Unified Model for Dynamic Configuration

### Dynamic Configuration API

The functionality `API` of **Dynamic Configuration Service** is provided by the abstract class [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) , which implements three interfaces, as seen in [api](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api) directory, The concrete interface is as follows:：

|Interface|Method|Explanation|
|:-|:-|:-|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|String getConfig(String)|Get the configured value for a key (default group).|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean publishConfig(String, String)|Set value for a key (default group) .|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean removeConfig(String)|Remove a configured value for a key (default group).|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|List\<String> listKeys()|Get all keys (default group).|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean addConfigListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java))|Add a listener for a key (default group).|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean removeConfigListener(String)|Remove a listener for a key (default group).|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|String getConfig(String, String)|Get the configured value for a key in the group.|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean publishConfig(String, String, String)|Set value for a key in the group.|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean removeConfig(String, String)|Remove the configured value for a key in the group.|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java))|Add a listener for a key in the group.|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean removeConfigListener(String, String)|Remove a listener for a key in the group.|
|[GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java)|List\<String> listKeysFromGroup(String)|Get all keys in the group.|
|[GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java)|boolean addGroupListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java))|Add listeners for all keys in the group.|
|[GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java)|boolean removeGroupListener(String)|Remove listeners for all keys in the group.|
|[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)|boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean)|Add a listener for a key(default group). Whether to trigger the initialization event depends on the input parameters|
|[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)|boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean)|Add a listener for a key in the group. Whether to trigger the initialization event depends on the input parameters.|
|[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)|boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean)|Add listeners for all keys in the group. Whether to trigger the initialization event depends on the input parameters.|

Above all, two concepts need to be clear:

- `Key`, a single reference to a dynamical configuration key
- `Group`, a dynamical configuration set of groups, often used to distinguish between users

As you can see, the above `API` is mainly divided into data adding, deleting, querying and modifying operations, and add/remove operations of the listener's [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java). The latter event callback is a crucial part of the functionality of the **Dynamic Configuration Service**, which is the main feature of the plugin using **Dynamic Configuration Service**.

Also, in the [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) interface, all the `API` defined are `API` without `Group`. They will actually use the default `Group` and be fixed to `API` of [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) in [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java). The default `Group` can be modified via `dynamic.config.default_group` in the **unified configuration file** `config.properties`.

Finally, besides the above service interfaces, there are a few other interfaces, configurations, or entities that developers need to pay attention to:

- Static configuration [DynamicConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/config/DynamicConfig.java) for **Dynamic Configuration Service**, which involves the following configuration:
  |Type|Property|Key in Unified Configuration File|Explanation|
  |:-|:-|:-|:-|
  |int|timeoutValue|dynamic.config.timeoutValue|Timeout for server connection, unit: ms|
  |String|defaultGroup|dynamic.config.defaultGroup|Default group|
  |String|serverAddress|dynamic.config.serverAddress|Server address, must be of the form: {@code host:port[(,host:port)...]}|
  |[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java)|serviceType|dynamic.config.dynamicConfigType|Service implementation type, take NOP, ZOOKEEPER, KIE|
  
- **Dynamic configuration service implementation type**[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java), contains:
  
  |Enum|Explanation|
  |:-|:-|
  |ZOOKEEPER|ZooKeeper|
  |KIE|ServiceComb Kie|
  |NOP|No implementation|
  
- **Dynamic configuration listener** [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), which contains the following interface methods:
  
  |Method|Explanation|
  |:-|:-|
  |void process([DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java))|Callback interface for handling change events of configuration|
  
- **Change events of dynamic configuration** [DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java), whose member properties are as follows:
  
  |Type|Property|Explanation|
  |:-|:-|:-|
  |String|key|Key of configuration|
  |String|group|Group of configuration|
  |String|content|Content of configuration|
  |[DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)|changeType|Type of configuration change event|
  
- **Type of change events of dynamic configuration** [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java), which contains following four kinds:
  
  |Enum|Explanation|
  |:-|:-|
  |INIT|Initial response when adding a listener|
  |CREATE|Event of adding new configuration|
  |MODIFY|Event of modifying configuration|
  |DELETE|Event of deleting configuration|

#### ZooKeeper

For `ZooKeeper` servers, the dynamic configuration is the value of the ZooKeeper node. The `Key` and `Group` should be used as elements to build the **node path**. Since `Group` contains user-specific information, it should be the prefix string for the **node path** so that the `Key` value exists as the second half:
```txt
/${group}/${key} -> ${value}
```

As for [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), we convert it to a `Watcher` of `ZooKeeper`.

The implementation of `Zookeeper` could be found in zookeeper. It mainly contains ZooKeeperDynamicConfigService and ZooKeeperBufferedClient.

- ZooKeeperDynamicConfigService is an implementation of [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) for `ZooKeeper`, whose main duty is to complete the following parameter conversions:
  
  - `Key` and `Group` -> `ZooKeeper` node path
  - [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java) -> `Watcher` of `ZooKeeper`。
  
  After they are parsed, ZooKeeperBufferedClient will do the business operation.
- ZooKeeperBufferedClient, its main function is to wrap the native `ZooKeeper` client to provide higher-level `API`:
  
  |Method|Explanation|
  |:-|:-|
  |boolean ifNodeExist(String)|Check whether the node exists.|
  |String getNode(String)|Query node information.|
  |boolean createParent(String)|Create the parent node of a node.|
  |boolean updateNode(String, String)|Update the content of a node. If the node does not exist, it will be automatically created.|
  |boolean removeNode(String)|Remove a node|
  |List\<String> listAllNodes(String)|Query the path set of all descendant nodes under a node|
  |boolean addDataLoopWatch(String, Watcher, BreakHandler)|Add a temporary data watcher for a loop. This watcher will be re-registered after triggering until it receives a watcher remove event Note that when other watchers on the same node are accurately removed, the watcher will choose to abandon the loop registration because it cannot identify whether it has been removed.|
  |boolean addPersistentRecursiveWatches(String, Watcher)|Add a watches for persistent recursion, valid for descendant nodes|
  |boolean removeDataWatches(String)|Remove data watchers|
  |boolean removeAllWatches(String)|Remove all watchers under a node, including descendant nodes|
  |void close()|Close `ZooKeeper` client|

#### Kie

For the `Kie` service, the so-called dynamic configuration is the value of the `Kie'` configuration. `Kie` queries the associated configuration based on the label. `Key` and `Group` are the elements of the associated configuration. `Key` is the name of the configured Key, and `Group` is the label of the associated Key. Each `Key` can be configured with one or more labels. The format is usually as follows:

```properties
{
	"key": "keyName",                # key
	"value": "value",                # value
	"labels": {
		"service": "serviceName"     #label，support one or more
	},
	"status": "enabled"
}
```

Compared with `Zookeeper`, `Kie` is more focused on `Group` and its value transfer format is different. The value transfer format of `Kie` is as follows:

```properties
groupKey1=groupValue1[&groupKey2=groupValue2...]
```

> `groupKey` is the key of label, `groupValue` is the value of label. Multiple labels are spliced by `&`. `Group` could be  generated by LabelGroupUtils.
>
> **NOTE：**
>
> ​	If the input `Group` is not in the above format, the label `Group=input Group` will be added by default.

The implementation of `Kie` could be found in kie, which contains KieDynamicConfigService, LabelGroupUtils and SubscriberManager:

- KieDynamicConfigService is an implementation of [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) for `Kie`. Its main duty is to wrap the subscription API of SubscriberManager and the `Key` management of `Group`.

- LabelGroupUtils is used for conversion of `Group`, which contains following APIs：

  | Method                      | Explanation                                         |
  | --------------------------- | --------------------------------------------------- |
  | createLabelGroup（Map）     | Create labels and transfer multiple labels in KV    |
  | getLabelCondition（String） | Converts the `Group` to the condition for a request |
  | isLabelGroup（String）      | Check whether it is a label of `Kie`                |

- The main responsibility of SubscriberManager is to manage all the `Group` subscribers and to provide data update notifications. It will establish a connection request task with `Kie` according to the subscribed Group, namely the Label Group, and dynamically monitor data update changes. This class contains the following APIs:

  | Method                                                       | Explanation                                                  |
  | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | boolean addGroupListener(String, DynamicConfigListener, boolean) | And a listener for a label group , which is managed by SubscriberManager. Listening task will be established and the ability to notify the first subscription is provided. |
  | boolean removeGroupListener(String, DynamicConfigListener)   | Remove a label group listener.                               |
  | boolean publishConfig(String, String, String)                | Publish configuration of Kie                                 |

## Configuration Center and Version Supported

The configuration center components currently supported by Sermant are:

- [ZooKeeper](https://zookeeper.apache.org/releases.html), version 3.6.3.
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/), version 0.2.0.

## Operation and Result Validation

This document uses the demo plugin in [Sermant-examples](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/template)  to demonstrate dynamic configuration capability, whose implementation adds a listener to listen for dynamic configuration changes.

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

