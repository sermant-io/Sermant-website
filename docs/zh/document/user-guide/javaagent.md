# JavaAgent使用手册

在一个Java 程序（带有 main 函数的 Java 类）运行时，通过 -javaagent 参数指定`sermant-agent.jar`。

```shell
-javaagent:sermant-agent.jar[=${options}]
```

其中`${options}`为启动入参，会作为`premain`方法的入参`agentArgs`传入。

```java
public static void premain(String agentArgs, Instrumentation inst);
```

参数`agentArgs`的格式要求形如`key1=value1,key1=value1[(,keyN=valueN)...]`，以`','`分割键值对，以`'='`分割键值，形成`Map`结构。

其中需要注意的是，`agentArgs`中必须包含一个`key`为`appName`的键值对，因此启动时添加的*Java*命令参数准确来说应该如下：

```shell
-javaagent:sermant-agent.jar=appName=${appName}[,${otherOptions}]
```

其中`${appName}`表示应用名称，`${otherOptions}`表示其他参数。

更多*JavaAgent*相关内容可以参见官方文档对[java.lang.instrument](https://docs.oracle.com/javase/8/docs/api/java/lang/instrument/package-summary.html)包的详解

## 启动参数

**启动参数**中固定内容如下：

|入参键|启动配置键|启动参数键|含义|默认值|不为空|备注|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|appName|app.name|appName|应用名称|/|是|入参中必须存在|
|instanceName|instance.name|instanceName|实例名称|default|是|/|
|appType|app.type|appType|应用类型|0|是|/|
|env|env|env|/|/|否|/|
|envTag|env.tag|envTag|/|/|否|/|
|business|business|business|/|/|否|/|
|subBusiness|sub.business|subBusiness|/|/|否|/|
|envSecret|env.secret|envSecret|/|/|否|/|
|accessKey|access.key|access.key|/|/|否|/|
|secretKey|secret.key|secret.key|/|/|否|/|
|masterAddress|master.address|master.address|/|/|否|/|
|/|/|agentPath|入口包目录|入口包目录|是|无需配置|
|/|/|bootPath|/|/|是|已废弃|
|/|/|pluginsPath|/|/|是|已废弃|
|/|/|sermant.config.file|统一配置文件|统一配置文件|是|无需配置|
|/|/|sermant.plugin.setting.file|插件设定文件|插件设定文件|是|无需配置|
|/|/|sermant.plugin.package.dir|插件包目录|插件包目录|是|无需配置|
|/|/|sermant.log.setting.file|日志配置文件|日志配置文件|是|无需配置|

入参`agentArgs`中可以为**启动参数**配置更多地值。