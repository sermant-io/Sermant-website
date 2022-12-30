# Backend使用手册

## 功能介绍

Backend为Sermant数据处理后端模块和前端信息展示模块，旨在为Sermant提供运行时的可观测能力，当前主要包括Sermant心跳信息的接收和展示等功能。

Backend与sermant-agent配合使用。sermant-agent挂载在宿主应用启动后作为数据发送端，可定时发送当前Sermant的心跳数据，包含应用名、实例ID、版本号、IP、时间戳、挂载插件信息等。Backend作为数据接收端，可接收处理sermant-agent发送的心跳数据，并在前端可视化展示，提供观测运行状态的能力。

Backend为非必要组件，用户可按需部署。

## 参数配置

sermant-agent端参数配置：

修改sermant-agent产品包agent/config/config.properties配置文件的相关配置

```properties
agent.config.serviceBlackList=com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl

heartbeat.interval=30000

backend.nettyIp=127.0.0.1
backend.nettyPort=6888
```

其中，`agent.config.serviceBlackList ` 配置禁止启动的核心服务，需去除`com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl`以**启用心跳服务**。

`heartbeat.interval` 配置心跳发送的间隔时间(ms)

`backend.nettyIp` 配置对应的Backend的netty服务端地址

`backend.nettyPort` 配置对应的Backend的netty服务端端口，默认为6888

Backend端参数无需额外配置，默认以6888为netty消息接收端口，8900为服务进程端口。

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
