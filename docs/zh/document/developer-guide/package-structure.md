# 插件结构

一个**Sermant**的插件中可包含以下模块：

- `插件主模块(plugin)`，该模块主要用于声明字节码增强逻辑及插件服务接口定义
- `插件服务模块(service)`，该模块用于为插件包提供插件服务接口实现

开始之前，需要明确约定，为避免类冲突问题，在`插件主模块(plugin)`中，开发者只能使用Java原生API和[sermant-agentcore模块](#sermant-agentcore模块)中的API，不能依赖或使用任何除`byte-buddy`以外的第三方依赖。如果应业务要求，需要使用其他第三方依赖的话，只能在`插件主模块(plugin)`中定义功能接口，并在`插件服务模块(service)`中编写接口实现，在开发中遵循上述约定，才可以更好的利用到**Sermant**提供的类隔离能力。

#### sermant-agentcore模块

> [sermant-agentcore模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)是Sermant Agent的核心模块，其中提供了字节码增强能力、类隔离能力、插件化能力、服务治理的基础服务等核心能力的封装。

## 插件主模块

插件主模块是插件的主要实现，开发者需要在该模块中声明该插件的**增强逻辑**。**增强逻辑**开发可参考[字节码增强](bytecode-enhancement.md)章节。为避免类冲突问题，插件主模块中不可引入第三方依赖。

## 插件服务模块

**插件服务模块**较**插件主模块**相比：

- 用于编写[插件服务](#插件服务)，无法在其中声明插件所需的**增强逻辑**。
- 允许自由添加需要的第三方依赖，打包构建的时候需要构建带依赖jar包。
- 需以`provided`形式在其pom中引入其对应的[插件主模块](#插件主模块)。

## 插件服务

**插件服务**主要分为两部分：

**服务接口定义**在[插件主模块](#插件主模块)中用于描述该服务提供的能力，在定义插件的插件服务时，需要继承插件服务基础接口[com.huaweicloud.sermant.core.PluginService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginService.java)，该接口提供`start()`方法会在**Sermant**启动时被调用，`stop()`方法会在JVM停止时被调用。

**服务接口实现**在[插件服务模块](#插件服务模块)中，在[插件主模块](#插件主模块)中可以通过**SPI**机制加载并使用插件服务的接口实现。

### 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程。

> 注：该开发示例下描述的插件服务接口及其实现已在模板工程中存在，可直接使用，无需重复创建，本示例详细描述其创建过程可以使开发者更易于理解开发过程。

在开发插件服务时，首先需要在[插件主模块](#插件主模块)中定义插件服务的接口，这是使用插件服务时的索引，在工程中`template\template-plugin`下创建`com.huaweicloud.sermant.template.EchoService`接口，并在其中定义`echo`接口方法：

```java
public interface EchoService extends PluginService {
    void echo(String string);
}
```

接口定义完成后，需要在[插件服务模块](#插件服务模块)提供上述接口的实现，来执行实际的逻辑，在工程中`template\template-service`中创建`com.huaweicloud.sermant.template.EchoServiceImpl`类，其需要实现`com.huaweicloud.sermant.template.EchoService`接口，并实现接口中定义的`echo`接口方法：

```java
public class EchoServiceImpl implements EchoService {
    @Override
    public void echo(String string) {
        // 回应别人的问候
        string = string.replaceAll("[\\pP+~$`^=|<>～｀＄＾＋＝｜＜＞￥×]", "");
        System.out.println("ECHO: " + string + " to you!");
    }
}
```

开发插件服务的最后，不要忘记添加插件服务的**SPI**配置，在工程中`template\template-service`下的资源目录`resources`中添加`META-INF/services`目录，并在其中创建名为`com.huaweicloud.sermant.core.plugin.service.PluginService`的**SPI**文件，并向其中添加插件服务实现类的类名：

```java
com.huaweicloud.sermant.template.EchoServiceImpl
```

接下来，找到工程中`template\template-plugin`下的`com.huaweicloud.sermant.template.TemplateDeclarer`类，在针对`main`方法的[拦截器](bytecode-enhancement.md#拦截器)的`before`方法中使用已经开发完成的插件服务，通过[com.huaweicloud.sermant.core.plugin.service.PluginServiceManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginServiceManager.java)插件服务管理器获取插件服务并使用：

> 注：`com.huaweicloud.sermant.core.plugin.service.PluginServiceManager::getPluginService(Class clazz)`可通过插件服务接口基于Java SPI机制获取插件服务实现的实例。

```java
public ExecuteContext before(ExecuteContext context) throws Exception {
    System.out.println("Good morning!");
    PluginServiceManager.getPluginService(EchoService.class).echo("Good morning!");
    return context;
}
```

开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**，执行完成后在根目录执行 `cd agent/`，并在其中携带**Sermant**运行测试应用，执行如下命令 **java -javaagent:sermant-agent.jar -jar Application.jar**

```java
$ java -javaagent:sermant-agent.jar -jar Application.jar
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
Good morning!
ECHO: Good morning to you!
```

可以看到，招呼得到了回应，我们创建的插件服务已经生效了，如需要开发新的插件服务，按照上述开发示例执行即可。
