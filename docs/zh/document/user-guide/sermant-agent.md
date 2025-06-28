# Sermant Agent使用手册

Sermant Agent是提供字节码增强基础能力及各类服务治理能力的核心组件。[Sermant使用介绍](readme.md)中描述的产品目录`sermant-agent-x.x.x/agent`目录下内容即为Sermant Agent组件的各模块。Sermant Agent的主体为Sermant提供了字节码增强基础能力及开发框架，同时支持心跳功能、动态配置功能、日志功能、事件上报等公共基础能力，当前已支持`premain`和`agentmain`两种方式启动。

Sermant Agent插件目录中则由各插件提供了标签路由、限流降级、双注册等服务治理能力，当前已支持在宿主服务运行时动态安装和卸载服务治理插件（需要插件支持动态安装和卸载）。

## 支持版本

Sermant Agent支持Linux、Windows，基于JDK 1.8开发，建议使用JDK 1.8版本及以上版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

## premain方式启动：静态挂载

通过为宿主服务配置`-javaagent`指令来利用`premain`方式启动Sermant Agent ，基于[快速开始](../QuickStart.md)所构建环境，执行以下命令启动Sermant Agent:

```shell
# linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar spring-provider.jar

# windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar spring-provider.jar
```

查看`spring-provider.jar`的日志开头是否包含以下内容：

```shell
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
```

若日志如上正常输出，则说明Sermant Agent启动成功，打开浏览器并导航到`http://localhost:8900`，可以看到已经有Sermant Agent实例，如下图所示效果：

<MyImage src="/docs-img/backend_sermant_info.jpg"></MyImage>

## agentmain方式启动：动态挂载

### 准备工作

- 基于[快速开始](../QuickStart.md)所构建环境，首先启动宿主服务`spring-provider.jar`

```shell
java -jar spring-provider.jar
```

- 通过`agentmain`方式启动，需要借助`Attach API`来完成。下载[Sermant Release包](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz)并解压，在`./tools`目录下获取`AgentLoader`脚本

### Agent挂载

为了基于`Attach API`实现Agent挂载，请使用如下指令运行`AgentLoader`


```shell
# Linux、MacOS
java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader

# Windows 已正确配置JAVA所需环境变量
java AgentLoader
```

```shell
# 运行指令根据所使用操作系统进行选择，此处以Linux、MacOS指令编写
$ java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader
请选择需要使用Sermant Agent的Java进程：
0: xxxxx AgentLoader # xxxxx为进程号，此处模糊
1: xxxxx spring-provider.jar # xxxxx为进程号，此处模糊
2: xxxxx sermant-backend-2.3.0.jar # xxxxx为进程号，此处模糊
请输入需要使用Sermant Agent的Java进程序号：1 # 选择spring-provider的进程序号
您选择的进程 ID 是：xxxxx # xxxxx为进程号，此处模糊
请输入Sermant Agent所在目录（默认采用该目录下sermant-agent.jar为入口）：${path}/sermant-agent-x.x.x/agent # 填充Sermant Agent所在目录
请选择需要执行的命令：
0: INSTALL-AGENT
命令说明：安装Sermant Agent，同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件
1: UNINSTALL-AGENT
命令说明：卸载Sermant Agent，同时卸载所有已安装插件
2: INSTALL-PLUGINS
命令说明：安装插件至Sermant Agent中，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
3: UNINSTALL-PLUGINS
命令说明：卸载Sermant Agent中已安装的插件
4: UPDATE-PLUGINS
命令说明：更新Sermant Agent中已安装的插件
5: CHECK-ENHANCEMENT
命令说明：查询Sermant Agent已安装插件和相应插件对应的增强信息（包括被增强的类和方法，及对应的拦截器）
6: INSTALL-EXTERNAL-AGENT
命令说明：安装外部Agent，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
请输入您要执行命令的序号：0 # 此处选择安装Sermant Agent的命令序号
请输入向Sermant Agent传入的参数(可为空, 示例格式：key1=value1,key2=value2)：appName=default # 配置Sermant Agent参数，此处可为空
```

按照指引填充完成后在`spring-provider.jar`日志中可以看到以下内容：

```shell
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
```

若日志如上正常输出，则说明Sermant Agent读取启动指令成功并开始执行安装，打开浏览器并导航到`http://localhost:8900`，可以看到已经有Sermant Agent实例，如下图所示效果：

<MyImage src="/docs-img/sermant-agent-agentmain-start.png"></MyImage>

### Agent卸载

> 注：为避免部分基于premain启动方式开发的服务治理能力在卸载时引发不可预知的异常，Sermant Agent对卸载进行限制，通过agentmain方式启动的Sermant Agent才支持卸载，通过premain方式启动的Sermant Agent不支持。

