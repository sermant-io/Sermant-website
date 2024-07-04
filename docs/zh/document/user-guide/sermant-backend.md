# Sermant Backend使用手册

Sermant Backend包含Sermant数据处理后端模块和前端信息展示模块，旨在为Sermant提供运行时的可观测能力，当前主要包括Sermant Agent心跳信息, 上报事件的接收和展示，webhook推送，配置管理等功能。

Sermant Backend与Sermant Agent配合使用。Sermant Agent挂载在宿主应用启动后作为数据发送端，可定时发送当前Sermant Agent的心跳数据(服务名、主机名、实例ID、版本号、IP、时间戳、挂载插件信息)，事件数据(Sermant Agent启停、核心服务启停、字节码增强、日志数据等)。Backend作为数据接收端，可接收处理Sermant Agent发送的心跳和事件等数据，将紧急事件推送至webhook，并在前端可视化展示，提供观测Sermant Agent运行状态的能力。

Sermant Backend与配置中心配合使用，可以管理配置中心的所有配置项，可以查看、新增、修改、删除配置项。

> 注：Sermant Backend为**非必要组件**，用户可按需部署。

## 参数配置

### Sermant Agent参数配置

Sermant Backend提供的实例状态管理和事件管理能力，需要依赖Sermant Agent上报的数据，所以在使用Sermant Backend时，需要先配置Sermant Agent中用于连接Sermant Backend、开启数据上报的相关参数，在配置文件`agent/config/config.properties`中修改以下配置：

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| agent.service.heartbeat.enable       | 心跳服务开关                |   false     | 否          |
| agent.service.gateway.enable        | 网关服务开关                    | false  | 开启心跳服务或者事件上报时必须           |
| gateway.nettyIp        | Netty服务端的IP                    | 127.0.0.1  | 否           |
| gateway.nettyPort        | Netty服务端的端口                    | 6888  | 否           |
| event.enable   | 事件上报开关           | false         | 否            |
| event.offerWarnLog   | 是否上报warn级别日志           | false         | 否            |
| event.offerErrorLog   | 是否上报error级别日志           | false         | 否            |
| event.sendInterval | 事件发送间隔（ms）          | 30000         | 开启事件上报时必须            |
| event.offerInterval   | 相同事件的上报间隔           | 300000         | 开启事件上报时必须           |

### Sermant Backend参数配置

Sermant Backend参数可在编译打包前通过`sermant-backend/src/main/resources/application.properties`配置文件进行修改，同时也支持在jar包启动前通过-D参数或环境变量的方式进行配置。

#### 基础参数

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| server.port        | Sermant Backend的服务占用端口                | 8900       | 否           |
| netty.port         | Netty消息接收端口                    | 6888  | 否           |
| netty.wait.time    | Netty的读等待时间，单位：s           | 60         | 否           |

#### 实例状态参数

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| max.effective.time | 判断应用心跳存活的有效时间，单位：ms | 60000      | 否           |
| max.cache.time     | 应用心跳在缓存中的有效时间，单位：ms | 600000     | 否           |

#### 事件管理参数

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| database.type     | 事件存储类型，当前支持redis数据库和内存 | MEMORY     | 否           |
| database.address     | redis数据库地址 | 127.0.0.1:6379     | 否           |
| database.user     | redis数据库用户名 | default     | 否           |
| database.password     | redis数据库密码 | null     | 否           |
| database.event.expire     | 事件过期时间，单位：天 | 7     | 否           |
| webhook.eventpush.level     | webhook事件推送级别，支持EMERGENCY,IMPORTANT,NORMAL三种级别;支持飞书和钉钉两种webhook | EMERGENCY     | 否           |

#### 配置管理参数

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| dynamic.config.enable    | 配置管理的开关 | true     | 否           |
| dynamic.config.namespace    | 默认的命名空间（连接Nacos配置中心时使用） | default     | 连接配置中心Nacos时必须          |
| dynamic.config.timeout    | 请求配置中心的超时时间 | 30000     | 置管理的开关开启时必须          |
| dynamic.config.serverAddress    | 配置中心的连接地址 | 127.0.0.1:30110     |    配置管理的开关开启时必须       |
| dynamic.config.dynamicConfigType    | 配置中心的类型，支持ZOOKEEPER、NACOS、KIE | KIE     |    配置管理的开关开启时必须       |
| dynamic.config.connectTimeout    |连接配置中心的超时时间 | 3000     |    配置管理的开关开启时必须       |
| dynamic.config.enableAuth    |是否开启授权认证，支持Nacos和Zookeeper | false     |    配置管理的开关开启时必须       |
| dynamic.config.userName    |授权认证时使用的用户名（明文） | null     |    开启授权认证时必须       |
| dynamic.config.password    |授权认证时使用的密码（采用AES加密后的密文）| null     |    开启授权认证时必须       |
| dynamic.config.secretKey    |密码采用AES方式加密时使用的密钥 | null     |    开启授权认证时必须       |

