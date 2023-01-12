# Backend User Manual

## Function Introduction

Backend is the data processing back-end module and the front-end information display module of Sermant, which aims to provide observability for Sermant at runtime. At present, it mainly includes functions such as receiving and displaying Sermant heartbeat information. This article describes how to use Backend.

Backend is used in conjunction with sermant-agent. The sermant-agent is mounted as a data sender after the host application is started. It can periodically send the heartbeat data of the current Sermant, including application name, instance ID, version number, IP, timestamp, plugin information, etc. As the data receiver, the Backend can receive and process the heartbeat data sent by the sermant-agent, and display it visually in the front-end, providing the ability to observe the running state.

The Backend is a **non-essential component** that can be deployed on demand.

## Parameter Configuration

Parameter configuration of sermant-agent:

Modify relevant configuration of `agent/config/config.properties` in sermant-agent product package.

|         Parameter Key         | <span style="display:inline-block;width:200px">Description</span> |                        Default Value                         | Required |
| :---------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :------: |
| agent.config.serviceBlackList | Sermant-agent core functionality blacklist to disable related services | com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl<br>,com.huaweicloud.sermant.implement.service.send.NettyGatewayClient<br>,com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl |  False   |
|      heartbeat.interval       |                   Heartbeat send interval                    |                            30000                             |  False   |
|        backend.nettyIp        |              Backend message receiving address               |                          127.0.0.1                           |  False   |
|       backend.nettyPort       |                Backend message receiving port                |                             6888                             |  False   |

Where `agent.config.serviceBlackList ` configures core services that are not allowed to start，you must not add `com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl` to enable heartbeat function.

`heartbeat.interval` configures heartbeat intervals (ms).

`backend.nettyIp` configures the netty server address of the corresponding Backend.

`backend.nettyPort` configure the netty server port of the corresponding Backend. The default portis 6888.

The Backend parameters do not need additional configuration. By default, 6888 is the netty message receiving port, and 8900 is the service process port.

## Versions Supported

Backend was developed using JDK 1.8, so JDK 1.8 and above is required to run the environment.

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## Startup and Result Validation

### Start Backend

The Backend Jar is located in the agent/server directory of the sermant-agent product package. Run Backend by executing the following command:

```shell
java -jar sermant-backend-lite.jar
```

### Start Host Application Mounting Sermant-agent

Start by modifying the appropriate configuration as described in the parameter configuration section above. Then start the host application as described in the Startup and Result Validation section of the [Sermant-agent User Manual](sermant-agent.md).

### Validation

The front-end display page can be viewed by visiting the address http://127.0.0.1:8900/ in the browser. If the heartbeat information of the sermant-agent instance is shown as follows, the deployment verification is successful.

<MyImage src="/docs-img/backend.png"></MyImage>