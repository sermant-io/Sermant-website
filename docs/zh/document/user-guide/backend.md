# Backend使用手册

Backend包含Sermant数据处理后端模块和前端信息展示模块，旨在为Sermant提供运行时的可观测能力，当前主要包括Sermant心跳信息, 上报事件的接收和展示，webhook推送等功能。

Backend与Sermant配合使用。Sermant挂载在宿主应用启动后作为数据发送端，可定时发送当前Sermant的心跳数据(服务名、主机名、实例ID、版本号、IP、时间戳、挂载插件信息)，事件数据(Sermant启停、核心服务启停、字节码增强、日志数据等)。Backend作为数据接收端，可接收处理Sermant发送的心跳和事件等数据，将紧急事件推送至webhook，并在前端可视化展示，提供观测Sermant运行状态的能力。

> 注：Backend为**非必要组件**，用户可按需部署。

## 参数配置
### Backend参数配置

Backend参数可在编译打包前通过`sermant-backend/src/main/resources/application.properties`配置文件进行修改，同时也支持在jar包启动前通过-D参数或环境变量的方式进行配置。

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| server.port        | Backend的服务占用端口                | 8900       | 否           |
| netty.port         | Netty消息接收端口                    | 127.0.0.1  | 否           |
| netty.wait.time    | Netty的读等待时间，单位：s           | 60         | 否           |
| max.effective.time | 判断应用心跳存活的有效时间，单位：ms | 60000      | 否           |
| max.cache.time     | 应用心跳在缓存中的有效时间，单位：ms | 600000     | 否           |
| database.type     | 事件存储类型，当前支持redis数据库和内存 | MEMORY     | 否           |
| database.address     | redis数据库地址 | 127.0.0.1:6379     | 否           |
| database.user     | redis数据库用户名 | default     | 否           |
| database.password     | redis数据库密码 | null     | 否           |
| database.event.expire     | 事件过期时间，单位：天 | 7     | 否           |
| webhook.eventpush.level     | webhook事件推送级别，支持EMERGENCY,IMPORTANT,NORMAL三种级别;支持飞书和钉钉两种webhook | EMERGENCY     | 否           |


### sermant-agent参数配置

Backend提供的能力，需要依赖sermant-agent上报的数据，所以在使用Backend时，需要先配置sermant-agent中用于连接Backend、开启数据上报的相关参数：

参考[Sermant-agent使用手册](sermant-agent.md)，设置以下内容：
- 参考[核心服务相关参数配置](sermant-agent.md#核心服务相关参数)说明，开启以下服务：
  - 设置`agent.service.heartbeat.enable`值为`true`**开启心跳服务**
  - 设置`agent.service.gateway.enable`值为`true`**开启网关服务**
- 参考[事件上报相关参数](sermant-agent.md#事件上报相关参数)，设置以下参数：
  - 设置`event.enable`值为`true`**开启事件上报**
  - 设置`event.offerWarnLog`值为`true`**上报warn级别日志**
  - 设置`event.offerErrorLog`值为`true`**上报error级别日志**
- 参考[心跳相关参数配置](sermant-agent.md#心跳相关参数)，根据需要设置心跳发送间隔
- 参考[Gateway相关参数配置](sermant-agent.md#网关相关参数)，根据实际环境设置Gateway参数



## 支持版本

Backend使用JDK 1.8版本开发，因此运行环境需JDK 1.8及以上版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## 启动和结果验证

### 启动Backend

Backend的Jar包位于sermant-agent产品包agent/server目录下，通过执行以下命令来运行Backend(为方便验证webhook推送能力，指定事件推送级别为NORMAL)：

```shell
java -Dwebhook.eventpush.level=NORMAL -jar sermant-backend-1.0.0.jar
```

### 设置webhook信息

- 通过浏览器访问地址`http://127.0.0.1:8900/`
- 点击菜单栏**事件管理 -> 配置** 进入webhook配置界面，如下图所示:

<MyImage src="/docs-img/backend/backend-event-manager.png"></MyImage>

<MyImage src="/docs-img/backend/backend-webhook.png"></MyImage>

- 开启webhook，如下图所示：

<MyImage src="/docs-img/backend/backend-webhook-enable.png"></MyImage>

- 点击webhook的编辑按钮，设置webhook地址，如下图所示：

<MyImage src="/docs-img/backend/backend-webhook-url.png"></MyImage>

- 点击webhook的测试连接按钮，可在对应webhook接收到测试事件通知
  - 飞书测试事件推送如下图所示：
    
    <MyImage src="/docs-img/backend/backend-webhook-feishu.png"></MyImage>
    
  - 钉钉测试事件推送如下图所示：
    
    <MyImage src="/docs-img/backend/backend-webhook-dingding.png"></MyImage>

### 宿主应用挂载sermant-agent启动

首先按照上文参数配置一节描述，正确修改相关配置。然后参考[sermant-agent使用手册](sermant-agent.md)中启动和结果验证一节描述的方式启动宿主应用。

### 结果验证

#### 验证sermant实例状态
通过浏览器访问地址`http://127.0.0.1:8900/` 可查看前端展示页面，若页面中如下展示sermant-agent实例的心跳信息，则验证心跳成功。

<MyImage src="/docs-img/backend/backend-instance.jpeg"></MyImage>

#### 验证事件管理
通过点击事件管理标签中的观测按钮，可查看agent上报的事件信息，若页面中如下展示sermant-agent实例上报的事件信息，则验证事件上报成功。

<MyImage src="/docs-img/backend/backend-event.jpeg"></MyImage>

#### 验证webhook事件通知

由于backend设置了webhook事件推送级别为**NORMAL**，所以webhook会接收到sermant启动上报的所有事件，推送内容格式与上述webhook测试连接相同，由于事件过多不便于展示，使用者可自行测试验证。

#### 验证事件查询

- **上报时间查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置设置查询的事件时间范围，点击查询按钮进行查询

  <MyImage src="/docs-img/backend/backend-event-query-time.png"></MyImage>

- **服务名查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置设置按服务名查询，输入需要查询的服务名(支持单个或多个服务名查询)，点击查询按钮进行查询

  <MyImage src="/docs-img/backend/backend-event-query-service-1.png"></MyImage>

  <MyImage src="/docs-img/backend/backend-event-query-service-2.png"></MyImage>

- **ip查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置设置按ip查询，输入需要查询的ip地址(支持单个或多个ip查询)，点击查询按钮进行查询

  <MyImage src="/docs-img/backend/backend-event-query-ip-1.png"></MyImage>

  <MyImage src="/docs-img/backend/backend-event-query-ip-2.png"></MyImage>

- **级别查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置选择需要查询的事件级别，支持多选，选择后点击筛选进行查询

  <MyImage src="/docs-img/backend/backend-event-query-level.png "></MyImage>

- **类型查询**
  
  在**事件管理 -> 监测**页面，下图红色方框位置选择需要查询的事件类型，支持多选，选择后点击筛选进行查询

  <MyImage src="/docs-img/backend/backend-event-query-type.png"></MyImage>

- **详细信息展示**
  
  在**事件管理 -> 监测**页面，点击下图红色方框位置查看事件详细信息

  <MyImage src="/docs-img/backend/backend-event-detail.png"></MyImage>

- **事件自动刷新**
  
  在**事件管理 -> 监测**页面，点击下图红色方框自动刷新按钮，开启事件自动刷新（开启后将会定时自动获取最新事件，再次点击按钮关闭，或在查看事件列表时自动关闭）

  <MyImage src="/docs-img/backend/backend-event-auto.png"></MyImage>
