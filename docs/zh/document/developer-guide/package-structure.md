# 插件结构

一个**Sermant**插件主要由以下模块组成：

- `插件主模块(plugin)`，该模块主要用于声明字节码增强逻辑
- `插件服务模块(service)`，该模块用于辅助插件主模块完成增强逻辑，比如添加动态配置监听器等（非必要模块）

通过在pom文件的`properties`中指定`package.plugin.type`的值确定模块类型，`plugin`表示该模块为插件主模块，`service`表示该模块为插件服务模块。插件中可包含多个插件主模块和插件服务模块。

基于Sermant良好的类加载器设计，在`插件主模块(plugin)`中，可以通过compile方式引入第三方依赖，而不会引发与宿主应用的类冲突问题，但是开发者如果需要在插件中使用宿主类，则不建议在plugin模块通过compile方式引入该类所在的依赖，如果需要，可在service模块引入，并在plugin模块中调用service模块的实现，下文将介绍使用方式。

## 插件主模块

插件主模块是插件的主要实现，开发者需要在该模块中声明该插件的**增强逻辑**。**增强逻辑**开发可参考[字节码增强](bytecode-enhancement.md)章节。

## 插件服务模块

**插件服务模块**较**插件主模块**相比：

- 用于编写[插件主模块](#插件主模块)无法实现的**增强逻辑**。
- 允许通过compile方式自由添加所需的第三方依赖。

> 注意：若需引入插件主模块，需以`provided`形式在其pom中引入。

## 插件服务

**插件服务**主要分为两部分：

**服务接口定义**在[插件主模块](#插件主模块)中用于描述该服务提供的能力，在定义插件的插件服务时，需要继承插件服务基础接口[io.sermant.core.plugin.service.PluginService](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/service/PluginService.java)，该接口提供的`start()`方法会在**Sermant**启动时被调用，`stop()`方法会在JVM停止时被调用。

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

开发插件服务的最后，不要忘记添加插件服务的**SPI**配置，在工程中`template\template-service`下的资源目录`resources`中添加`META-INF/services`目录，并在其中创建名为`io.sermant.core.plugin.service.PluginService`的**SPI**文件，并向其中添加插件服务实现类的类名：

```java
com.huaweicloud.sermant.template.EchoServiceImpl
```

接下来，找到工程中`template\template-plugin`下的`com.huaweicloud.sermant.template.TemplateDeclarer`类，在针对`main`方法的[拦截器](bytecode-enhancement.md#拦截器)的`before`方法中使用已经开发完成的插件服务，通过[io.sermant.core.plugin.service.PluginServiceManager](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/service/PluginServiceManager.java)插件服务管理器获取插件服务并使用：

> 注：`io.sermant.core.plugin.service.PluginServiceManager::getPluginService(Class clazz)`可通过插件服务接口基于Java SPI机制获取插件服务实现的实例。

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
