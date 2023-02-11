# 日志功能

本文介绍如何在开发中使用Sermant提供的日志系统。

## 功能介绍

日志是在程序开发中不可或缺的能力，通过日志可以快速找出程序运行时的状态及遇到的问题，**Sermant**日志系统基于**JUL**&**logback**构建，为插件开发提供了完整的、配置灵活的避免类冲突的日志工具。

> 注：基于Sermant的类隔离策略，日志系统通过JUL接口来构造日志并通过logback引擎输出日志的方式，这得益于[jul-to-slf4j](https://github.com/qos-ch/slf4j/tree/master/jul-to-slf4j)的桥接能力，基于该操作，用户无需担心日志配置及输出和被增强应用冲突的情况。

## 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程。

找到工程中`template\template-plugin`下的`com.huaweicloud.sermant.template.TemplateDeclarer`类，在其中定义一个私有静态常量`LOGGER`，用于该类下的日志构造：

```java
private static final java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
```

接着我们在针对`main`方法的[拦截器](bytecode-enhancement.md#拦截器)的`before`及`after`方法中通过`java.util.logging.Logger::info`接口补充`INFO`级别的执行日志，这可以让我们在日志中看到拦截器的执行过程：

```java
@Override
public ExecuteContext before(ExecuteContext context) throws Exception {
    LOGGER.info("Say good morning before good afternoon!");
    System.out.println("Good morning!");
    return context;
}

@Override
public ExecuteContext after(ExecuteContext context) throws Exception {
    LOGGER.info("Say good night after good afternoon!");
    System.out.println("Good night!");
    return context;
}
```

开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**，执行完成后在根目录执行 `cd agent/`，并在其中携带**Sermant**运行测试应用，执行如下命令 **java -javaagent:sermant-agent.jar -jar Application.jar**


```shell
$ java -javaagent:sermant-agent.jar -jar Application.jar
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
Good morning!
Good afternoon!
Good night!
```

在插件中定义的执行逻辑已被增强到测试应用中。接下来，查看程序运行时产生的日志：

1. 执行如下命令 `cd logs/sermant/core/app/${yyyy-mm-dd}/`进入运行日志存放目录，其中 `${yyyy-mm-dd}`指代运行时基于日期生成的目录名。

2. 打开日志文件`sermant-0.log`检查日志内容，在其中可以看到我们构造的日志已经生效了，可以在其中看到日志的触发时间、日志级别、类、方法、代码行、线程等信息，便于了解程序的运行状态。

```shell
2023-02-11 15:25:08.047 [INFO] [com.huaweicloud.sermant.template.TemplateDeclarer$1] [before:33] [main] Say good morning before good afternoon!
2023-02-11 15:25:08.050 [INFO] [com.huaweicloud.sermant.template.TemplateDeclarer$1] [after:40] [main] Say good night after good afternoon!
```

## API&配置
### API

#### 获取日志工具

- 获取日志工具对象，用于在开发中构造日志，该日志实例为`java.util.logging.Logger`实例，在**Sermant**框架中，已将其初始化并桥接到logback日志引擎。

```java
java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
```

#### 记录日志

开发者可通过如下日志接口记录各级别（`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`）日志来达到对程序运行不同程度的监控。

- 记录**TRACE**级别日志，用于追踪详细的程序运行流。默认关闭该级别，如需开启需配置。

```java
java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
LOGGER.finest("TRACE MESSAGE");
```

- 记录**DEBUG**级别日志，用于在程序关键位置记录详细信息，可能包含方法参数或返回值，用于在调试过程，了解更多程序运行信息。默认关闭该级别，如需开启需配置。

```java
java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
LOGGER.fine("DEBUG MESSAGE");
```

- 记录**INFO**级别日志，用于记录程序运行的一些关键信息，常常用来表示程序运行进入了哪一位置或执行到哪一状态，往往不记录类似于**DEBUG**级别日志中所记录的详细信息。

```java
java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
LOGGER.info("INFO MESSAGE");
```

- 记录**WARN**级别日志，用于记录一些警告信息。该日志记录程序运行过程中进入了一些特殊状态，虽不会影响程序运行，但值得注意。

```java
java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
LOGGER.warning("WARN MESSAGE");
```

- 记录**ERROR**级别日志，用于记录程序运行中产生的错误，用于提供信息便于开发及维护人员了解错误产生的原因。

```java
java.util.logging.Logger LOGGER = LoggerFactory.getLogger();
LOGGER.severe("ERROR MESSAGE");
```

### 配置

**Sermant**提供的日志系统是基于logback日志引擎，并且沿用了logback的日志配置方式，基于创建首个插件中的[工程结构](README.md#工程结构)，通过修改`config/logback.xml`来自定义日志逻辑。

#### 日志输出配置

| 配置项         | 描述                                                         | 配置示例                                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| log.home_dir   | 用于指定日志最终输出路径。                                   | `${sermant_log_dir:-./logs/sermant/core}`                    |
| log.app_name   | 用于指定日志文件的文件名前缀。                               | `{sermant_app_name:-sermant}`                                |
| log.maxHistory | 用于指定日志文件的最长存放时间（单位：天）。                 | `${sermant_log_max_history:-30}`                             |
| log.level      | 用于指定日志输出的最小级别，可配置`trace`、`debug`、`info`、`warn`、`error`。 | `${sermant_log_level:-trace}`                                |
| log.maxSize    | 用于指定单个日志文件的最大容量。                             | `${sermant_log_max_size:-5MB}`                               |
| log.totalSize  | 用于指定日志文件的最大总容量。                               | `${sermant_log_total_size:-20GB}`                            |
| log.pattern    | 用于指定输出日志的格式。                                     | `%d{yyyy-MM-dd HH:mm:ss.SSS} [%le] [%C] [%M:%L] [%thread] %m%n` |

> 注：所有配置项的值支持从环境变量读取配置，只需将其配置为`${环境变量名:-默认值}`。输出日志的格式，其配置参考[日志格式配置](#日志格式配置)

#### 日志格式配置

日志的默认配置为`%d{yyyy-MM-dd HH:mm:ss.SSS} [%le] [%C] [%M:%L] [%thread] %m%n`，其中可配置标识含义如下：

| 配置标识 | 描述                                         |
| -------- | -------------------------------------------- |
| %d       | 用于指定日志输出时的日期格式。               |
| %C       | 用于指定日志输出该日志发生的类的完整类名。   |
| %F       | 用于指定日志输出该日志发生的类的文件名。     |
| %M       | 用于指定日志输出该日志发生的方法的方法名。   |
| %L       | 用于指定日志输出该日志发生位置在类中的行号。 |
| %thread  | 用于指定日志输出该日志发生的线程。           |
| %m       | 用于指定日志输出该日志构造时指定的信息。     |
| %n       | 换行符。                                     |
