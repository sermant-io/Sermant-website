# Sermant Agent Debug指南

本文档主要用于说明Sermant Agent进行Debug的相关问题。

## 常见问题：在IDEA中挂载Sermant Agent启动宿主微服务出现`java.lang.ClassNotFoundException`问题
### 问题原因
当宿主微服务挂载Sermant Agent启动时，流控、负载均衡插件会在SpringFactoriesLoader中注入插件自定义的配置源。Spring项目在IDEA中启动时使用`AppClassLoader`加载类。在通过JAR包启动时，类加载器会变为`LaunchedURLClassLoader`。我们对`LaunchedURLClassLoader`进行了增强从而能够加载到Sermant的自定义类，`AppClassLoader`则无法加载并抛出`java.lang.ClassNotFoundException`。

### 解决方式
**不使用流控和负载均衡插件（适用于JAR包或IDEA启动）：**
1. 宿主微服务通过JAR包方式挂载Sermant Agent启动
2. 从`${Sermant-path}/config/plugin.yaml`文件中移除流控和负载均衡插件，然后在IDEA中挂载Sermant Agent启动宿主微服务。

**使用流控或负载均衡插件：**

1. 宿主微服务通过JAR包方式挂载Sermant Agent启动。

> 说明：${Sermant-path}为Sermant包路径

## 对Sermant Agent进行Debug的通用方法（适用于IDEA启动或JAR包启动宿主微服务）
### 本地Debug
Sermant Agent模块和宿主微服务模块在一个Project中，通过IDEA菜单栏选择"Run -> Edit Configurations"，然后在宿主微服务启动项的配置中添加VM Option命令：`-javaagent:${Sermant-path}/sermant-agent.jar`，并通过Debug模式启动宿主微服务即可对Sermant进行开发调试。

> 说明：${Sermant-path}为Sermant包路径
### 远程Debug
Sermant Agent源码和宿主微服务不在一个Project时，对Sermant进行开发调试需要使用IDEA提供的远程Debug功能。远程调试使开发人员能够直接诊断服务器或其它运行进程上的问题。下面将详细介绍远程Debug的使用步骤。

#### 步骤一 创建远程Debug配置项
在Sermant的源码项目中通过在菜单栏选择`Run -> Edit Configurations`来添加新的远程调试配置。如下图所示，点击`+`号，然后选择`Remote JVM Debug`：
<MyImage src="/docs-img/remote_jvm_debug_1.png"></MyImage>

在远程Debug配置项中，可自定义远程Debug配置项的名称、微服务运行时所在服务器的IP地址以及进行调试的端口号，如下图红色框选中的区域所示：
<MyImage src="/docs-img/remote_jvm_debug_2.png"></MyImage>
配置信息完成后，复制远程微服务启动需添加的命令行参数（上图的最下方红框内容）。
#### 步骤二 宿主微服务启动
参考如下命令启动宿主微服务：
```shell
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -javaagent:${sermant-path}/sermant-agent.jar -jar spring-provider.jar
```
> 说明1：${Sermant-path}为Sermant包路径

> 说明2：`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005`为步骤二复制的微服务启动需添加的命令行参数
#### 步骤三 代码调试
宿主微服务启动后，在Sermant的源码项目中通过在菜单栏选择`Run -> Debug -> ${Debug-name}`启动Debug，即可通过添加断点对Sermant代码进行调试。

> 注意：务必保证源代码和运行代码一致

> 说明：${Debug-name}为`Remote JVM Debug`配置项的名称