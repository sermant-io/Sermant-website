# Sermant-agent User Manual

## Function Introduction

Sermant-agent is the essential core component of Sermant, which contains bytecode enhancements of [sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore), [sermant-plugins](https://gIthub.com/huaweicloud/Sermant/tree/develop/sermant-plugins), [sermant-common](https://github.com/huaweicloud/Sermant/tree/develop/sermant-common). The modules of the sermant-agent component are found in the `sermant-agent-x.x.x/agent` directory described in the [Sermant Introduction](readme.md).

The framework body of sermant-agent provides bytecode enhanced implementation logic for Sermant, and supports common core capabilities such as heartbeat function, dynamic configuration function and log function. In the sermant-agent plugin package, the extension plugins provide the service governance capabilities such as label routing, flow control and double registration.

## Parameter Configuration

Specify `sermant-agent.jar` via the -javaagent parameter when a Java program (Java class with a main function) is running.

```shell
-javaagent:sermant-agent.jar[=${options}]
```

Where `${options}` is the launch input parameter, which will be transferred as the parameter `agentArgs` to the `premain` method.

```java
public static void premain(String agentArgs, Instrumentation inst);
```

The format of the `agentArgs` parameter should look like `key1=value1,key2=value2[(,keyN=valueN)...]`, which splits key/value pairs with `','`, and splits between key and value with `'='` 'to form a `Map` structure.

### Startup Parameters

The fixed contents of **startup parameters** are as follows:

|Key in Input Parameters|Key in Bootstrap Configuration|Key in Startup Parameters|Explanation|Default Value|NotNull|Notes|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|appName|app.name|appName|The name of host application|default|True|/|
|instanceName|instance.name|instanceName|The name of the specific instance|default|True|/|
|appType|app.type|appType|The type of host application|0|True|/|
|/|/|agentPath|The directory of Entrance package|The directory of Entrance package|True|No need to configure|
|/|/|sermant.config.file|Unified Configuration File|Unified Configuration File|True|No need to configure|
|/|/|sermant.plugin.setting.file|Plugin Setup Configuration|Plugin Setup Configuration|True|No need to configure|
|/|/|sermant.plugin.package.dir|The directory of plugin package|The directory of plugin package|True|No need to configure|
|/|/|sermant.log.setting.file|The directory of log configuration file|The directory of log configuration file|True|No need to configure|

The `agentArgs` parameter allows you to configure more values for **startup parameters**.

## Versions Supported

Sermant-agent supports Linux, Windows, and Aix operating systems, supports JDK 1.6 and above, and recommends using JDK 1.8.

[HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## Startup and Result Validation

### Startup

Start with a **Sermant-example** project [demo-application] (https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application) as the host application, execute the following command to mount the sermant-agent and start demo-application:

```shell
java -javaagent:sermant-agent/agent/sermant-agent.jar=appName=test -jar demo-application.jar
```

### Validation

Check to see if the log file for demo-application starts with the following:

```
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
```

If the log output is normal, then the sermant-agent was mounted successfully.
