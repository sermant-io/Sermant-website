# Sermant-agent User Manual

Sermant-agent is the essential core component of Sermant, which contains bytecode enhancements of [sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore), [sermant-plugins](https://gIthub.com/huaweicloud/Sermant/tree/develop/sermant-plugins), [sermant-common](https://github.com/huaweicloud/Sermant/tree/develop/sermant-common). The modules of the sermant-agent component are found in the `sermant-agent-x.x.x/agent` directory described in the [Sermant Introduction](readme.md). This article describes how to use sermant-agent.

The framework body of sermant-agent provides bytecode enhanced implementation logic for Sermant, and supports common core capabilities such as heartbeat function, dynamic configuration function and log function. In the sermant-agent plugin package, the extension plugins provide the service governance capabilities such as label routing, flow control and double registration.

## Parameter Configuration

Specify `sermant-agent.jar` via the `-javaagent` parameter when a Java program (Java class with a main function) is running. `sermant-agent.jar` is deposited in `agent/sermant-agent.jar` of sermant-agent pruduct package.

```shell
-javaagent:sermant-agent.jar[=${options}]
```

Where `${options}` is the launch input parameter, which will be transferred as the parameter `agentArgs` to the `premain` method.

```java
public static void premain(String agentArgs, Instrumentation inst);
```

The format of the `agentArgs` parameter should look like `key1=value1,key2=value2[(,keyN=valueN)...]`, which splits key/value pairs with `','`, and splits between key and value with `'='` 'to form a `Map` structure.

### Sermant-agent Startup Parameters

The **startup parameters** are listed as follows:

|Key in Input Parameters|Description|Default Value|Required|
|:-:|:-:|:-:|:-:|
|appName|The name of host application, can be used for instance heartbeat sending, etc|default|False|
|instanceName|The name of the specific instance, can be used for instance heartbeat sending, etc|default|False|
|appType|The type of host application, can be used for instance heartbeat sending, etc|0|False|

The `agentArgs` parameter allows you to configure more custom values for **startup parameters**.

In addition, the startup parameters can also be configured in ` agent/config/bootstrap properties ` in the product package of sermant-agent, which are consistent with the parameters above and also supports custom startup parameters.

### Sermant-agent Parameter Configuration

All other configurations beside plugin configurations are configured in the `agent/config/config.properties` of the sermant-agent product package. Please refer to the [Plugin Guide](https://sermant.io/zh/document/plugin/) for configurations of each plugin.

```properties
# agent config
agent.config.isEnhanceBootStrapEnable=false
agent.config.ignoredPrefixes=com.huawei.sermant,com.huaweicloud.sermant
agent.config.ignoredInterfaces=org.springframework.cglib.proxy.Factory
agent.config.combineStrategy=ALL
agent.config.serviceBlackList=com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl,com.huaweicloud.sermant.implement.service.send.NettyGatewayClient,com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl
agent.config.serviceInjectList=com.huawei.discovery.service.lb.filter.NopInstanceFilter,com.huawei.discovery.service.lb.DiscoveryManager
agent.config.isShowEnhanceLogEnable=false
agent.config.enhancedClassOutputPath=

# dynamic config
dynamic.config.timeoutValue=30000
dynamic.config.defaultGroup=sermant
dynamic.config.serverAddress=127.0.0.1:2181
dynamic.config.dynamicConfigType=ZOOKEEPER
dynamic.config.connectRetryTimes=5
dynamic.config.connectTimeout=1000
dynamic.config.userName=
dynamic.config.password=
dynamic.config.privateKey=
dynamic.config.enableAuth=false

# heartbeat config
heartbeat.interval=30000

# backend config
backend.nettyIp=127.0.0.1
backend.nettyPort=6888

# service meta config
service.meta.application=default
service.meta.version=1.0.0
service.meta.project=default
service.meta.environment=
service.meta.zone=
service.meta.parameters=
```

The parameters involved are associated with sermant-agent, Backend, Dynamic Configuration Center, etc. Refer to the following tables for specific parameter configurations.

#### Parameters Related to Agent Framework

| <span style="display:inline-block;width:100px">Parameter Key</span> | <span style="display:inline-block;width:120px">Description</span> | <span style="display:inline-block;width:70px">Parameter Category</span> |                        Default Value                         | Required |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :------: |
|            agent.config.isEnhanceBootStrapEnable             | Switch for enhancement of classes loaded by the bootstrap classloader |                            Agent                             |                            false                             |  False   |
|                 agent.config.ignoredPrefixes                 | Ignored class set, where the fully qualified name prefixes defined in this set are used to exclude classes that are ignored during the enhancement process |                            Agent                             |          com.huawei.sermant,com.huaweicloud.sermant          |  False   |
|                agent.config.ignoredInterfaces                | Ignored interface set, where the fully qualified name prefixes defined in this set are used to exclude interfaces that are ignored during the enhancement process |                            Agent                             |           org.springframework.cglib.proxy.Factory            |  False   |
|                 agent.config.combineStrategy                 | Plugin declarator merge policy: NONE, no merge; BY_NAME, coalesced by matching class names; ALL, all merge |                            Agent                             |                             ALL                              |  False   |
|                agent.config.serviceBlackList                 | Sermant-agent core functionality blacklist to disable related services |                            Agent                             | com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl<br>,com.huaweicloud.sermant.implement.service.send.NettyGatewayClient<br>,com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl |  False   |
|                agent.config.serviceInjectList                |         List of service in plugin to be intercepted          |                            Agent                             | com.huawei.discovery.service.lb.filter.NopInstanceFilter<br>,com.huawei.discovery.service.lb.DiscoveryManager |  False   |
|             agent.config.isShowEnhanceLogEnable              |     Whether to output retrieval logs during enhancement      |                            Agent                             |                            false                             |  False   |
|             agent.config.enhancedClassOutputPath             |           The output path of the enhanced classed            |                            Agent                             |                              -                               |  False   |

#### Parameters Related to Dynamic Configuration Center

| <span style="display:inline-block;width:100px">Parameter Key</span> | <span style="display:inline-block;width:80px">Description</span> |      Parameter Category      | Default Value  | Required |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :--------------------------: | :------------: | :------: |
|                 dynamic.config.timeoutValue                  | Dynamic configuration center server connection timeout, in ms | Dynamic Configuration Center |     30000      |   True   |
|                 dynamic.config.defaultGroup                  |             Dynamic configuration default group              | Dynamic Configuration Center |    sermant     |   True   |
|                 dynamic.config.serverAddress                 | Dynamic configuration center server address, configured like: {@code host:port[(,host:port)...]} | Dynamic Configuration Center | 127.0.0.1:2181 |   True   |
|               dynamic.config.dynamicConfigType               |           Dynamic config type: NOP、ZOOKEEPER、KIE           | Dynamic Configuration Center |   ZOOKEEPER    |   True   |
|               dynamic.config.connectRetryTimes               | Dynamic configuration center ZOOKEEPER: the number of configuration center reconnects when starting the Sermant | Dynamic Configuration Center |       5        |   True   |
|                dynamic.config.connectTimeout                 | Dynamic configuration center ZOOKEEPER: connection timeout to the configuration center when starting the Sermant | Dynamic Configuration Center |      1000      |   True   |
|                   dynamic.config.userName                    |      Dynamic configuration center ZOOKEEPER：user name       | Dynamic Configuration Center |       -        |  False   |
|                   dynamic.config.password                    | Dynamic configuration center ZOOKEEPER：password after encryption | Dynamic Configuration Center |       -        |  False   |
|                  dynamic.config.privateKey                   |    Dynamic configuration center ZOOKEEPER：decryption key    | Dynamic Configuration Center |       -        |  False   |
|                  dynamic.config.enableAuth                   | Dynamic configuration center ZOOKEEPER：authorization switch | Dynamic Configuration Center |     false      |  False   |

#### Parameters Related to Backend

| <span style="display:inline-block;width:100px">Parameter Key</span> | <span style="display:inline-block;width:200px">Description</span> | Parameter Category | Default Value | Required |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------: | :-----------: | :------: |
|                      heartbeat.interval                      |            Heartbeat send interval in millisecond            |      Backend       |     30000     |  False   |
|                       backend.nettyIp                        |              Backend message receiving address               |      Backend       |   127.0.0.1   |  False   |
|                      backend.nettyPort                       |                Backend message receiving port                |      Backend       |     6888      |  False   |

#### Parameters Related to Service Metadata

| <span style="display:inline-block;width:100px">Parameter Key</span> | <span style="display:inline-block;width:200px">Description</span> | Parameter Category | Default Value | Required |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------: | :-----------: | :------: |
|                   service.meta.application                   | Application name, can be used in service governance scenarios such as service registration. |  Service Metadata  |    default    |  False   |
|                     service.meta.version                     | Service version, can be used in service governance scenarios such as service registration and label routing. |  Service Metadata  |     1.0.0     |  False   |
|                     service.meta.project                     | Service namespace, can be used in service governance scenarios such as service registration. |  Service Metadata  |    default    |  False   |
|                   service.meta.environment                   | Service environment, can be used in service governance scenarios such as service registration. |  Service Metadata  |       -       |  False   |
|                      service.meta.zone                       | Az that service locates, can be used in service governance scenarios such as service registration and label routing. |  Service Metadata  |       -       |  False   |
|                   service.meta.parameters                    | Service extra parameters.The value is in the form of key:value. Multiple key-value pairs are separated by commas (,). It is used in service governance scenarios, such as service registration and label routing. |  Service Metadata  |       -       |  False   |

### Sermant-agent Mounted Plugins Configuration

You can configure which plugins to be mounted by Sermant in `agent/config/plugins.yaml` of sermant-agent product package.For example:

```yaml
plugins:                 # You can customize the plugins to be mounted by default
  - flowcontrol
  - service-router
  - service-registry
  - loadbalancer
  - dynamic-config
  - monitor
  - springboot-registry
  - mq-consume-deny
profiles:                # You can configure the list of plugins mounted of each profile
  cse:
    - flowcontrol
    - service-router
    - service-registry
    - dynamic-config
  apm:
    - flowcontrol
    - service-router
profile: cse,apm         # Profile is used to configure the list of mounted plugins by scenario. You can configure the in effect
```

The parameters are described as follows:

| Parameter Key |                         Description                          | Required |
| :-----------: | :----------------------------------------------------------: | :------: |
|    plugins    |    Configure the default plugins to be mounted in a list     |   True   |
|   profiles    | Customize the list of plugins to be mounted in different scenarios |  False   |
|    profile    |       Customize the names of the scenario to be loaded       |  False   |

Any plugins configured in `plugins` will be mounted to the host application at startup. The list of plugins in `profile` can also be configured on demand.

**Loading order of plugins**

The Sermant plugin loads in the following order: 

1. First load the default plugins in the order configured in `plugin`.

2. Then load the scenario plugin list according to the scenario sequence configured in profile. The scenario plugin loading sequence is the same as that in the configuration file.

3. If the plugin configured in `profiles` has been loaded before, it will not be loaded again.

4. Bytecode enhancements at the same interception point for different plugins **take effect in the same order as plugin loading**.

### Parameter Configuration Options

The sermant project's properties configuration file and yaml configuration file for sermant-agent plugins support the following configuration options. Take `backend.nettyIp=127.0.0.1` in the configuration file for example:

1. Modify the configuration file directly, via configure `backend.nettyIp=127.0.0.1` in the configuration file.
2. Configure the -D option at startup, like: `-Dbackend.nettyIp=127.0.0.1`.
3. Configure via environment variables, via add `backend.nettyIp=127.0.0.1` to environment variables.
4. Configure startup parameters of sermant-agent, like: `-javaagent:sermant-agent.jar=backend.nettyIp=127.0.0.1`

The configuration takes effect in descending order of priority: 4 > 3 > 2 > 1.

The last three ways to obtain configuration parameters support various formats. Take `backend.nettyIp=127.0.0.1` in the configuration file for example, the following configuration formats can be identified:

```txt
backend.nettyIp=127.0.0.1
backend_nettyIp=127.0.0.1
backend-nettyIp=127.0.0.1
BACKEND.NETTYIP=127.0.0.1
BACKEND_NETTYIP=127.0.0.1
BACKEND-NETTYIP=127.0.0.1
backend.nettyip=127.0.0.1
backend_nettyip=127.0.0.1
backend-nettyip=127.0.0.1
backend.netty.ip=127.0.0.1
backend_netty_ip=127.0.0.1
backend-netty-ip=127.0.0.1
BACKEND.NETTY.IP=127.0.0.1
BACKEND_NETTY_IP=127.0.0.1
BACKEND-NETTY-IP=127.0.0.1
```

The sermant-agent retrieves, from top to bottom, whether the configuration values are configured by startup parameter, the environment variable, and the -D parameter.

## Versions Supported

Sermant-agent supports Linux, Windows, and Aix operating systems, supports JDK 1.6 and above, and recommends using JDK 1.8.

[HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## Startup and Result Validation

### Startup

Start with a **Sermant-example** project [demo-application] (https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application) as the host application, execute the following command to mount the sermant-agent and start demo-application:

```shell
# Run under Windows
java -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test -jar demo-application.jar
```

```shell
# Run under Linux
java -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test -jar demo-application.jar
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