## 支持版本

Sermant Backend使用JDK 1.8版本开发，因此运行环境需JDK 1.8及以上版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## 操作和结果验证

### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant
  Release包（当前版本推荐2.0.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v1.4.0/sermant-examples-springboot-registry-demo-1.4.0.tar.gz) Demo二进制产物压缩包
- [下载](https://zookeeper.apache.org/releases.html#download)ZooKeeper（动态配置中心&注册中心），并启动

### 2 修改Sermant Agent参数配置

修改`${path}/sermant-agent/agent/config/config.properties`文件为以下内容：

```shell
# Heartbeat service switch
agent.service.heartbeat.enable=true
# Gateway service switch
agent.service.gateway.enable=true
# Event switch
event.enable=true
# Report warn log switch
event.offerWarnLog=true
# Report error log switch
event.offerErrorLog=true
```

> **说明**：${path}为sermant所在路径。

### 3 部署应用

#### 3.1 部署Sermant Backend

```shell
# windwos
java -Dwebhook.eventpush.level=NORMAL -Ddynamic.config.enable=true -Ddynamic.config.serverAddress=127.0.0.1:2181 -Ddynamic.config.dynamicConfigType=ZOOKEEPER -jar ${path}\sermant-agent\server\sermant\sermant-backend-x.x.x.jar

#linux mac
java -Dwebhook.eventpush.level=NORMAL -Ddynamic.config.enable=true -Ddynamic.config.serverAddress=127.0.0.1:2181 -Ddynamic.config.dynamicConfigType=ZOOKEEPER -jar ${path}/sermant-agent/server/sermant/sermant-backend-x.x.x.jar
```

> **说明：** ${path}为sermant实际安装路径，x.x.x代表sermant某个版本号。

#### 3.2 部署宿主应用

解压Demo二进制产物压缩包，即可得到service-a.jar。

```shell
# windwos
java -Dserver.port=8989 -javaagent:${path}\sermant-agent\agent\sermant-agent.jar=appName=default -jar service-a.jar

#linux mac
java -Dserver.port=8989 -javaagent:${path}/sermant-agent/agent/sermant-agent.jar=appName=default -jar service-a.jar
```

> **说明：** ${path}为sermant实际安装路径

### 4 实例状态验证

通过浏览器访问地址`http://127.0.0.1:8900/` 可查看前端展示页面，若页面中如下展示Sermant Agent实例的心跳信息，则验证心跳成功。

<MyImage src="/docs-img/backend/zh/backend-instance.png"></MyImage>

### 5 事件管理验证

通过点击事件管理标签中的观测按钮，可查看Sermant Agent上报的事件信息，若页面中如下展示Sermant Agent实例上报的事件信息，则验证事件上报成功。

<MyImage src="/docs-img/backend/zh/backend-event.png"></MyImage>

#### 5.1 验证事件查询

**5.1.1 上报时间查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置设置查询的事件时间范围，点击查询按钮进行查询

  <MyImage src="/docs-img/backend/zh/backend-event-query-time.png"></MyImage>

**5.1.2 服务名查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置设置按服务名查询，输入需要查询的服务名(支持单个或多个服务名查询)，点击查询按钮进行查询

  <MyImage src="/docs-img/backend/zh/backend-event-query-service-1.png"></MyImage>

  <MyImage src="/docs-img/backend/zh/backend-event-query-service-2.png"></MyImage>

**5.1.3 ip查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置设置按ip查询，输入需要查询的ip地址(支持单个或多个ip查询)，点击查询按钮进行查询

  <MyImage src="/docs-img/backend/zh/backend-event-query-ip-1.png"></MyImage>

  <MyImage src="/docs-img/backend/zh/backend-event-query-ip-2.png"></MyImage>

**5.1.4 级别查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置选择需要查询的事件级别，支持多选，选择后点击筛选进行查询

  <MyImage src="/docs-img/backend/zh/backend-event-query-level.png "></MyImage>

**5.1.5 类型查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置选择需要查询的事件类型，支持多选，选择后点击筛选进行查询

  <MyImage src="/docs-img/backend/zh/backend-event-query-type.png"></MyImage>

**5.1.6 详细信息展示**
  
  在**事件管理 -> 监测**页面，点击下图红色方框位置查看事件详细信息

  <MyImage src="/docs-img/backend/zh/backend-event-detail.png"></MyImage>

**5.1.7 事件自动刷新**
  
  在**事件管理 -> 监测**页面，点击下图红色方框自动刷新按钮，开启事件自动刷新（开启后将会定时自动获取最新事件，再次点击按钮关闭，或在查看事件列表时自动关闭）

  <MyImage src="/docs-img/backend/zh/backend-event-auto.png"></MyImage>

#### 5.2 验证webhook事件通知

- 通过浏览器访问地址`http://127.0.0.1:8900/`
- 点击菜单栏**事件管理 -> 配置** 进入webhook配置界面，如下图所示:

<MyImage src="/docs-img/backend/zh/backend-event-manager.png"></MyImage>

<MyImage src="/docs-img/backend/zh/backend-webhook.png"></MyImage>

- 开启webhook，如下图所示：

<MyImage src="/docs-img/backend/zh/backend-webhook-enable.png"></MyImage>

- 点击webhook的编辑按钮，设置webhook地址，如下图所示：

<MyImage src="/docs-img/backend/zh/backend-webhook-url.png"></MyImage>

- 点击webhook的测试连接按钮，可在对应webhook接收到测试事件通知
  - 飞书测试事件推送如下图所示：

    <MyImage src="/docs-img/backend/backend-webhook-feishu.png"></MyImage>

  - 钉钉测试事件推送如下图所示：

    <MyImage src="/docs-img/backend/backend-webhook-dingding.png"></MyImage>

### 6 配置管理验证

- 通过浏览器访问地址`http://127.0.0.1:8900/`
- 点击菜单栏**配置管理**进入配置管理界面即可查看配置中心的配置，配置管理页面默认会展示路由插件的配置，如下图所示:

<MyImage src="/docs-img/backend/zh/backend-config-manager.png"></MyImage>

#### 6.1 验证配置新增

- 在配置管理页面，点击**新增**按钮可以跳转到配置详情页面进行配置新增，如下图所示：

<MyImage src="/docs-img/backend/zh/backend-config-add.png"></MyImage>

- 在配置详情页面输入必要的配置信息之后即可点击提交按钮进行配置新增，如下图所示：

<MyImage src="/docs-img/backend/zh/backend-config-add-info.png"></MyImage>

- 配置新增成功之后，即可在配置管理页面查询到该配置项。

#### 6.2 验证配置查询

- 在配置管理页面，可以选择不同的插件类型来查询不同的插件配置，也可以输入不同的查询条件（如服务名称、应用名称等）查询符合条件的插件配置。下面为查询流控插件且服务名称为default的配置项的结果图（上一步已经新增）：

<MyImage src="/docs-img/backend/zh/backend-config-query.png"></MyImage>

#### 6.3 验证配置修改

- 在配置管理页面可以点击**查看**按钮跳转到配置详情页面修改配置内容。如下图所示：

<MyImage src="/docs-img/backend/zh/backend-config-modify-1.png"></MyImage>

- 在配置详情页面可以对配置内容进行修改，修改后点击提交按钮可以将修改后的内容提交到配置中心。

<MyImage src="/docs-img/backend/zh/backend-config-modify-2.png"></MyImage>

- 再次进入配置详情页面即可查看修改后的配置内容。

<MyImage src="/docs-img/backend/zh/backend-config-modify-3.png"></MyImage>

#### 6.4 验证配置删除

- 在配置管理页面可以进行配置的删除操作，点击**删除**按钮会提示是否进行删除操作。如下图所示：

<MyImage src="/docs-img/backend/zh/backend-config-delete-1.png"></MyImage>

- 选择**是**之后会删除该配置项，如下图所示：

<MyImage src="/docs-img/backend/zh/backend-config-delete-2.png"></MyImage>