在通过[agentmain方式](#Agent挂载)启动后，可以对Sermant Agent进行卸载，再次运行`AgentLoader`，并通过传入参数下发卸载Sermant Agent的指令`command=UNINSTALL-AGENT`：

```shell
# 运行指令根据所使用操作系统进行选择，此处以Linux、MacOS指令编写
$ java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader
请选择需要使用Sermant Agent的Java进程：
0: xxxxx AgentLoader # xxxxx为进程号，此处模糊
1: xxxxx spring-provider.jar # xxxxx为进程号，此处模糊
2: xxxxx sermant-backend-1.2.0.jar # xxxxx为进程号，此处模糊
请输入需要使用Sermant Agent的Java进程序号：1 # 选择spring-provider的进程序号
您选择的进程 ID 是：xxxxx # xxxxx为进程号，此处模糊
请输入Sermant Agent所在目录（默认采用该目录下sermant-agent.jar为入口）：${path}/sermant-agent-x.x.x/agent # 填充Sermant Agent所在目录
请选择需要执行的命令：
0: INSTALL-AGENT
命令说明：安装Sermant Agent，同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件
1: UNINSTALL-AGENT
命令说明：卸载Sermant Agent，同时卸载所有已安装插件
2: INSTALL-PLUGINS
命令说明：安装插件至Sermant Agent中，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
3: UNINSTALL-PLUGINS
命令说明：卸载Sermant Agent中已安装的插件
4: UPDATE-PLUGINS
命令说明：更新Sermant Agent中已安装的插件
5: CHECK-ENHANCEMENT
命令说明：查询Sermant Agent已安装插件和相应插件对应的增强信息（包括被增强的类和方法，及对应的拦截器）
6: INSTALL-EXTERNAL-AGENT
命令说明：安装外部Agent，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
请输入您要执行命令的序号：1 # 此处选择卸载Sermant Agent的命令序号
```

按照指引填充完成后在`spring-provider.jar`日志中可以看到以下内容：

```shell
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Sermant for artifact is running, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Execute command: UNINSTALL-AGENT
```

若日志如上正常输出，打开浏览器并导航到`http://localhost:8900`，可以看到已经有Sermant Agent实例已经下线（**状态为灰色**），则说明Sermant Agent卸载成功，如下图所示效果：

<MyImage src="/docs-img/sermant-agent-agentmain-uninstall-success.png"></MyImage>

> 注：该能力可以在开发态通过调用sermant-agentcore-core所提供 [AgentCoreEntrance](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/AgentCoreEntrance.java)::uninstall()接口来实现

### 动态安装插件

在通过[agentmain方式](#Agent挂载)启动后，可以动态的安装服务治理插件（需要插件支持动态安装和卸载），再次运行`AgentLoader`，并通过传入参数下发动态安装插件的指令`command=INSTALL-PLUGINS:pluginA/pluginB`：

> 注：可以一次安装多个插件，插件名通过 '/' 进行分隔，pluginA、pluginB为插件名，需要按照实际实际填写，本示例使用[monitor](../plugin/monitor.md)插件

```shell
# 运行指令根据所使用操作系统进行选择，此处以Linux、MacOS指令编写
$ java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader
请选择需要使用Sermant Agent的Java进程：
0: xxxxx AgentLoader # xxxxx为进程号，此处模糊
1: xxxxx spring-provider.jar # xxxxx为进程号，此处模糊
2: xxxxx sermant-backend-1.2.0.jar # xxxxx为进程号，此处模糊
请输入需要使用Sermant Agent的Java进程序号：1 # 选择spring-provider的进程序号
您选择的进程 ID 是：xxxxx # xxxxx为进程号，此处模糊
请输入Sermant Agent所在目录（默认采用该目录下sermant-agent.jar为入口）：${path}/sermant-agent-x.x.x/agent # 填充Sermant Agent所在目录
请选择需要执行的命令：
0: INSTALL-AGENT
命令说明：安装Sermant Agent，同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件
1: UNINSTALL-AGENT
命令说明：卸载Sermant Agent，同时卸载所有已安装插件
2: INSTALL-PLUGINS
命令说明：安装插件至Sermant Agent中，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
3: UNINSTALL-PLUGINS
命令说明：卸载Sermant Agent中已安装的插件
4: UPDATE-PLUGINS
命令说明：更新Sermant Agent中已安装的插件
5: CHECK-ENHANCEMENT
命令说明：查询Sermant Agent已安装插件和相应插件对应的增强信息（包括被增强的类和方法，及对应的拦截器）
6: INSTALL-EXTERNAL-AGENT
命令说明：安装外部Agent，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
请输入您要执行命令的序号：2 # 此处选择安装Sermant Agent插件的命令序号
请输入您要操作的插件名称，多个插件使用/分隔：monitor # 此处传入需安装的插件名称 本示例以monitor插件进行演示
请输入向Sermant Agent传入的参数(可为空, 示例格式：key1=value1,key2=value2)：# 配置Sermant Agent参数，此处可为空
```

按照指引填充完成后在`spring-provider.jar`日志中可以看到以下内容：

```shell
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Sermant for artifact is running, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Execute command: INSTALL-PLUGINS:monitor # 本示例以monitor进行演示
```

若日志如上正常输出，则说明插件安装成功，打开浏览器并导航到`http://localhost:8900`，可以看到插件已被成功安装，插件列可以看到当前安装的插件，如下图所示效果：

**动态安装插件前**

<MyImage src="/docs-img/sermant-agent-dynamic-install-plugin-before.png"></MyImage>

**动态安装插件后**

<MyImage src="/docs-img/sermant-agent-dynamic-install-plugin-success.png"></MyImage>

> 注：该能力可以在开发态通过调用sermant-agentcore-core所提供[PluginManager](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/PluginManager.java)::install(Set pluginNames)方法来实现

### 重复安装插件
该能力的推出主要因为在一些场景中，插件的生效范围有动态扩展的诉求，主要是扩展增强的类和方法，并且需要保证已经生效的部分不会受到影响，在这种情况下，就不能通过卸载插件，调整配置后重新安装来解决此类场景的问题。例如故障注入场景中，针对不同的故障可能需要对不同的类进行字节码增强，并且需要按照测试方案中的编排逐渐注入各式各样的故障场景，在这种情况下，我们就不能通过卸载再重新安装的方式来完成这项工作，只能将负责故障注入的插件安装多次来解决这个问题，这就要用到重复安装插件的能力，重复安装插件将会复用静态资源，Sermant内部通过插件管理来隔离重复安装的插件。

#### 如何实施插件的重复安装？
如需重复安装插件，在执行动态插件安装时需要将插件名后通过`#`号为本次安装的插件添加一个编码，如：
```shell
command=INSTALL-PLUGINS:pluginA#FIRST
```
通过这种方式，插件就可以重复安装。

> 注：当卸载插件时，如果想卸载通过携带编码安装的插件，在卸载指令中也需要配置携带编码的插件名。


### 动态卸载插件

在通过[agentmain方式](#Agent挂载)启动并[动态安装插件](#动态安装插件)后，可以动态的卸载服务治理插件（需要插件支持动态安装和卸载），再次运行`AgentLoader`，并通过传入参数下发动态卸载插件的指令`command=UNINSTALL-PLUGINS:pluginA/pluginB`：

> 注：可以一次卸载多个插件，插件名通过 '/' 进行分隔，pluginA、pluginB为插件名，需要按照实际实际填写，本示例使用[monitor](../plugin/monitor.md)插件

```shell
# 运行指令根据所使用操作系统进行选择，此处以Linux、MacOS指令编写
$ java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader
请选择需要使用Sermant Agent的Java进程：
0: xxxxx AgentLoader # xxxxx为进程号，此处模糊
1: xxxxx spring-provider.jar # xxxxx为进程号，此处模糊
2: xxxxx sermant-backend-1.2.0.jar # xxxxx为进程号，此处模糊
请输入需要使用Sermant Agent的Java进程序号：1 # 选择spring-provider的进程序号
您选择的进程 ID 是：xxxxx # xxxxx为进程号，此处模糊
请输入Sermant Agent所在目录（默认采用该目录下sermant-agent.jar为入口）：${path}/sermant-agent-x.x.x/agent # 填充Sermant Agent所在目录
请选择需要执行的命令：
0: INSTALL-AGENT
命令说明：安装Sermant Agent，同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件
1: UNINSTALL-AGENT
命令说明：卸载Sermant Agent，同时卸载所有已安装插件
2: INSTALL-PLUGINS
命令说明：安装插件至Sermant Agent中，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
3: UNINSTALL-PLUGINS
命令说明：卸载Sermant Agent中已安装的插件
4: UPDATE-PLUGINS
命令说明：更新Sermant Agent中已安装的插件
5: CHECK-ENHANCEMENT
命令说明：查询Sermant Agent已安装插件和相应插件对应的增强信息（包括被增强的类和方法，及对应的拦截器）
6: INSTALL-EXTERNAL-AGENT
命令说明：安装外部Agent，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
请输入您要执行命令的序号：3 # 此处选择卸载Sermant Agent中已安装插件的命令序号
请输入您要操作的插件名称，多个插件使用/分隔：monitor # 此处传入需卸载的插件名称 本示例以monitor插件进行演示
```

按照指引填充完成后在`spring-provider.jar`日志中可以看到以下内容：

```shell
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Sermant for artifact is running, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Execute command: UNINSTALL-PLUGINS:monitor #本示例以monitor进行演示
# 该日志会展示本次卸载中恢复了多少被字节码增强过的类
[Byte Buddy] REDEFINE BATCH #0 [1 of 1 type(s)]
[Byte Buddy] REDEFINE COMPLETE 1 batch(es) containing 1 types [0 failed batch(es)]
[Byte Buddy] REDEFINE COMPLETE 1 batch(es) containing 0 types [0 failed batch(es)]
```

若日志如上正常输出，打开浏览器并导航到`http://localhost:8900`，可以看到插件已被成功卸载，插件列可以看到当前安装的插件，如下图所示效果：

**动态卸载插件前**

<MyImage src="/docs-img/sermant-agent-dynamic-uninstall-plugin-before.png"></MyImage>

**动态卸载插件后**

<MyImage src="/docs-img/sermant-agent-dynamic-uninstall-plugin-success.png"></MyImage>

> 注：该能力可以在开发态通过调用sermant-agentcore-core所提供[PluginManager](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/PluginManager.java)::uninstall(Set pluginNames)方法来实现

### 一键挂载Agent和插件

[Sermant动态安装、卸载脚本](https://github.com/sermant-io/Sermant/blob/develop/scripts/attach.c)是基于Java Attach API实现的C语言脚本，可以将sermant挂载至**虚拟机上的jvm进程**或**容器上的jvm进程**。

> 注：该脚本仅限**linux系统**下使用

#### 参数配置

- `-path=`：必填参数，后接sermant-agent.jar的**绝对路径**

- `-pid=`：必填参数，后接宿主应用的pid，可使用`ps -ef`等命令查看

- `-command=`：必填参数，后接挂载Sermant的命令，支持的指令见[Sermant指令说明](#sermant指令说明)。

- `-nspid=`：当宿主应用容器运行时为必填参数，后接宿主应用的nspid，可使用`cat /proc/{pid}/status`命令查看。当宿主应用非容器运行时，此参数请勿填写

#### 脚本使用步骤

##### 步骤1. 编译`jvm_attach.c`

```bash
gcc attach.c -o attach
```

> 注：请确保已经安装gcc

##### 步骤2. 执行attach脚本

```bash
./attach -path={sermant-path}/sermant-agent.jar -pid={pid} -command={COMMAND}
```

脚本执行情况如下所示：

```shell
[root@b6b9af8e5610 root]# ./attach -path=/home/sermant-agent-1.0.0/agent/sermant-agent.jar -pid=494 -command=INSTALL-PLUGINS:database-write-prohibition
[INFO]: PATH: /home/sermant-agent-1.0.0/agent/sermant-agent.jar
[INFO]: PID: 494
[INFO]: COMMAND: INSTALL-PLUGINS:database-write-prohibition
[INFO]: Connected to remote JVM of pid 494
[INFO]: ret code is 0, Attach success!
```

## 增强信息查询
在Sermant通过任意方式启动成功后，可以通过运行`AgentLoader`，并通过传入参数下发查询增强信息的指令`command=CHECK_ENHANCEMENT`：

> 注：增强信息查询将以**INFO级别**打印到log中，如使用该功能，请事先配置日志级别，修改方式见[日志配置](../developer-guide/log-func.md#配置)

```shell
# 运行指令根据所使用操作系统进行选择，此处以Linux、MacOS指令编写
$ java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader
请选择需要使用Sermant Agent的Java进程：
0: xxxxx AgentLoader # xxxxx为进程号，此处模糊
1: xxxxx spring-provider.jar # xxxxx为进程号，此处模糊
2: xxxxx sermant-backend-1.2.0.jar # xxxxx为进程号，此处模糊
请输入需要使用Sermant Agent的Java进程序号：1 # 选择spring-provider的进程序号
您选择的进程 ID 是：xxxxx # xxxxx为进程号，此处模糊
请输入Sermant Agent所在目录（默认采用该目录下sermant-agent.jar为入口）：${path}/sermant-agent-x.x.x/agent # 填充Sermant Agent所在目录
请选择需要执行的命令：
0: INSTALL-AGENT
命令说明：安装Sermant Agent，同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件
1: UNINSTALL-AGENT
命令说明：卸载Sermant Agent，同时卸载所有已安装插件
2: INSTALL-PLUGINS
命令说明：安装插件至Sermant Agent中，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
3: UNINSTALL-PLUGINS
命令说明：卸载Sermant Agent中已安装的插件
4: UPDATE-PLUGINS
命令说明：更新Sermant Agent中已安装的插件
5: CHECK-ENHANCEMENT
命令说明：查询Sermant Agent已安装插件和相应插件对应的增强信息（包括被增强的类和方法，及对应的拦截器）
6: INSTALL-EXTERNAL-AGENT
命令说明：安装外部Agent，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
请输入您要执行命令的序号：5 # 此处选择增强信息查询的命令序号
```

按照指引填充完成后在sermant日志中可以看到以下内容：
```shell
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:42] [Attach Listener] ---------- PLUGINS ----------
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:44] [Attach Listener] test-plugin-A:1.0.0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:44] [Attach Listener] test-plugin-B:1.0.0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:46] [Attach Listener] ---------- ENHANCEMENT ----------
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:58] [Attach Listener] test-plugin-A:1.0.0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:65] [Attach Listener] xxxxx.xxxx.TestClassA#testFunctionA(boolean,java.lang.String,java.lang.String,java.lang.String)@sun.misc.Launcher$AppClassLoader@5c647e05 [xxxx.xxxx.TestInterceptorA]
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.core.command.CheckEnhancementsCommandExecutor] [execute:65] [Attach Listener] xxxxx.xxxx.TestClassB#testFunctionB(boolean,java.lang.String,java.lang.String,java.lang.String)@sun.misc.Launcher$AppClassLoader@5c647e05 [xxxx.xxxx.TestInterceptorB,xxxx.xxxx.TestInterceptorC]
```

打印的内容格式为：
```shell
---------- PLUGINS ----------
\\ 已安装的插件列表，格式为 插件名名:插件版本
test-plugin-A:1.0.0
test-plugin-B:1.0.0
---------- ENHANCEMENT ----------
\\ 成功完成增强处理的插件，格式为 插件名:插件版本
test-plugin-A:1.0.0
\\ 该插件成功完成增强处理的信息
\\ 格式为 增强的类全限定名#增强的方法名(入参类型)@类加载器信息 [拦截器列表]
xxxxx.xxxx.TestClassA#testFunctionA(boolean,java.lang.String,java.lang.String,java.lang.String)@sun.misc.Launcher$AppClassLoader@5c647e05 [xxxx.xxxx.TestInterceptorA]
xxxxx.xxxx.TestClassB#testFunctionB(boolean,java.lang.String,java.lang.String,java.lang.String)@sun.misc.Launcher$AppClassLoader@5c647e05 [xxxx.xxxx.TestInterceptorB,xxxx.xxxx.TestInterceptorC]
```

## 在Sermant中使用和管理外部JavaAgent

本文档主要介绍如何在Sermant中挂载外部JavaAgent以及最佳实践。

### 功能介绍

Sermant是通过JavaAgent方式来实现的字节码增强和服务治理功能。无论是agentmain还是premain方式，在JVM启动时，是支持多个JavaAgent同时挂载生效的。开源社区中OpenTelemetry、Arthas、Skywalking等都有基于此方式开发的项目。因此多个JavaAgent同时作用于宿主应用上实现多种监控、运维、服务治理的功能是较为常见的需求。

#### 为什么要在Sermant中使用外部Agent

在Sermant中使用外部 Agent，可以通过开源社区或第三方解决方案直接集成已有成熟 Agent，在多场景功能需求和模块化解耦上可以体现其降低开发成本和集成开源生态的价值。

**1. 满足多场景功能需求**

在现代微服务架构中，应用通常需要同时满足以下需求：

**分布式追踪**：采集调用链数据（如 OpenTelemetry、Skywalking）。

**性能监控**：检测运行时性能瓶颈（如 Arthas、Elastic APM）。

**服务治理**：实现动态路由、限流、熔断、配置下发（Sermant 的核心功能）。

通过使用外部 Agent，可以灵活组合不同功能模块，让专注于服务治理领域的Sermant可以和其他项目组合成更加丰富的解决方案。

**2. 模块化解耦**

Sermant 的服务治理功能可以通过插件化设计实现，而使用外部 Agent 则可以进一步增强解耦性：

**职责分离**：不同 Agent 专注于各自的增强逻辑，例如一个负责追踪、一个负责监控，避免耦合复杂性。

**按需加载**：外部 Agent 可按需动态启用或关闭功能，并且不影响其他 Agent 的工作。

**3. 防止多个JavaAgent冲突**

由于JavaAgent产品实现的多样性，多个JavaAgent同时运行可能会存在兼容问题。通过提前识别兼容性，可以在确保无冲突的前提下，让其他JavaAgent和Sermant得以协同工作，互不干扰。

#### 快速开始: 以OpenTelemetry Agent为例的最佳实践

我们以OpenTelemetry Agent为例演示了如何在Sermant中使用和管理外部JavaAgent。快速上手使用教程可参考[操作和结果验证](#操作和结果验证)。

### 支持版本与限制

#### 支持版本

**已经过验证的JavaAgent**

在 Sermant 中，以下 Agent 经过验证，可以正常加载并与 Sermant 一起工作：

- **OpenTelemetry  Agent**

  版本范围：1.21.0~2.10.0

  功能：分布式链路追踪、指标采集。

  使用场景：跨服务调用链跟踪，与 Sermant 服务治理功能结合使用。

#### 使用限制

**未经验证的JavaAgent的使用**

注意，目前社区只对OpenTelemetry  Agent进行了兼容性的验证。由于JavaAgent实现方式的各有不同，需要开发者和用户自行测试验证Sermant Agent在前，其他JavaAgent在后挂载时的兼容性。若测试无问题，则可以尝试使用Sermant来进行管理。

**JavaAgent之间可能存在的冲突问题**

用户采用的多个JavaAgent产品可能采用不同的字节码增强框架(ASM、Javassist、ByteBuddy、CGLIB)来实现，而在使用不同的字节码增强框架时，可能会出现各种冲突问题，这些冲突可能导致字节码增强失效、应用程序无法启动等问题。即使是使用相同的字节码增强框架也可能会出现冲突问题。

Sermant社区成员曾对这些问题做了一些分析，您可以打开以下文章链接参考：

[字节码增强常见问题系列（一）| 记一次多个JavaAgent同时使用的类增强冲突问题及分析](https://bbs.huaweicloud.com/blogs/382800)

[字节码增强常见问题系列（二）| 兼容性难题：如何让不同字节码增强框架和谐共存？](https://bbs.huaweicloud.com/blogs/407641)

### 在Sermant使用外部Agent的方式

- **静态挂载方式1: 手动配置**

**适用部署方式**：应用通过虚机或Kubernetes部署。目前只允许挂载1个外部Agent，后续逐步考虑开放。

**使用方式**：

1. 用户需在Sermant Agent Release包中`agent/config/config.properties`文件中配置以下配置项；
2. 然后通过-javaagent命令挂载Sermant Agent启动即可。

```properties
# 是否在启动时注入外部agent，默认值为false
agent.config.externalAgent.injection=false
# 自定义外部Agent名字, 其中OTEL代表OpenTelemetry Agent已经测试验证支持，其他Agent需开发者和用户自行验证
agent.config.externalAgent.name=OTEL
# 外部Agent的文件路径，例如: /user/opentelemetry-javaagent.jar
agent.config.externalAgent.file=
```

- **静态挂载方式2: 借助Sermant Injector自动挂载(推荐)**

**适用部署方式**：应用通过Kubernetes部署。目前只允许挂载1个外部Agent，后续逐步考虑开放。

**使用前提**：已经[在Kubernetes部署Sermant Injector](sermant-injector.md)，并且制作完成Sermant Agent和外部Agent的镜像

**使用方式**：

1. 在应用的yaml中添加`env.sermant.io/external.agent.injection: "OTEL"`。其中OTEL代表OpenTelemetry Agent已经测试验证支持，其他Agent名称可自定义。

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: demo-test
     namespace: default
     labels:
       app: demo-test
   spec:
     replicas: 1
   selector:
       matchLabels:
         app: demo-test
     template:
       metadata:
         labels:
           app: demo-test
           sermant-injection: enabled
         annotations:
           # key为env.sermant.io/external.agent.injection，value表示自定义注入的外部Agent名字，其中OTEL代表OpenTelemetry Agent已经测试验证支持
             env.sermant.io/external.agent.injection: "OTEL"
       spec:
         containers:
         - name: image
           image: image:1.0.0
           ports: 
           - containerPort: 8080
   ```

2. 在K8s中启动正常启动应用即可

- **动态挂载方式1: 使用脚本手动挂载**

**适用部署方式**：应用通过虚机部署。可挂载多个外部Agent（不推荐，多个Agent兼容性问题很难保证）。

**使用方式**：按照Sermant使用手册中的[agentmain方式启动：动态挂载](sermant-agent.md#agentmain方式启动：动态挂载)指南来使用脚本，按照以下命令提示执行。

```shell
# 运行指令根据所使用操作系统进行选择，此处以Linux、MacOS指令编写
$ java -cp ./:$JAVA_HOME/lib/tools.jar AgentLoader
请选择需要使用Sermant Agent的Java进程：
0: xxxxx AgentLoader # xxxxx为进程号，此处模糊
1: xxxxx spring-provider.jar # xxxxx为进程号，此处模糊
2: xxxxx sermant-backend-1.2.0.jar # xxxxx为进程号，此处模糊
请输入需要使用Sermant Agent的Java进程序号：1 # 选择spring-provider的进程序号
您选择的进程 ID 是：xxxxx # xxxxx为进程号，此处模糊
请输入Sermant Agent所在目录（默认采用该目录下sermant-agent.jar为入口）：${path}/sermant-agent-x.x.x/agent # 填充Sermant Agent所在目录
请选择需要执行的命令：
0: INSTALL-AGENT
命令说明：安装Sermant Agent，同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件
1: UNINSTALL-AGENT
命令说明：卸载Sermant Agent，同时卸载所有已安装插件
2: INSTALL-PLUGINS
命令说明：安装插件至Sermant Agent中，Sermant Agent未安装时会自动安装Agent（同时安装plugins.yaml配置文件中dynamicPlugins.active下的所有插件）
3: UNINSTALL-PLUGINS
命令说明：卸载Sermant Agent中已安装的插件
4: UPDATE-PLUGINS
命令说明：更新Sermant Agent中已安装的插件
5: CHECK-ENHANCEMENT
命令说明：查询Sermant Agent已安装插件和相应插件对应的增强信息（包括被增强的类和方法，及对应的拦截器）
6: INSTALL-EXTERNAL-AGENT
命令说明：安装外部Agent
请输入您要执行命令的序号：6 # 此处选择安装外部Agent的命令序号
请输入您要安装的Agent名字：OTEL # 此处传入需挂载的外部Agent名字，本示例以OpenTelemetry Agent来进行说明
请输入您要安装的Agent路径：/user/opentelemetry-javaagent.jar # 此处传入外部Agent的文件路径
请输入向Sermant Agent或外部Agent传入的参数(可为空, 示例格式：key1=value1,key2=value2)：# 配置Sermant Agent参数或外部Agent参数，此处可为空
```

- **动态挂载方式2: 借助Sermant Backend轻松完成挂载(推荐)**

**适用部署方式**：应用通过虚机或Kubernetes部署。可挂载多个外部Agent（不推荐，多个Agent兼容性问题很难保证）。

**使用前提**：已部署[Sermant Backend](sermant-backend.md)和[动态配置中心](configuration-center.md)。应用已挂载Sermant Agent（需开启热插拔服务）并且心跳上报至Sermant Backend

**使用方式**：

1. 点击实例状态标签页
2. 选择状态为在线的实例，点击热插拔按钮
3. 在弹框中选择命令类型：安装外部Agent。并填写Agent名称、Agent路径等信息。
4. 点击确认即可下发挂载指令实现外部Agent的挂载

<MyImage src="/docs-img/install-external-agent.png"></MyImage>

该方式可以通过外部Agent挂载的状态和上报的事件来查看结果。

### 操作和结果验证

本节以Sermant Backend的方式来验证外部Agent的使用和管理。

#### 准备工作

部署准备工作可参考[Sermant Backend操作和结果验证](sermant-backend.md#操作和结果验证)部分的1、2、3小节。

#### 挂载外部Agent的操作和验证

**挂载操作**

参考以上使用方式的介绍，在Backend中，点击实例状态标签页；选择状态为在线的实例，点击热插拔按钮；在弹框中选择命令类型：安装外部Agent。并填写Agent名称、Agent路径等信息。最后点击确认即可下发挂载指令。

<MyImage src="/docs-img/install-external-agent.png"></MyImage>

**结果验证**

在实例状态标签页面，通过外部Agent状态栏可以查看当前已经挂载的外部Agent的信息，包含名称和版本信息。

<MyImage src="/docs-img/external-agent-status.png"></MyImage>

在实例状态标签页面点击查看结果或进入事件管理的监测页面，可以看到安装外部Agent和OTEL Agent启动(OTEL适配，其他Agent暂无)上报的事件。

<MyImage src="/docs-img/external-agent-events.png"></MyImage>

综合以上观测方式，我们可以判断OpenTelemetry Agent已经完成启动。启动完成后，Agent自身是否有异常当前需通过各Agent日志以及是否功能生效来进行分析判断。



## Sermant指令说明

Sermant可以通过运行`AgentLoader`并传入下述指令实现Sermant的热插拔能力，还支持动态挂载外部Agent；同时，Sermant通过任意方式启动成功后，可以通过运行`AgentLoader`并传入指令查询增强信息。具体的指令如下所示：

| 指令类型      | 指令示例                                            |
| ------------- | --------------------------------------------------- |
| Agent挂载     | 指令为空默认为Agent挂载                             |
| Agent卸载     | command=UNINSTALL-AGENT                             |
| 插件安装      | command=INSTALL-PLUGINS:${插件名}                   |
| 插件卸载      | command=UNINSTALL-PLUGINS:${插件名}                 |
| 插件重复安装  | command=INSTALL-PLUGINS:${插件名}#${自定义插件编码} |
| 增强信息查询  | command=CHECK_ENHANCEMENT                           |
| 挂载外部Agent | command=INSTALL-EXTERNAL-AGENT:${外部Agent名}       |

## Sermant核心服务

### 动态配置服务

Sermant动态配置服务允许Sermant从动态配置中心拉取配置从而实现丰富的服务治理能力。Sermant动态配置服务的具体介绍和使用请参考[动态配置中心使用手册](./configuration-center.md)。

### xDS服务

Sermant xDS服务使微服务可以在Kubenetes场景下接入Istio。Sermant基于xDS协议和Istio的控制平面直接进行通信，获取服务发现、路由、负载均衡等配置信息，从而可以替代Envoy作为Istio的数据平面完成服务治理能力。Sermant xDS服务的具体介绍和使用请参考[基于Sermant+Istio的无代理服务网格](./sermant-xds.md)。

### 指标服务

Sermant指标服务允许用户通过Prometheus等监控工具收集和展示Sermant的核心指标和插件的自定义指标。通过这些指标，用户可以实时了解服务的健康状况，并及时发现潜在问题。

#### 支持指标服务的Sermant插件
- [路由插件](../plugin/router.md#路由指标采集)

#### 使用前提
在使用Sermant指标服务之前，请确保以下条件已满足：
- Sermant已正确集成到应用程序中
- Prometheus监控工具已安装并运行

#### 配置Sermant指标服务

##### 开启Metric服务
1. 打开Sermant的配置文件，位于 `agent/config/config.properties`。
2. 设置以下配置项以开启Metric服务：
   ```properties
   # 开启HTTP服务
   agent.service.httpserver.enable=true
   # 开启Metric服务
   agent.service.metric.enable=true
   ```
##### 配置Prometheus
1. 打开Prometheus的配置文件 `prometheus.yml`。
2. 添加以下配置以抓取Sermant暴露的指标端点：
   ```yaml
   scrape_configs:
   - job_name: 'sermant-metrics'
     metrics_path: '/sermant/metrics'
     static_configs:
     - targets: ['<Sermant-Host>:47128']
   ```
   > 请将`<Sermant-Host>`替换为实际运行Sermant的主机地址。

#### 使用Sermant指标服务
##### 创建自定义指标
如果您需要在插件中创建自定义指标，具体参考：[指标功能](../developer-guide/metric-func.md)

#### 查看指标
1. 启动Prometheus服务；
2. 访问Prometheus的Web界面，通常为 `http://<Prometheus-Host>:9090`；
3. 在Prometheus的查询界面输入指标名称，例如 `custom_counter_total`，以查看相应的指标数据。

## 配置规范

Sermant项目properties配置文件和各插件的中yaml配置文件都支持下列几种参数配置方式，以配置文件中的`gateway.nettyIp=127.0.0.1`为例：

1. 直接修改配置文件，即在配置文件中修改`gateway.nettyIp=127.0.0.1`
2. 通过应用启动时的-D参数配置，即`-Dgateway.nettyIp=127.0.0.1`
3. 通过环境变量配置，即在环境变量中新增`gateway.nettyIp=127.0.0.1`
4. 通过Sermant Agent启动参数配置，即`-javaagent:sermant-agent.jar=gateway.nettyIp=127.0.0.1`

以上四种方式，配置生效的优先级从高到低排列为：4 > 3 > 2 > 1。

其中，后三种参数配置值的获取方式支持多种格式，以配置文件中的`gateway.nettyIp=127.0.0.1`为例，下列配置格式都可识别：

```properties
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

Sermant Agent将从上至下依次检索各项配置值是否通过启动参数、环境变量、-D参数来配置。

> **注意：** 通过容器场景的env修改配置，请将点（.）可用下划线（_）替代！！！
> 
> 原因：因为一些OS镜像无法识别带 . 的env

举个例子：如需想通过pod的env修改配置文件中的`gateway.nettyIp=127.0.0.1`则

``` yaml
  env:
  - name: "gateway_nettyIp"
    value: "127.0.0.2"
```
