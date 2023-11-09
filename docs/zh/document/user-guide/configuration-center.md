# 动态配置中心使用手册

本文介绍动态配置中心在Sermant使用中的场景、模型介绍以及如何使用。

## 动态配置中心在Sermant的场景和定位

动态配置中心为Sermant动态配置功能配套组件，该功能允许Sermant从动态配置中心拉取配置以实现丰富多样的服务治理能力。用户可按需开启动态配置能力并部署动态配置中心。


配置中心使得Sermant在静态配置的基础上，具备了动态配置的关键能力，解决了前者提供的配置不可改变的问题，这是Sermant的服务治理多样化的实现基础。例如，

- 在流控插件中，流量标记和流控规则的配置和下发都是通过Sermant动态配置中心作为媒介来实现的动态流量控制；
- 在路由插件中，标签路由规则的配置下发也是通过这套动态配置能力得以生效。

由于实时配置中心这块业界已有很多成熟的开源产品，因此Sermant本身并不提供配置中心的单独实现，而是通过对开源的配置中心进行集成，以达到服务治理规则可实时动态配置的业务目标。


在具体实现上，Sermant Agent内部定义了一套动态配置的通用接口。基于这种架构，

- 用户通过Sermant Agent的配置，来决定Sermant实际对接的配置中心类型。也可以在运维场景中，根据各服务治理插件的使用手册，直接操作动态配置中心，以达到动态配置的业务目标。
- 开发者在Plugin开发中，只需要对接Sermant动态配置的通用接口，即可实现动态配置的功能，而不需要关注动态配置中心本身的各种选型和实现。

以下架构图说明了该架构的原理。

<MyImage src="/docs-img/dynamic-configuration-center.png"/>

## 参数配置

