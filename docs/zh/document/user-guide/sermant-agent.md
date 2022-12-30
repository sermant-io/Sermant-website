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

参数`agentArgs`的格式要求形如`key1=value1,key1=value1[(,keyN=valueN)...]`，以`','`分割键值对，以`'='`分割键值，形成`Map`结构。

### 启动参数

**启动参数**配置参考如下：

|入参键|启动配置键|启动参数键|含义|默认值|不为空|备注|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|appName|app.name|appName|应用名称|default|是|/|
|instanceName|instance.name|instanceName|实例名称|default|是|/|
|appType|app.type|appType|应用类型|0|是|/|
|/|/|agentPath|入口包目录|入口包目录|是|无需配置|
|/|/|sermant.config.file|统一配置文件|统一配置文件|是|无需配置|
|/|/|sermant.plugin.setting.file|插件设定文件|插件设定文件|是|无需配置|
|/|/|sermant.plugin.package.dir|插件包目录|插件包目录|是|无需配置|
|/|/|sermant.log.setting.file|日志配置文件|日志配置文件|是|无需配置|

入参`agentArgs`中也可以为**启动参数**配置更多地值。

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