# Sermant-agent User Manual

Sermant-agent is the essential core component of Sermant, which contains bytecode enhancements of [sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore), [sermant-plugins](https://gIthub.com/huaweicloud/Sermant/tree/develop/sermant-plugins), [sermant-common](https://github.com/huaweicloud/Sermant/tree/develop/sermant-common). The modules of the sermant-agent component are found in the `sermant-agent-x.x.x/agent` directory described in the [Sermant Introduction](readme.md). This article describes how to use sermant-agent.

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

### Sermant-agent Startup Parameters

The **startup parameters** are listed as follows:

|Key in Input Parameters|Description|Default Value|Required|
|:-:|:-:|:-:|:-:|
|appName|The name of host application|default|False|
|instanceName|The name of the specific instance|default|False|
|appType|The type of host application|0|False|

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

#backend config
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

The parameters involved are associated with sermant-agent, Backend, Dynamic Configuration Center, etc. Refer to the following table for specific parameter configurations:

|<span style="display:inline-block;width:100px">Parameter Key</span>| <span style="display:inline-block;width:200px">Description</span> |                        Default Value                         | Required |
| :-----------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :------: |
| agent.config.isEnhanceBootStrapEnable | Switch for enhancement of classes loaded by the bootstrap classloader |                            false                             |   True   |
|     agent.config.ignoredPrefixes      | Ignored class set, where the fully qualified name prefixes defined in this set are used to exclude classes that are ignored during the enhancement process |          com.huawei.sermant,com.huaweicloud.sermant          |  False   |
|    agent.config.ignoredInterfaces     | Ignored interface set, where the fully qualified name prefixes defined in this set are used to exclude interfaces that are ignored during the enhancement process |           org.springframework.cglib.proxy.Factory            |  False   |
|     agent.config.combineStrategy      | Plugin declarator merge policy: NONE, no merge; BY_NAME, coalesced by matching class names; ALL, all merge |                             ALL                              |   True   |
|     agent.config.serviceBlackList     | Sermant-agent core functionality blacklist to disable related services | com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl<br>,com.huaweicloud.sermant.implement.service.send.NettyGatewayClient<br>,com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl |  False   |
|    agent.config.serviceInjectList     |         List of service in plugin to be intercepted          | com.huawei.discovery.service.lb.filter.NopInstanceFilter<br>,com.huawei.discovery.service.lb.DiscoveryManager |  False   |
|  agent.config.isShowEnhanceLogEnable  |     Whether to output retrieval logs during enhancement      |                            false                             |   True   |
| agent.config.enhancedClassOutputPath  |           The output path of the enhanced classed            |                              -                               |  False   |
|      dynamic.config.timeoutValue      | Dynamic configuration center server connection timeout, in ms |                            30000                             |   True   |
|      dynamic.config.defaultGroup      |             Dynamic configuration default group              |                           sermant                            |   True   |
|     dynamic.config.serverAddress      | Dynamic configuration center server address, configured like: {@code host:port[(,host:port)...]} |                        127.0.0.1:2181                        |   True   |
|   dynamic.config.dynamicConfigType    |           Dynamic config type: NOP、ZOOKEEPER、KIE           |                          ZOOKEEPER                           |   True   |
|   dynamic.config.connectRetryTimes    | Dynamic configuration center ZOOKEEPER: the number of configuration center reconnects when starting the Sermant |                              5                               |   True   |
|     dynamic.config.connectTimeout     | Dynamic configuration center ZOOKEEPER: connection timeout to the configuration center when starting the Sermant |                             1000                             |   True   |
|        dynamic.config.userName        |      Dynamic configuration center ZOOKEEPER：user name       |                              -                               |  False   |
|        dynamic.config.password        | Dynamic configuration center ZOOKEEPER：password after encryption |                              -                               |  False   |
|       dynamic.config.privateKey       |    Dynamic configuration center ZOOKEEPER：decryption key    |                              -                               |  False   |
|       dynamic.config.enableAuth       | Dynamic configuration center ZOOKEEPER：authorization switch |                            false                             |  False   |
|          heartbeat.interval           |                   Heartbeat send interval                    |                            30000                             |  False   |
|            backend.nettyIp            |              Backend message receiving address               |                          127.0.0.1                           |  False   |
|           backend.nettyPort           |                Backend message receiving port                |                             6888                             |  False   |
|       service.meta.application        |                         Application name                         |                           default                            |  False   |
|         service.meta.version          |                       Service version                        |                            1.0.0                             |  False   |
|         service.meta.project          |                      Service namespace                       |                           default                            |  False   |
|       service.meta.environment        |                     Service environment                      |                              -                               |  False   |
|           service.meta.zone           |                   Az that service locates                    |                              -                               |  False   |
|           service.meta.parameters     |                   Service Metadata                           |                              -                               |  False   |

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
profile: cse,apm         # Profile is used to configure the list of mounted plugins by scenario. You can configure the  in effect
```

Any plugins configured in `plugins` will be mounted to the host application at startup. The list of plugins in `profile` can also be configured on demand.

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
