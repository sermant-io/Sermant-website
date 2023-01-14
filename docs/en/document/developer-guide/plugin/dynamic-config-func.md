# Dynamic Configuration

This document describes how the Sermant plugin uses the dynamic configuration function.

**Dynamic configuration function** is one of the [core services of sermant-core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core). This feature allows Sermant to pull configurations from a dynamic configuration center for rich and diverse service governance capabilities.

Refer to [Sermant Dynamic Configuration Center User Manual](https://sermant.io/en/document/user-guide/configuration-center.html) on how to use the dynamic configuration center. The following section describes how to develop dynamic-configuration-related capabilities in plugins.

## Dynamic Configuration API

The functionality `API` of **Dynamic Configuration Service** is provided by the abstract class [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) , which implements three interfaces, as seen in [API](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api) directory, The concrete interface is as follows:：

| Interface                                                    | Method                                                       | Explanation                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | String getConfig(String)                                     | Get the configured value for a key (default group).          |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean publishConfig(String, String)                        | Set value for a key (default group) .                        |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean removeConfig(String)                                 | Remove a configured value for a key (default group).         |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | List\<String> listKeys()                                     | Get all keys (default group).                                |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean addConfigListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | Add a listener for a key (default group).                    |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean removeConfigListener(String)                         | Remove a listener for a key (default group).                 |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | String getConfig(String, String)                             | Get the configured value for a key in the group.             |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean publishConfig(String, String, String)                | Set value for a key in the group.                            |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean removeConfig(String, String)                         | Remove the configured value for a key in the group.          |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | Add a listener for a key in the group.                       |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean removeConfigListener(String, String)                 | Remove a listener for a key in the group.                    |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | List\<String> listKeysFromGroup(String)                      | Get all keys in the group.                                   |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | boolean addGroupListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | Add listeners for all keys in the group.                     |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | boolean removeGroupListener(String)                          | Remove listeners for all keys in the group.                  |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java) | boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | Add a listener for a key(default group). Whether to trigger the initialization event depends on the input parameters |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | Add a listener for a key in the group. Whether to trigger the initialization event depends on the input parameters. |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | Add listeners for all keys in the group. Whether to trigger the initialization event depends on the input parameters. |

Above all, two concepts need to be clear:

- `Key`, a single reference to a dynamical configuration key
- `Group`, a dynamical configuration set of groups, often used to distinguish between users

As you can see, the above `API` is mainly divided into data adding, deleting, querying and modifying operations, and add/remove operations of the listener's [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java). The latter event callback is a crucial part of the functionality of the **Dynamic Configuration Service**, which is the main feature of the plugin using **Dynamic Configuration Service**.

Also, in the [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) interface, all the `API` defined are `API` without `Group`. They will actually use the default `Group` and be fixed to `API` of [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) in [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java). The default `Group` can be modified via `dynamic.config.default_group` in the **unified configuration file** `config.properties`.

Finally, besides the above service interfaces, there are a few other interfaces, configurations, or entities that developers need to pay attention to:

- Static configuration [DynamicConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/config/DynamicConfig.java) for **Dynamic Configuration Service**, whose parameters configuration refers to  [Sermant Dynamic Configuration Center User Manual](https://sermant.io/en/document/user-guide/configuration-center.html) .

- **Dynamic configuration service implementation type**[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java), contains:

  | Enum      | Explanation       |
  | :-------- | :---------------- |
  | ZOOKEEPER | ZooKeeper         |
  | KIE       | ServiceComb Kie   |
  | NOP       | No implementation |

- **Dynamic configuration listener** [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), which contains the following interface methods:

  | Method                                                       | Explanation                                                  |
  | :----------------------------------------------------------- | :----------------------------------------------------------- |
  | void process([DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)) | Callback interface for handling change events of configuration |

- **Change events of dynamic configuration** [DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java), whose member properties are as follows:

  | Type                                                         | Property   | Explanation                        |
  | :----------------------------------------------------------- | :--------- | :--------------------------------- |
  | String                                                       | key        | Key of configuration               |
  | String                                                       | group      | Group of configuration             |
  | String                                                       | content    | Content of configuration           |
  | [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java) | changeType | Type of configuration change event |

- **Type of change events of dynamic configuration** [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java), which contains following four kinds:

  | Enum   | Explanation                             |
  | :----- | :-------------------------------------- |
  | INIT   | Initial response when adding a listener |
  | CREATE | Event of adding new configuration       |
  | MODIFY | Event of modifying configuration        |
  | DELETE | Event of deleting configuration         |

### Dynamic Configuration Development Example

The `DynamicConfigService` instance of the dynamic configuration function can be obtained with the following code:

```java
DynamicConfigService service = ServiceManager.getService(DynamicConfigService.class);
```

Once the service instance is obtained, you can invoke the API listed in the table above to take the appropriate action. For example, to register a listener, you can do this by:

```java
// ${group} is user group，${key} is the key listened. For zookeeper, the path is: / + ${group} + ${key}
// if ${group} do not exist，it will set the value by dynamicconfig.default_group in unified configuration
service.addConfigListener("${key}", "${group}", new DynamicConfigListener() {
  @Override
  public void process(ConfigChangedEvent event) {
    // do something
  }
});
```

Once the listener is registered, the `process` method will be triggered when the server creates, deletes, modifies, or adds child nodes.

Examples of other interfaces are not listed here, you can refer to the API description above.