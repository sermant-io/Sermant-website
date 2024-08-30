# 心跳功能

本文介绍如何在开发中使用Sermant提供的心跳功能。

## 功能介绍

心跳功能在微服务治理领域起着关键的作用，可以通过心跳机制来监控各个服务实例的状态，通过周期性上报心跳可以告知其他服务自己的存活状态，避免实例宕机导致异常。

**Sermant**中通过心跳向Sermant Backend上报服务实例的元数据，同时还会上报已经被加载的服务治理插件的信息，来告知当前**Sermant Agent**携带了哪些服务治理插件，通过周期性上报心跳，**Sermant Backend**监控面板可以看到当前已经携带**Sermant Agent**的服务实例。

> 注意： 心跳功能需要和Backend监控面板同时使用，参考[Sermant Backend使用手册](../user-guide/sermant-backend.md)。

## 开发示例

基于心跳能力的开发，主要用来让插件开发者可以将插件少量十分重要信息通过心跳进行上报，并且在监控面板可观测。本开发示例基于[创建首个插件](README.md)文档中创建的工程。

在工程`template\template-plugin`模块下`com.huaweicloud.sermant.template.TemplateDeclarer`类中增加变量`heartbeatService`获取框架心跳服务，用于设置心跳额外信息：

```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

在针对`main`方法的[拦截器](bytecode-enhancement.md#拦截器)的`before`方法中通过`setExtInfo`接口设置心跳额外信息：

```java
@Override
public ExecuteContext before(ExecuteContext context) throws Exception {
  heartbeatService.setExtInfo(() -> Collections.singletonMap("status", "started"));
  System.out.println("Good morning!");
  return context;
}
```

1. 开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建) 流程，在工程根目录下执行 `mvn package`
2. 参考[backend使用手册](../user-guide/sermant-backend.md)
   启动backend。
3. 将文件`agent/config/config.properties`中的心跳开关`agent.service.heartbeat.enable`设置为`true`:
```properties
# 心跳服务开关
agent.service.heartbeat.enable=true
```
4. 最后访问`http://localhost:8900`查看backend界面

![pic](../../../binary-doc/backend_sermant_info.png)

从图中可以看到，当前携带**Sermant Agent**的实例有一个，并且处于正常运行状态，并且携带`1.2.0`版本的`template`插件。

> **Sermant Agent**会定期向**Sermant Backend**发送心跳，**Sermant Backend**在收到来自各个**Sermant Agent**的心跳时，会为其续约，如果超过有效时间（可通过[Sermant Backend配置](../user-guide/sermant-backend.md#Sermant-Backend参数配置)修改），还未收到某一节点上报的心跳，则就将该节点置为失联状态。

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