# Backend使用手册

Backend为Sermant数据处理后端模块和前端信息展示模块，旨在为Sermant提供运行时的可观测能力，当前主要包括Sermant心跳信息的接收和展示等功能。本文介绍如何使用Backend。

Backend与sermant-agent配合使用。sermant-agent挂载在宿主应用启动后作为数据发送端，可定时发送当前Sermant的心跳数据，包含应用名、实例ID、版本号、IP、时间戳、挂载插件信息等。Backend作为数据接收端，可接收处理sermant-agent发送的心跳数据，并在前端可视化展示，提供观测运行状态的能力。

Backend为**非必要组件**，用户可按需部署。

## 参数配置

### sermant-agent参数配置

首先在[Sermant-agent使用手册agent框架相关参数配置](sermant-agent.md#agent框架相关参数)中`agent.config.serviceBlackList` 配置禁止启动的核心服务时，需去除`com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl`以**启用心跳服务**。

其次，修改sermant-agent产品包`agent/config/config.properties`配置文件的相关配置，具体参数说明请参考[Sermant-agent使用手册Backend相关参数配置](sermant-agent.md#Backend相关参数)。

心跳的部分数据从sermant-agent启动参数中采集，因此还需按实际场景配置启动参数，具体参数说明请参考[Sermant-agent使用手册的启动参数配置](sermant-agent.md#Sermant-agent启动参数)。

### Backend参数配置

Backend参数可在编译打包前通过`sermant-backend-lite/src/main/resources/application.properties`配置文件进行修改，同时也支持在jar包启动前通过-D参数或环境变量的方式进行配置。

| **参数键**         | **说明**                             | **默认值** | **是否必须** |
| ------------------ | ------------------------------------ | ---------- | ------------ |
| server.port        | Backend的服务占用端口                | 8900       | 否           |
| netty.port         | Netty消息接收端口                    | 127.0.0.1  | 否           |
| netty.wait.time    | Netty的读等待时间，单位：s           | 60         | 否           |
| max.effective.time | 判断应用心跳存活的有效时间，单位：ms | 60000      | 否           |
| max.cache.time     | 应用心跳在缓存中的有效时间，单位：ms | 600000     | 否           |

## 支持版本

Backend使用JDK 1.8版本开发，因此运行环境需JDK 1.8及以上版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## 启动和结果验证

### 启动Backend

Backend的Jar包位于sermant-agent产品包agent/server目录下，通过执行以下命令来运行Backend：

```shell
java -jar sermant-backend-lite.jar
```

### 宿主应用挂载sermant-agent启动

首先按照上文参数配置一节描述，正确修改相关配置。然后参考[sermant-agent使用手册](sermant-agent.md)中启动和结果验证一节描述的方式启动宿主应用。

### 结果验证

通过浏览器访问地址http://127.0.0.1:8900/ 可查看前端展示页面，若页面中如下展示sermant-agent实例的心跳信息，则说明部署验证成功。

<MyImage src="/docs-img/backend.png"></MyImage>