动态配置中心的配置，请参见对应的开源动态配置中心 (如[ZooKeeper](https://zookeeper.apache.org/releases.html) 、[ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/)、[Nacos](https://github.com/alibaba/nacos/releases)) 。本文中不作详细赘述。

首先，Sermant Agent的产品包`agent/config/config.properties`中配置`agent.service.dynamic.config.enable=true`，将**启用动态配置服务**。其他Sermant Agent中对应的动态配置中心参数，也都可以在该文件中进行配置。

## Sermant动态配置中心模型

以Sermant Agent中的[KeyGroupService.publishConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)接口函数说明Sermant中的配置模型。

```java
/**
 * 设置组下某个键的配置值
 *
 * @param key     键
 * @param group   组
 * @param content 配置值
 * @return 是否操作成功
 */
boolean publishConfig(String key, String group, String content);
```


在上述例子中可见，在Sermant Agent中确定配置项的两个参数分别是：

- key: 最小配置单元的键值。
- group: 组，类似key的前缀。Sermant主要是通过Group来对接一些配置中心的租户隔离功能。

对于不同的配置中心，以group和key有不同的匹配模型。下文中详细说明。

对于使用者来说，使用动态配置中心需要在插件中开发过程中获取DynamicConfigService的实例，并根据自身场景调用`DynamicConfigService`提供的各种抽象接口来进行相应的服务治理。详细的API接口的解析以及开发指南可参考开发者指南中的[动态配置功能开发指导](../developer-guide/dynamic-config-func.md)。

## Sermant 基于不同动态配置中心的配置模型实现

以下章节讨论几个配置中心的典型实现。通过理解该模型实现，用户可以理解如何在不通配置中心找到对应的配置项，以及进行动态配置以达到服务治理管理的目标。

### 基于 Zookeeper 的配置模型实现

对于`ZooKeeper`服务器来说，所谓的动态配置就是`ZooKeeper`节点的值，至于`Key`和`Group`应当作为构建节点路径的元素。考虑到`Group`包含区别使用者的信息，应当作为节点路径的前缀，这样`Key`值则作为后半部分存在：

```txt
/${group}/${key} -> ${value}
```

### 基于 ServiceComb Kie 的配置模型实现

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

```txt
groupKey1=groupValue1[&groupKey2=groupVaue2...]
```

> 其中`groupKey`为标签键， `groupValue`则为标签值，多个标签使用&拼接；`Group`可通过`LabelGroupUtils#createLabelGroup`生成
>
> **特别说明：**
>
> 若传入的`Group`非以上格式，则会默认添加标签`GROUP=传入Group`

### 基于 Nacos 的配置模型实现

对于`Nacos`服务来说，所谓动态配置就是`Nacos`的配置值，`Nacos`本身包含`namespaceId`、`group`和`dataId`。其中`namespaceId`默认取值为`agent/config/config.properties`中的`service.meta.project`即指定服务命名空间；`group`与动态配置核心的`group`保持一致；`dataId`设置为动态配置核心的`Key`即配置的键名称，其格式如下:

```properties
{
    "group": "Group", 			# 配置组
    "dataId": "Key",  			# 配置键
    "content": "config", 		# 配置值
    "namespaceId": "default"	# 指定服务命名空间
}
```

`Nacos`对于`group`和`dataId`的命名格式要求如下，具体参考[Nacos文档](https://nacos.io/zh-cn/docs/sdk.html):

- `dataId`只允许英文字符和4种特殊字符（"."、":"、"-"、"\_"），不超过256字节。
- `group`只允许英文字符和4种特殊字符（"."、":"、"-"、"\_"），不超过128字节。

> **特别说明：**
>
> 若传入的`group`包含`=`、`&`、`/`三种非法字符时，动态配置核心将自动将其转换为合法字符：
> `=`转换为`:`、`&`转换为`_`、`/`转换为`.`。

## 动态配置中心支持的组件及版本

目前Sermant支持的配置中心组件为:


- [ZooKeeper](https://zookeeper.apache.org/releases.html)，使用版本为3.6.3。
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/)，使用的版本为0.2.0。
- [Nacos](https://github.com/alibaba/nacos/releases)，使用版本为2.1.0。

## 启动和结果验证

本教程使用[Sermant-examples](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/template)仓库中的demo插件来进行动态配置能力的演示，该插件中实现添加监听器以监听动态配置变化。

### Zookeeper

#### 启动

首先启动配置中心Zookeeper，Zookeepr部署可自行查找相关资料。

接下来以**Sermant-example**项目 [demo-application ](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application)为宿主应用，执行以下命令挂载sermant-agent启动demo-application:

```shell
# Run under Windows
java -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test -jar demo-application.jar
# Run under Linux
java -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test -jar demo-application.jar
```

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
[DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app=default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

如果日志输出无误，则说明动态配置发布成功，Sermant Agent已监听到动态配置。

### Kie

Kie与Zoopeepr使用方式类似，唯一不同的是发布配置按照Kie的方式执行。

#### 启动

首先启动配置中心Kie，Kie部署可自行查找相关资料。

接下来以**Sermant-example**项目 [demo-application ](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application)为宿主应用，执行以下命令挂载sermant-agent启动demo-application:

```shell
# Run under Windows
java -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test -jar demo-application.jar
# Run under Linux
java -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test -jar demo-application.jar
```

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
[DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app=default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

如果日志输出无误，则说明动态配置发布成功，sermant-agent已监听到动态配置。

### Nacos

Nacos与Zookeeper和Kie使用方式类似，唯一不同的是发布配置按照Nacos的方式执行。

#### 启动

首先启动配置中心Nacos，Nacos部署可自行查找相关资料。

接下来以**Sermant-example**项目 [demo-application ](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application)为宿主应用，执行以下命令挂载sermant-agent启动demo-application:

```shell
# Run under Windows
java -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test -jar demo-application.jar
# Run under Linux
java -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test -jar demo-application.jar
```

#### 发布配置

通过控制台命令行发布以下动态配置：

```properties
curl -d 'dataId=demo' \
  -d 'group=app:default' \
  -d 'namespaceId=default' \
  -d 'content=test' \
  -X POST 'http://ip:port/nacos/v2/cs/config'
```

其中`app:default`即为经过合法化后的group的值，`demo`即为key值，`test`为value值，`default`为指定服务命名空间即`agent/config/config.properties`中的`service.meta.project`。

创建节点数据成功后，即成功在配置中心发布了动态配置。

#### 验证

查看Sermant日志文件sermant-0.log，默认日志文件路径为`./logs/sermant/core`。

观察日志文件中是否包含以下日志输出：

```
[DemoDynaConfService]-DynamicConfigEvent{key='demo', group='app:default', content='test', eventType=CREATE} com.huaweicloud.sermant.core.service.dynamicconfig.common.DynamicConfigEvent[source=demo,app=default]
```

如果日志输出无误，则说明动态配置发布成功，sermant-agent已监听到动态配置。
