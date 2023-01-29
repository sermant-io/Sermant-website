# Backend User Manual

## Function Introduction

Backend is the data processing back-end module and the front-end information display module of Sermant, which aims to provide observability for Sermant at runtime. At present, it mainly includes functions such as receiving and displaying Sermant heartbeat information. This article describes how to use Backend.

Backend is used in conjunction with sermant-agent. The sermant-agent is mounted as a data sender after the host application is started. It can periodically send the heartbeat data of the current Sermant, including application name, instance ID, version number, IP, timestamp, plugin information, etc. As the data receiver, the Backend can receive and process the heartbeat data sent by the sermant-agent, and display it visually in the front-end, providing the ability to observe the running state.

The Backend is a **non-essential component** that can be deployed on demand.

## Parameter Configuration

### Sermant-agent Parameter Configuration

First, when configure `agent.config.serviceBlackList` in [Parameters Related to Agent Framework of Sermant-agent User Manual](sermant-agent.md#parameters-related-to-agent-framework) to decide which core services are forbidden to start, it is necessary to remove `com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl` to **enable heartbeat service**.

Second, modify relative configuration in `agent/config/config.properties` of sermant-agent product package. Please refer to [Parameters Related to Backend of Sermant-agent User Manual](sermant-agent.md#parameters-related-to-backend) for specific parameters.

Part of the data of heartbeat is collected from the startup parameters of sermant-agent, so it is necessary to configure the startup parameters according to the actual scene. For specific parameters, please refer to [Sermant-agent Startup Parameters of Sermant-agent User Manual](sermant-agent.md#sermant-agent-startup-parameters).

### Backend Parameter Configuration

Backend parameters can be configured before compilation or packaging in `sermant-backend-lite/src/main/resources/application.properties`. It is also possible to configure backend parameters by -D parameter or environment variables before the jar starts.

| **Parameter Key**  | **Description**                                              | **Default Value** | **Required** |
| ------------------ | ------------------------------------------------------------ | ----------------- | ------------ |
| server.port        | The occupied port of the Backend                             | 8900              | False        |
| netty.port         | Message receiving port of net                                | 127.0.0.1         | False        |
| netty.wait.time    | Read wait time of Netty, in second                           | 60                | False        |
| max.effective.time | Time, in milliseconds, to determine whether the application is alive or not | 60000             | False        |
| max.cache.time     | Valid time in the cache for the application heartbeat, in millisecond | 600000            | False        |

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