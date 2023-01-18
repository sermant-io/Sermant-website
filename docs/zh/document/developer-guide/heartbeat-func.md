# 心跳功能

本文档介绍Sermant插件如何使用心跳功能。

心跳功能是[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)的核心服务之一，通过以下代码获取实例：
```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

心跳功能在初始化的时候就会启动执行，定期将每个插件的名称、版本等信息发送至后端服务器。目前来说，插件的心跳上报的信息包括：

- `hostname`：发送客户端的主机名
- `ip`：发送客户端的IP地址
- `app`：应用名称，即启动参数中的`appName`
- `appType`：应用类型，即启动参数中的`appType`
- `heartbeatVersion`：上一次心跳发送时间
- `lastHeartbeat`：上一次心跳发送时间
- `version`：核心包的版本，即核心包`manifest`文件的`Sermant-Version`值
- `pluginInfoMap`：当前Sermant携带的插件信息
  - `pluginName`：插件名称，通过插件设定文件确定
  - `pluginVersion`：插件版本号，取插件jar包中`manifest`文件的`Sermant-Plugin-Version`值
  - `extInfo`：插件希望在插件上报的数据中上报的额外内容

如果希望在插件上报的数据中增加额外的内容，可以调用以下api：
```java
// 通过自定义ExtInfoProvider提供额外内容集合
heartbeatService.setExtInfo(new ExtInfoProvider() {
  @Override
  public Map<String, String> getExtInfo() {
    // do something
  }
});
```