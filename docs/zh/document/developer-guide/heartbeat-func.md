# 心跳功能

本文介绍如何在开发中使用Sermant提供的心跳功能。

## 功能介绍

**健康检测：** Sermant Agent启动后，周期性上报心跳，通过心跳信息实时检测agent运行状态。

> 注意： 心跳功能需要和Backend监控面板同时使用，参考[Backend使用手册](../user-guide/backend.md)。
 
## 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程。

**心跳数据内容和含义如下所示：**

```json
{
  "hostname": "发送客户端的主机名",
  "ip": "发送客户端的IP地址",
  "appName": "应用名称，即启动参数中的appName",
  "appType": "应用类型，即启动参数中的appType",
  "heartbeatTime": "心跳发送时间",
  "lastHeartbeatTime": "上一次心跳发送时间",
  "version": "核心包的版本，即核心包manifest文件的Sermant-Version值",
  "instanceId": "Sermant Agent实例id",
  "pluginInfoMap": {
    "pluginName": "插件名称，通过插件设定文件确定",
    "pluginVersion": "插件版本号，取插件jar包中`manifest`文件的`Sermant-Plugin-Version`值",
    "extInfo": "插件希望在插件上报的数据中上报的额外内容"
  }
}
```

1. 在工程`template\template-plugin`模块下`com.huaweicloud.sermant.template.TemplateDeclarer`类中增加变量`heartbeatService`获取框架心跳服务，用于设置心跳额外信息：

```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

2. 在对main方法拦截器的before方法中通过`setExtInfo`接口设置心跳额外信息：

```java
@Override
public ExecuteContext before(ExecuteContext context) throws Exception {
  heartbeatService.setExtInfo(() -> Collections.singletonMap("status", "started"));
  System.out.println("Good morning!");
  return context;
}
```

3. 开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建) 流程，在工程根目录下执行 `mvn package`，
参考[Sermant Agent配置](../user-guide/sermant-agent.md#参数配置) 修改文件`agent/config/config.properties`，从核心服务黑名单中移除以下心跳功能：

```properties
com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl
com.huaweicloud.sermant.implement.service.send.NettyGatewayClient
```

修改后如下所示：

```properties
agent.config.serviceBlackList=com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl,com.huaweicloud.sermant.implement.service.dynamicconfig.BufferedDynamicConfigService
```

4. 参考[backend使用手册](../user-guide/backend.md)启动backend。

5. 访问`http://localhost:8900`查看backend界面，如下图所示：

![pic](../../../binary-doc/backend_sermant_info.png)

## API&配置

### API

**获取心跳服务**

获取心跳服务对象，用于在插件心跳数据中增加额外信息，该服务由框架进行初始化，插件可直接获取使用。

```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

**增加心跳附加信息**

开发者可通过如下方式在插件中增加心跳附加信息。

```java
heartbeatService.setExtInfo(() -> Collections.singletonMap("key", "value"));
```

### 配置

基于创建首个插件中的[工程结构](README.md#工程结构)，心跳功能配置通过修改`config/config.properties`文件来设置。

|配置项|描述|配置示例|
|---|---|---|
| heartbeat.interval | 心跳发送间隔时间，单位ms | heartbeat.interval=30000 |