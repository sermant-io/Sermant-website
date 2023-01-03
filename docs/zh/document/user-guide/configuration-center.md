# 配置中心使用手册

配置中心为Sermant动态配置功能配套组件，该功能允许Sermant动态从配置中心拉取配置以实现丰富多样的服务治理能力。用户可按需开启动态配置能力并部署配置中心。本文介绍如何使用配置中心。

配置中心在Sermant服务治理能力中扮演重要的角色。例如，在流控插件中，流量标记和流控规则的配置和下发都是通过Sermant动态配置和配置中心作为媒介来实现的动态流量控制；在路由插件中，标签路由规则的配置下发也是通过这套配置中心能力得以生效。

配置中心使得Sermant在静态配置的基础上，具备了动态配置的关键能力，解决了前者提供的配置不可改变的问题，这是Sermant的服务治理多样化的实现基础。

## 动态配置的统一模型

### 动态配置API

**动态配置服务**的服务功能`API`由[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)抽象类提供，其实现三个接口，见于[api](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api)目录中，具体接口如下所示：

|接口|方法|解析|
|:-|:-|:-|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|String getConfig(String)|获取某个键的配置值(默认组)|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean publishConfig(String, String)|设置某个键的配置值(默认组)|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean removeConfig(String)|移除某个键的配置值(默认组)|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|List\<String> listKeys()|获取所有键(默认组)|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java))|为某个键添加监听器(默认组)|
|[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)|boolean removeConfigListener(String)|移除某个键的监听器(默认组)|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|String getConfig(String, String)|获取组下某个键的配置值|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean publishConfig(String, String, String)|设置组下某个键的配置值|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean removeConfig(String, String)|移除组下某个键的配置值|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean addConfigListener(String, String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java))|为组下某个键添加监听器|
|[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)|boolean removeConfigListener(String, String)|移除组下某个键的监听器|
|[GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java)|List\<String> listKeysFromGroup(String)|获取组中所有键|
|[GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java)|boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java))|为组下所有的键添加监听器|
|[GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java)|boolean removeGroupListener(String)|移除组下所有键的监听器|
|[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)|boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean)|为某个键添加监听器(默认组)，根据入参决定是否触发初始化事件|
|[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)|boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean)|为组下某个键添加监听器，根据入参决定是否触发初始化事件|
|[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)|boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean)|为组下所有的键添加监听器，根据入参决定是否触发初始化事件|

以上，需要明确两个概念：

- `Key`，单指某个动态配置的键
- `Group`，指一系列动态配置的分组，通常用于区分使用者

通过观察可以发现，以上的`API`主要分为数据的增删查改操作，以及监听器的[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)增删操作，其中后者的事件回调是**动态配置服务**得以实现功能中至关重要的一环，也是插件中使用**动态配置服务**的主要功能。

另外，在[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)接口中定义的所有`API`都是不带`Group`的`API`，它们在[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)中其实都会使用默认`Group`修正为[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)的`API`，这点需要注意。默认`Group`可以通过**统一配置文件**`config.properties`的`dynamic.config.defaultGroup`修改。

最后，除了以上的服务接口以外，使用者还需要关注一些其他接口、配置或实体：

