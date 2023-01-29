# 动态配置

本文主要介绍如何在插件开发中如何使用动态配置的能力，**动态配置**允许Sermant从动态配置中心获取配置以实现丰富多样的服务治理能力。在**Sermant**场景中如何使用动态配置中心可参考[Sermant动态配置中心使用手册](../user-guide/configuration-center.md)。 

## 动态配置服务API

**动态配置功能**的服务功能`API`由[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)抽象类提供，其实现三个接口，见于[API](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api)目录中，具体接口如下所示：

| 接口                                                         | 方法                                                         | 解析                                                       |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------- |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | String getConfig(String)                                     | 获取某个键的配置值(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean publishConfig(String, String)                        | 设置某个键的配置值(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean removeConfig(String)                                 | 移除某个键的配置值(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | List\<String> listKeys()                                     | 获取所有键(默认组)                                         |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | 为某个键添加监听器(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean removeConfigListener(String)                         | 移除某个键的监听器(默认组)                                 |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | String getConfig(String, String)                             | 获取组下某个键的配置值                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean publishConfig(String, String, String)                | 设置组下某个键的配置值                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean removeConfig(String, String)                         | 移除组下某个键的配置值                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean addConfigListener(String, String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | 为组下某个键添加监听器                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean removeConfigListener(String, String)                 | 移除组下某个键的监听器                                     |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | List\<String> listKeysFromGroup(String)                      | 获取组中所有键                                             |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | 为组下所有的键添加监听器                                   |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | boolean removeGroupListener(String)                          | 移除组下所有键的监听器                                     |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | 为某个键添加监听器(默认组)，根据入参决定是否触发初始化事件 |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | 为组下某个键添加监听器，根据入参决定是否触发初始化事件     |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | 为组下所有的键添加监听器，根据入参决定是否触发初始化事件   |

以上，需要明确两个概念：

- `Key`，单指某个动态配置的键
- `Group`，指一系列动态配置的分组，通常用于区分使用者

通过观察可以发现，以上的`API`主要分为数据的增删查改操作，以及监听器的[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)增删操作，其中后者的事件回调是**动态配置服务**得以实现功能中至关重要的一环，也是插件中使用**动态配置服务**的主要功能。

另外，在[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)接口中定义的所有`API`都是不带`Group`的`API`，它们在[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)中其实都会使用默认`Group`修正为[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)的`API`，这点需要注意。默认`Group`可以通过**统一配置文件**`config.properties`的`dynamic.config.defaultGroup`修改。

最后，除了以上的服务接口以外，开发者还需要关注一些其他接口、配置或实体：

**动态配置服务**的静态配置[DynamicConfig](https://github.com/huaweicloud/Sermant/blob/0.9.x/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/config/DynamicConfig.java)，其参数配置可参考[Sermant动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html)。

**动态配置服务**实现类型[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java)，含以下几种类型：

- | 枚举值    | 解析                |
  | :-------- | :------------------ |
  | ZOOKEEPER | ZooKeeper实现       |
  | KIE       | ServiceComb Kie实现 |
  | NOP       | 无实现              |

- 动态配置监听器[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)，其中包含的接口方法如下：

  | 方法                                                         | 解析                       |
  | :----------------------------------------------------------- | :------------------------- |
  | void process([DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)) | 处理配置改变事件的回调接口 |

- 动态配置改变事件[DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)，其成员属性如下：

  | 类型                                                         | 属性      | 解析     |
  | :----------------------------------------------------------- | :-------- | :------- |
  | String                                                       | key       | 配置键   |
  | String                                                       | group     | 配置分组 |
  | String                                                       | content   | 配置信息 |
  | [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java) | eventType | 事件类型 |

- 动态配置改变事件类型[DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)，含以下四种：

  | 枚举值 | 解析                     |
  | :----- | :----------------------- |
  | INIT   | 添加监听器时的初始化响应 |
  | CREATE | 配置新增事件             |
  | MODIFY | 配置信息修改事件         |
  | DELETE | 配置删除事件             |

## 动态配置功能开发示例

动态配置功能的`DynamicConfigService`实例可以通过以下代码获取：

```java
DynamicConfigService service = ServiceManager.getService(DynamicConfigService.class);
```

获取服务实例之后，可以调用上文表格中列出的API进行相应的动作。例如，若需注册一个动态配置的监听器，可通过以下方法来实现：
```java
// ${group}为用户分组，${key}为监听的键，对zookeeper来说，监听的路径相当于: / + ${group} + ${key}
// 如果不传${group}，则会默认设置为统一配置中dynamicconfig.default_group对应的值
service.addConfigListener("${key}", "${group}", new DynamicConfigListener() {
  @Override
  public void process(ConfigChangedEvent event) {
    // do something
  }
});
```

注册监听器之后，当服务器对应节点发生创建、删除、修改、添加子节点等事件时，就会触发`process`函数。

其他接口的使用示例此处不一一列出，可参考上文的API描述。
