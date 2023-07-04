# Sermant-agent使用手册

sermant-agent为Sermant必要核心组件，包含[sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore)、[sermant-plugins](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins)、[sermant-common](https://github.com/huaweicloud/Sermant/tree/develop/sermant-common)等字节码增强逻辑的实现主体。[Sermant使用介绍](readme.md)中描述的产品目录`sermant-agent-x.x.x/agent`目录下内容即为sermant-agent组件的各模块。本文介绍如何使用sermant-agent。

sermant-agent的框架主体为Sermant提供了字节码增强的实现逻辑，同时支持心跳功能、动态配置功能、日志功能、事件上报等公共核心能力。sermant-agent插件包中则由各扩展插件提供了标签路由、限流降级、双注册等服务治理能力。

## 参数配置

在Java程序启动时，通过 `-javaagent`参数指定`sermant-agent.jar`的文件路径，即可使该Java程序(也称为宿主应用)在运行时挂载sermant-agent。`sermant-agent.jar`在Sermant打包后产品包的`agent/sermant-agent.jar`路径中存放。

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
|appName|应用名称，可用于实例心跳发送等|default|否|
|appType|应用类型，可用于实例心跳发送等|default|否|
|serviceName|微服务名称，可用于实例心跳发送等|default|否|

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
agent.config.serviceInjectList=com.huawei.discovery.service.lb.filter.NopInstanceFilter,com.huawei.discovery.service.lb.DiscoveryManager,com.huawei.discovery.service.util.ApplyUtil,com.huawei.discovery.service.lb.cache.InstanceCacheManager
agent.config.isOutputEnhancedClasses=false
agent.config.enhancedClassesOutputPath=
agent.config.isShowEnhanceLog=false

# agent service config
agent.service.heartbeat.enable=false
agent.service.gateway.enable=false
agent.service.tracing.enable=false
agent.service.visibility.enable=false
agent.service.inject.enable=true
agent.service.monitor.enable=false
agent.service.dynamic.config.enable=true

# event config
event.enable=false
event.offerWarnLog=false
event.offerErrorLog=false
event.sendInterval=30000
event.offerInterval=300000

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

# gateway config
gateway.nettyIp=127.0.0.1
gateway.nettyPort=6888
gateway.nettyConnectTimeout=5000
gateway.nettyWriteAndReadWaitTime=60000
gateway.sendInternalTime=10
gateway.initReconnectInternalTime=5
gateway.maxReconnectInternalTime=180

# service meta config
service.meta.application=default
service.meta.version=1.0.0
service.meta.project=default
service.meta.environment=
service.meta.zone=
```

其中涉及的参数与sermant-agent、Backend、动态配置中心等有关联，具体参数配置参考下面说明。

#### agent框架相关参数

| <span style="display:inline-block;width:100px">参数键</span> | <span style="display:inline-block;width:200px">说明</span>   | <span style="display:inline-block;width:70px">参数类别</span> | 默认值                                                       | 是否必须 |
| ------------------------------------------------------------ | :----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | :------: |
| agent.config.isEnhanceBootStrapEnable                        | 增强启动类加载器加载的类的开关                               | agent参数                                                    | false                                                        |    否    |
| agent.config.ignoredPrefixes                                 | 增强忽略集，该集合中定义的全限定名前缀用于排除增强过程中被忽略的类 | agent参数                                                    | com.huawei.sermant,com.huaweicloud.sermant                   |    否    |
| agent.config.ignoredInterfaces                               | 增强忽略接口集，该集合中定义的接口用于排除增强过程中被忽略的类 | agent参数                                                    | org.springframework.cglib.proxy.Factory                      |    否    |
| agent.config.combineStrategy                                 | 插件声明器的合并策略：NONE，不合并；BY_NAME，通过匹配的类名合并；ALL，所有都合并 | agent参数                                                    | ALL                                                          |    否    |
| agent.config.serviceInjectList                               | 拦截插件服务名单                                             | agent参数                                                    | com.huawei.discovery.service.lb.filter.NopInstanceFilter<br>,com.huawei.discovery.service.lb.DiscoveryManager |    否    |
| agent.config.isShowEnhanceLogEnable                          | 是否在增强过程中输出检索日志                                 | agent参数                                                    | false                                                        |    否    |
| agent.config.enhancedClassOutputPath                         | 被增强类的输出路径，如果为空，则不输出                       | agent参数                                                    | -                                                            |    否    |
| agent.config.isOutputEnhancedClasses                         | 是否输出被增强的类的字节码文件                               | agent参数                                                    | false                                                        |    否    |

#### 核心服务相关参数

| **参数键**         | **说明**               | **参数类别** | **默认值** | **是否必须** |
| ------------------ | ---------------------- | ------------ | ---------- | :----------: |
| agent.service.heartbeat.enable | 心跳开关 | 核心服务参数  | false      |      否      |
| agent.service.gateway.enable    | 网关开关    | 核心服务参数  | false  |      否      |
| agent.service.tracing.enable  | 链路开关    | 核心服务参数  | false       |      否      |
| agent.service.visibility.enable | 服务可见性开关 | 核心服务参数  | false      |      否      |
| agent.service.inject.enable    |  spring类注入开关   | 核心服务参数  | true  |      否      |
| agent.service.monitor.enable  | 监控开关    | 核心服务参数  | false       |      否      |
| agent.service.dynamic.config.enable  | 动态配置开关    | 核心服务参数  | true       |      否      |


#### 事件上报相关参数

| **参数键**         | **说明**               | **参数类别** | **默认值** | **是否必须** |
| ------------------ | ---------------------- | ------------ | ---------- | :----------: |
| event.enable | 事件开关 | 事件上报参数  | false      |      否      |
| event.offerWarnLog    | 上报Warn日志开关    | 事件上报参数  | false  |      否      |
| event.offerErrorLog  | 上报Error日志开关    | 事件上报参数  | false       |      否      |
| event.sendInterval    | 事件发送时间间隔(ms)    | 事件上报参数  | 30000  |      否      |
| event.offerInterval  | 事件记录时间间隔(ms),在一定时间内重复事件压缩    | 事件上报参数  |   300000     |      否      |

#### 动态配置中心相关参数

| <span style="display:inline-block;width:100px">参数键</span> |<span style="display:inline-block;width:200px">说明</span>|参数类别|                            默认值                            | 是否必须 |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :------: | -------- | :------: |
| dynamic.config.timeoutValue | 配置中心服务器连接超时时间，单位：ms | 动态配置中心参数 | 30000 | 是 |
| dynamic.config.defaultGroup | 动态配置默认分组 | 动态配置中心参数 | sermant | 是 |
| dynamic.config.serverAddress | 配置中心服务器地址，必须形如：{@code host:port[(,host:port)...]} | 动态配置中心参数 | 127.0.0.1:2181 | 是 |
| dynamic.config.dynamicConfigType | 动态配置中心服务实现类型，当前支持Zookeeper和Kie。取值范围为NOP(无实现)、ZOOKEEPER或KIE。 | 动态配置中心参数 | ZOOKEEPER | 是 |
| dynamic.config.connectRetryTimes | 动态配置中心ZOOKEEPER：启动Sermant时的配置中心的重连次数 | 动态配置中心参数 | 5 | 是 |
| dynamic.config.connectTimeout | 动态配置中心ZOOKEEPER：启动Sermant时连接配置中心的时间时间 | 动态配置中心参数 | 1000 | 是 |
| dynamic.config.userName | 动态配置中心ZOOKEEPER：配置中心的用户名 | 动态配置中心参数 | - | 否 |
| dynamic.config.password | 动态配置中心ZOOKEEPER：配置中心的加密后的密码 | 动态配置中心参数 | - | 否 |
| dynamic.config.privateKey | 动态配置中心ZOOKEEPER：用于对密码加解密的密钥 | 动态配置中心参数 | - | 否 |
| dynamic.config.enableAuth | 动态配置中心ZOOKEEPER：是否开启配置中心授权，开启后需验证用户名密码 | 动态配置中心参数 | false | 否 |

#### 心跳相关参数

| **参数键**         | **说明**               | **参数类别** | **默认值** | **是否必须** |
| ------------------ | ---------------------- | ------------ | ---------- | :----------: |
| heartbeat.interval | 心跳发送间隔，单位：ms | Heartbeat参数  | 30000      |      否      |

#### 网关相关参数

| **参数键**         | **说明**               | **参数类别** | **默认值** | **是否必须** |
| ------------------ | ---------------------- | ------------ | ---------- | :----------: |
| gateway.nettyIp    | Gateway消息接收地址    | Gateway参数  | 127.0.0.1  |      否      |
| gateway.nettyPort  | Gateway消息接收端口    | Gateway参数  | 6888 |      否      |
| gateway.nettyConnectTimeout    | Gateway连接超时时间    | Gateway参数  | 5000（ms） |      否      |
| gateway.nettyWriteAndReadWaitTime  | Gateway读/写超时时间    | Gateway参数  | 60000（ms）   |      否      |
| gateway.sendInternalTime=10 | Gateway消息发送时间间隔 | Gateway参数 | 10（s） | 否 |
| gateway.initReconnectInternalTime=5 | Gateway重连退避算法初始连接间隔 | Gateway参数 | 5（s） | 否 |
| gateway.maxReconnectInternalTime=180 | Gateway重连退避算法最大连接间隔 | Gateway参数 | 180（s） | 否 |

#### 服务元数据相关参数

| <span style="display:inline-block;width:100px">参数键</span> | <span style="display:inline-block;width:200px">说明</span>   |    参数类别    | 默认值  | 是否必须 |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :------------: | ------- | :------: |
| service.meta.application                                     | 应用名称，用于服务注册等服务治理场景                         | 服务元数据参数 | default |    否    |
| service.meta.version                                         | 服务版本，用于服务注册、标签路由等服务治理场景               | 服务元数据参数 | 1.0.0   |    否    |
| service.meta.project                                         | 服务命名空间，用于服务注册等服务治理场景                     | 服务元数据参数 | default |    否    |
| service.meta.environment                                     | 服务所在环境，用于服务注册等服务治理场景                     | 服务元数据参数 | -       |    否    |
| service.meta.zone                                            | 服务所在az，用于服务注册、标签路由等服务治理场景             | 服务元数据参数 | -       |    否    |
| service.meta.parameters                                      | 服务额外参数信息，以key:value形式配置，逗号分隔多个键值对，用于服务注册、标签路由等服务治理场景 | 服务元数据参数 | -       |    否    |

#### 插件相关参数
| <span style="display:inline-block;width:100px">参数键</span> |  <span style="display:inline-block;width:200px">说明</span>  |    参数类别    | 默认值  | 是否必须 |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :------------- | :------ | :------- |
|                visibility.service.enableStart                |     服务可见性信息重推开关，当agentCore与Netty重连后会推送全量服务可见性数据 | 插件参数 | false |    否    |

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
  - service-removal
  - service-visibility
profiles:                # profiles自定义不同场景需配置挂载的插件列表
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

其中各参数配置说明如下：

|  参数键  |                 说明                 | 是否必须 |
| :------: | :----------------------------------: | :------: |
| plugins  |    以列表形式配置默认需加载的插件    |    是    |
| profiles | 自定义配置各个场景下需挂载的插件列表 |    否    |
| profile  |      自定义配置需加载的场景名称      |    否    |

启动时，`plugins` 下配置的插件都会挂载至宿主应用，`profile`下的插件列表也可按需配置生效。

**插件的加载顺序**

Sermant插件的加载顺序如下：

1. 首先按照`plugins`中配置的插件顺序来加载默认插件。
2. 然后再按照`profile`配置的场景顺序来加载场景插件列表，各场景的插件加载顺序也和配置文件中的顺序一致。
3. 如果`profiles`中的配置的插件已经在之前加载过，则不再重复加载。
4. 不同插件的相同拦截点的字节码增强的**生效顺序与插件加载顺序**是一致的。

### 参数配置方式

Sermant项目sermant-agent的properties配置文件和各插件的中yaml配置文件都支持下列几种参数配置方式，以配置文件中的`gateway.nettyIp=127.0.0.1`为例：

1. 直接修改配置文件，即在配置文件中修改`gateway.nettyIp=127.0.0.1`
2. 通过应用启动时的-D参数配置，即`-Dgateway.nettyIp=127.0.0.1`
3. 通过环境变量配置，即在环境变量中新增`gateway.nettyIp=127.0.0.1`
4. 通过sermant-agent启动参数配置，即`-javaagent:sermant-agent.jar=gateway.nettyIp=127.0.0.1`

以上四种方式，配置生效的优先级从高到低排列为：4 > 3 > 2 > 1。

其中，后三种参数配置值的获取方式支持多种格式，以配置文件中的`gateway.nettyIp=127.0.0.1`为例，下列配置格式都可识别：

```txt
gateway.nettyIp=127.0.0.1
gateway_nettyIp=127.0.0.1
gateway-nettyIp=127.0.0.1
GATEWAY.NETTYIP=127.0.0.1
GATEWAY_NETTYIP=127.0.0.1
GATEWAY-NETTYIP=127.0.0.1
gateway.nettyip=127.0.0.1
gateway_nettyip=127.0.0.1
gateway-nettyip=127.0.0.1
gateway.netty.ip=127.0.0.1
gateway_netty_ip=127.0.0.1
gateway-netty-ip=127.0.0.1
GATEWAY.NETTY.IP=127.0.0.1
GATEWAY_NETTY_IP=127.0.0.1
GATEWAY-NETTY-IP=127.0.0.1
```

sermant-agent将从上至下依次检索各项配置值是否通过启动参数、环境变量、-D参数来配置。

> **注意：** 通过容器场景的env修改配置，请将点（.）可用下划线（_）替代！！！
> 
> 原因：因为一些OS镜像无法识别带 . 的env

举个例子：如需想通过pod的env修改配置文件中的`gateway.nettyIp=127.0.0.1`则

``` yaml
  env:
  - name: "gateway_nettyIp"
    value: "127.0.0.2"
```



## 支持版本

### sermant-agent 支持的版本

sermant-agent支持Linux、Windows，基于JDK 1.8开发，建议使用JDK 1.8版本及以上版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## 启动和结果验证

### 启动

以**Sermant-example**项目 [demo-application](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-application)为宿主应用，执行以下命令挂载sermant-agent启动demo-application:

```shell
# Run under Windows
java -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test -jar demo-application.jar
```

```shell
# Run under Linux
java -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test -jar demo-application.jar
```

### 验证

查看demo-application的日志文件开头是否包含以下内容：

```shell
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
```

若日志如上正常输出，则说明sermant-agent挂载成功。