**动态配置服务**的静态配置[DynamicConfig](https://github.com/huaweicloud/Sermant/blob/0.9.x/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/config/DynamicConfig.java)，对应在sermant-agent的产品包agent/config/config.properties中涉及以下配置：

|类型|属性|统一配置值|解析|
|:-|:-|:-|:-|
|int|timeoutValue|dynamic.config.timeoutValue|服务器连接超时时间，单位：ms|
|String|defaultGroup|dynamic.config.defaultGroup|默认分组|
|String|serverAddress|dynamic.config.serverAddress|服务器地址，必须形如：{@code host:port[(,host:port)...]}|
|[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java)|serviceType|dynamic.config.dynamicConfigType|服务实现类型，取NOP、ZOOKEEPER、KIE|
- **动态配置服务**实现类型[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java)，含以下几种类型：
  
  |枚举值|解析|
  |:-|:-|
  |ZOOKEEPER|ZooKeeper实现|
  |KIE|ServiceComb Kie实现|
  |NOP|无实现|
- 动态配置监听器[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)，其中包含的接口方法如下：
  |方法|解析|
  |:-|:-|
  |void process([DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java))|处理配置改变事件的回调接口|
- 动态配置改变事件[DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)，其成员属性如下：
  |类型|属性|解析|
  |:-|:-|:-|
  |String|key|配置键|
  |String|group|配置分组|
  |String|content|配置信息|
  |[DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)|eventType|事件类型|
- 动态配置改变事件类型[DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)，含以下四种：
  |枚举值|解析|
  |:-|:-|
  |INIT|添加监听器时的初始化响应|
  |CREATE|配置新增事件|
  |MODIFY|配置信息修改事件|
  |DELETE|配置删除事件|

### ZooKeeper的实现

对于`ZooKeeper`服务器来说，所谓的动态配置就是`ZooKeeper`节点的值，至于`Key`和`Group`应当作为构建**节点路径**的元素。考虑到`Group`包含区别使用者的信息，应当作为**节点路径**的前缀，这样`Key`值则作为后半部分存在：
```txt
/${group}/${key} -> ${value}
```

至于监听器[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)，则需要转换为`ZooKeeper`的`Watcher`。

`ZooKeeper`实现见于zookeeper包，主要包含ZooKeeperDynamicConfigService和ZooKeeperBufferedClient两个类：

- ZooKeeperDynamicConfigService是[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)的`ZooKeeper`实现类，主要职责是完成下面的参数转换：
  
  - `Key`和`Group` -> `ZooKeeper`节点路径
  - [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java) -> `ZooKeeper`的`Watcher`。
  
  将他们解析完毕之后，交由ZooKeeperBufferedClient做业务操作。

- ZooKeeperBufferedClient，其主要功能是对原生`ZooKeeper`客户端进行包装，封装其原生的功能，提供更为高阶的`API`：
  |方法|解析|
  |:-|:-|
  |boolean ifNodeExist(String)|判断节点是否存在|
  |String getNode(String)|查询节点内容|
  |boolean createParent(String)|创建节点的前置节点|
  |boolean updateNode(String, String)|更新节点内容，不存在时自动创建|
  |boolean removeNode(String)|移除节点|
  |List\<String> listAllNodes(String)|查询节点下所有子孙节点的路径集合|
  |boolean addDataLoopWatch(String, Watcher, BreakHandler)|添加循环的临时数据监听器，该监听器将在触发后重新注册，直到接收到移除监听器事件注意，当同一节点的其他监听器被精准移除时，由于该监听器无法鉴别到底是不是移除自身，因此会选择放弃循环注册|
  |boolean addPersistentRecursiveWatches(String, Watcher)|添加持久递归的监听器，对子孙节点有效|
  |boolean removeDataWatches(String)|移除数据监听器|
  |boolean removeAllWatches(String)|移除节点下所有的监听器，含子孙节点|
  |void close()|关闭`ZooKeeper`客户端|

### Kie的实现

对于`Kie`服务来说，所谓动态配置就是`Kie`配置的键值，`Kie`是基于标签去查询关联配置， 至于`Key`与`Group`则是关联配置的元素。`Key`即配置的键的名称，而`Group`则是关联`Key`的标签， 每一个`Key`都可配置一个或者多个标签，其格式往往如下:

```properties
{
  "key": "keyName",                # 配置键
  "value": "value",                # 配置值
  "labels": {
    "service": "serviceName"     #标签，kv形式，支持一个或者多个
  },
  "status": "enabled"
}
```

相对于`Zookeeper`, `Kie`更专注于`Group`, 其传值格式也有所不同，`Kie`的传值格式如下:

```properties
groupKey1=groupValue1[&groupKey2=groupVaue2...]
```

> 其中`groupKey`为标签键， `groupValue`则为标签值，多个标签使用`&`拼接；`Group`可通过LabelGroupUtils#createLabelGroup生成
>
> **特别说明：**
>
>  若传入的`Group`非以上格式，则会默认添加标签`GROUP=传入Group`

`Kie`的实现见于包kie, 主要包含KieDynamicConfigService、LabelGroupUtils与SubscriberManager三个类：

- KieDynamicConfigService是[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)的`Kie`实现类， 主要职责是封装SubscriberManager的订阅API以及`Group`的`Key`管理

- LabelGroupUtils则是负责`Group`转换，主要包含以下API：

  | 方法                        | 解析                             |
  | --------------------------- | -------------------------------- |
  | createLabelGroup（Map）     | 创建标签，多个标签使用KV形式传入 |
  | getLabelCondition（String） | 将Group转换为请求的条件          |
  | isLabelGroup（String）      | 判断是否为Kie的标签              |

- SubscriberManager主要职责是管理`Group`的所有订阅者以及进行数据更新通知；其会根据订阅的Group，即标签组，与`Kie`建立连接请求任务，动态监听数据更新变化；该类主要包含以下API：

  | 方法                                                         | 解析                                                         |
  | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | boolean addGroupListener(String, DynamicConfigListener, boolean) | 订阅标签监听，由SubscriberManager管理，建立监听任务，并提供首次订阅通知能力 |
  | boolean removeGroupListener(String, DynamicConfigListener)   | 移除标签监听                                                 |
  | boolean publishConfig(String, String, String)                | 发布Kie配置                                                  |

## 配置中心支持的组件及版本

目前Sermant支持的配置中心组件为:

- [ZooKeeper](https://zookeeper.apache.org/releases.html)，使用版本为3.6.3。
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/)，使用的版本为0.2.0.

## 操作和结果验证

本教程使用[Sermant-examples](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/template)仓库中的demo插件来进行动态配置能力的演示，该插件中实现添加监听器以监听动态配置变化。

### Zookeeper

#### 启动

首先启动配置中心Zookeeper，Zookeepr部署可自行查找相关资料。

然后参考[sermant-agent使用手册](sermant-agent.md)启动和结果验证一节，挂载sermant-agent启动宿主应用。

#### 发布配置

使用Zookeeper命令行工具或可视化工具发布配置。此处以命令行工具为例，执行以下命令：

```shell
create /app=default/demo "test"
```

其中`app=default`即为group的值，`demo`即为key值，`test`为value值。

创建节点数据成功后，即成功在配置中心发布了动态配置。

#### 验证

查看Sermant日志文件sermant-0.log，默认日志文件路径为`./logs/sermant/core`。

观察日志文件中是否包含以下日志输出：

```
2022-12-29 15:48:01.963 [ERROR] [com.huawei.example.demo.common.DemoLogger] [println:42] [main-EventThread] [DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app=default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

如果日志输出无误，则说明动态配置发布成功，sermant-agent已监听到动态配置。

### Kie

Kie与Zoopeepr使用方式类似，唯一不同的是发布配置按照Kie的方式执行。

#### 启动

首先启动配置中心Kie，Kie部署可自行查找相关资料。

然后参考[sermant-agent使用手册](sermant-agent.md)启动和结果验证一节，挂载sermant-agent启动宿主应用。

#### 发布配置

通过Kie发布以下动态配置：

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

其中`app=default`即为group的值，`demo`即为key值，`test`为value值。

创建节点数据成功后，即成功在配置中心发布了动态配置。

#### 验证

查看Sermant日志文件sermant-0.log，默认日志文件路径为`./logs/sermant/core`。

观察日志文件中是否包含以下日志输出：

```
2022-12-29 16:45:14.456 [ERROR] [com.huawei.example.demo.common.DemoLogger] [println:42] [main-EventThread] [DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app=default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

如果日志输出无误，则说明动态配置发布成功，sermant-agent已监听到动态配置。

