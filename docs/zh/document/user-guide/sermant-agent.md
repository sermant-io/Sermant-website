# Sermant-agent使用手册

sermant-agent为Sermant必要核心组件，包含[sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore)、[sermant-plugins](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins)、[sermant-common](https://github.com/huaweicloud/Sermant/tree/develop/sermant-common)等字节码增强逻辑的实现主体。[Sermant使用介绍](readme.md)中描述的产品目录`sermant-agent-x.x.x/agent`目录下内容即为sermant-agent组件的各模块。本文介绍如何使用sermant-agent。

sermant-agent的框架主体为Sermant提供了字节码增强的实现逻辑，同时支持心跳功能、动态配置功能、日志功能等公共核心能力。sermant-agent插件包中则由各扩展插件提供了标签路由、限流降级、双注册等服务治理能力。

## 参数配置

在Java程序启动时，通过 `-javaagent`参数指定`sermant-agent.jar`的文件路径，即可使该Java程序(也称为宿主应用)在运行时挂载sermant-agent。

```shell
-javaagent:sermant-agent.jar[=${options}]
```

其中`${options}`为启动参数，会作为`premain`方法的入参`agentArgs`传入。

```java
public static void premain(String agentArgs, Instrumentation inst);
```

参数`agentArgs`的格式要求形如`key1=value1,key2=value2[(,keyN=valueN)...]`，以`','`分割键值对，以`'='`分割键值，形成`Map`结构。

### Sermant-agent启动参数

**启动参数**配置参考如下：

|参数键|说明|默认值|是否必须|
|:-:|:-:|:-:|:-:|
|appName|应用名称|default|否|
|instanceName|实例名称|default|否|
|appType|应用类型|0|否|

入参`agentArgs`中也可以为**启动参数**配置自定义的值。

此外，启动参数也可在sermant-agent的产品包下`agent/config/bootstrap.properties`中配置，配置参考与上述一致，同时也支持增加自定义启动参数。

### Sermant-agent使用参数配置

Sermant除插件配置外的其他配置都在sermant-agent的产品包下`agent/config/config.properties`中配置。各插件的参数配置请参考[插件使用手册](https://sermant.io/zh/document/plugin/)中相关描述。

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
```

其中涉及的参数与sermant-agent、Backend、动态配置中心等有关联，具体参数配置参考下表：

| <span style="display:inline-block;width:100px">参数键</span> |<span style="display:inline-block;width:200px">说明</span>|                            默认值                            | 是否必须 |
| :-----------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :------: |
| agent.config.isEnhanceBootStrapEnable |                增强启动类加载器加载的类的开关                |                            false                             |    是    |
|     agent.config.ignoredPrefixes      | 增强忽略集，该集合中定义的全限定名前缀用于排除增强过程中被忽略的类 |          com.huawei.sermant,com.huaweicloud.sermant          |    否    |
|    agent.config.ignoredInterfaces     | 增强忽略接口集，该集合中定义的接口用于排除增强过程中被忽略的类 |           org.springframework.cglib.proxy.Factory            |    否    |
|     agent.config.combineStrategy      | 插件声明器的合并策略：NONE，不合并；BY_NAME，通过匹配的类名合并；ALL，所有都合并 |                             ALL                              |    是    |
|     agent.config.serviceBlackList     |       sermant-agent核心功能黑名单，添加后禁用相关服务        | com.huaweicloud.sermant.implement.service.heartbeat.HeartbeatServiceImpl<br>,com.huaweicloud.sermant.implement.service.send.NettyGatewayClient<br>,com.huaweicloud.sermant.implement.service.tracing.TracingServiceImpl |    否    |
|    agent.config.serviceInjectList     |                       拦截插件服务名单                       | com.huawei.discovery.service.lb.filter.NopInstanceFilter<br>,com.huawei.discovery.service.lb.DiscoveryManager |    否    |
|  agent.config.isShowEnhanceLogEnable  |                 是否在增强过程中输出检索日志                 |                            false                             |    是    |
| agent.config.enhancedClassOutputPath  |            被增强类的输出路径，如果为空，则不输出            |                              -                               |    否    |
| dynamic.config.timeoutValue | 配置中心服务器连接超时时间，单位：ms | 30000 | 是 |
| dynamic.config.defaultGroup | 动态配置默认分组 | sermant | 是 |
| dynamic.config.serverAddress | 配置中心服务器地址，必须形如：{@code host:port[(,host:port)...]} | 127.0.0.1:2181 | 是 |
| dynamic.config.dynamicConfigType | 动态配置中心服务实现类型，取NOP、ZOOKEEPER、KIE | ZOOKEEPER | 是 |
| dynamic.config.connectRetryTimes | 动态配置中心ZOOKEEPER：启动Sermant时的配置中心的重连次数 | 5 | 是 |
| dynamic.config.connectTimeout | 动态配置中心ZOOKEEPER：启动Sermant时连接配置中心的时间时间 | 1000 | 是 |
| dynamic.config.userName | 动态配置中心ZOOKEEPER：配置中心的用户名 | - | 否 |
| dynamic.config.password | 动态配置中心ZOOKEEPER：配置中心的加密后的密码 | - | 否 |
| dynamic.config.privateKey | 动态配置中心ZOOKEEPER：加密密钥 | - | 否 |
| dynamic.config.enableAuth | 动态配置中心ZOOKEEPER：是否需要配置授权 | false | 否 |
| heartbeat.interval | 心跳发送间隔 | 30000 | 否 |
| backend.nettyIp | Backend消息接收地址 | 127.0.0.1 | 否 |
| backend.nettyPort | Backend消息接收端口 | 6888 | 否 |
| service.meta.application | 服务名称 | default | 否 |
| service.meta.version | 服务版本 | 1.0.0 | 否 |
| service.meta.project | 服务命名空间 | default | 否 |
| service.meta.environment | 服务所在环境 | - | 否 |
| service.meta.zone | 服务所在az | - | 否 |

### Sermant-agent挂载插件配置

Sermant自定义选择挂载哪些插件可在sermant-agent的产品包下`agent/config/plugins.yaml`中配置，配置方式如下：

```yaml
plugins:                 # 可自定义配置默认挂载的插件名称
  - flowcontrol
  - service-router
  - service-registry
  - loadbalancer
  - dynamic-config
  - monitor
  - springboot-registry
  - mq-consume-deny
profiles:                # 各profile自定义配置挂载的插件列表
  cse:
    - flowcontrol
    - service-router
    - service-registry
    - dynamic-config
  apm:
    - flowcontrol
    - service-router
profile: cse,apm         # profile用于按场景配置挂载的插件列表，此处配置生效的场景
```

启动时，`plugins` 下配置的插件都会挂载至宿主应用，`profile`下的插件列表也可按需配置生效。

## 支持版本

### sermant-agent 支持的版本

sermant-agent支持Linux、Windows、Aix操作系统,支持JDK 1.6及以上版本，建议使用JDK 1.8版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## 启动和结果验证

### 启动

以**Sermant-example**项目 [demo-application](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application)为宿主应用，执行以下命令挂载sermant-agent启动demo-application:

```shell
java -javaagent:sermant-agent/agent/sermant-agent.jar=appName=test -jar demo-application.jar
```

### 验证

查看demo-application的日志文件开头是否包含以下内容：

```
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
```

若日志如上正常输出，则说明sermant-agent挂载成功。