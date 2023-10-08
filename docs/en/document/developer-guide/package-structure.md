# Plugin Structure

A **Sermant** plugin can contain the following modules：

- `plugin main mpdule (plugin)`, this module is mainly used to declare bytecode enhancement logic and plug-in service interface definition.
- `plugin service module (service)`, this module is used to provide the plug-in service interface implementation for the plugin package.

Before we start, we need to make a clear convention to avoid class conflicts, in the `plugin main module (plugin)`, developers can only use the native Java apis and the apis in the [Sermant-Agentcore Module](#Sermant-Agentcore-Module). they cannot rely on or use any third-party dependencies other than `byte-buddy`. If you need to use other third-party dependencies according to business requirements, you can only define the functional interface in the `plugin main module (plugin)`, and write the interface implementation in the `plugin service module (service)`, and follow the above conventions in development, in order to make better use of the class isolation capabilities provided by **Sermant**.

#### Sermant-Agentcore Module

> [Sermant - Agent core Module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core) is the core module of Sermant Agent, which provides encapsulation of core capabilities such as bytecode enhancement capability, class isolation capability, plug-in capability, and basic services of service governance.

## Plugin Main Module

The plugin master module is the main implementation of the plugin, and the developer needs to declare the plugin's **enhanced logic** in this module. For **enhancement logic**  development, refer to the [Bytecode Enhancement](bytecode-enhancement.md) section. To avoid class conflicts, do not introduce third-party dependencies into the main module of the plugin.

## Plugin Service Module

**Plugin Service Module** Compared to **Plugin Main Module**：

- Used to write [plugin service](#Plugin-Service) where it is not possible to declare the **enhanced logic** required by the plugin.
- You are free to add any third-party dependencies you need, and you need to build dependent jar packages when you package your build.
- Its corresponding [plugin main module](#Plugin-Main-Module) needs to be introduced in its pom in the form of `provided`.

## Plugin Service

**Plugin Services** are mainly divided into two parts:

**Service Interface Definition** is used in the [plugin main module](#Plugin-Main-Module) to describe the capabilities provided by the service. When defining the plug-in service of a plugin, you need to inherit the plugin service base interface [com.huaweicloud.sermant.core.PluginService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginService.java),. This interface provides the `start()` method to be called when **Sermant** is started, and the `stop()` method to be called when the JVM is stopped.

**Service interface implementation** In the [plugin service module](#Plugin-Service-Module), in the [plugin main module](#Plugin-Main-Module) can be loaded through the **SPI** mechanism and use the interface implementation of the plugin service.

### Development Examples

This development example is based on a project created in the [Create your First Plugin](README.md) documentation.

> Note：The plugin service interface and its implementation described in this example already exist in the template project and can be used directly without repeated creation. This example describes the creation process in detail to help developers understand the development process more easily.

When developing a plugin service, we first need to define the interface of the plugin service in [plugin main module](#Plugin-Main-Module), which is the index when using the plugin service. In engineering ` template\template-plugin ` created under ` com.huaweicloud.sermant.template.EchoService ` interface, and in which define ` echo ` interface methods:

```java
public interface EchoService extends PluginService {
    void echo(String string);
}
```

Once the interface is defined, an implementation of the above interface needs to be provided in the [Plugin Service Module](#Plugin-Service-Module) to execute the actual logic. Create `com.huaweicloud.sermant.template.EchoServiceImpl` class in `template\template-service`, which need implement `com.huaweicloud.sermant.template.EchoService` interface, and implement `echo` method in the interface defined：

```java
public class EchoServiceImpl implements EchoService {
    @Override
    public void echo(String string) {
        // Respond to a greeting
        string = string.replaceAll("[\\pP+~$`^=|<>～｀＄＾＋＝｜＜＞￥×]", "");
        System.out.println("ECHO: " + string + " to you!");
    }
}
```

Finally, when developing a plug-in service, don't forget to add the plugin service's **SPI** configuration, add the `META-INF/services` directory to the `resources` directory under` template\template-service` in the project, then create **SPI** file named `com.huaweicloud.sermant.core.plugin.service.PluginService` in it，and add the class name of the plugin service implementation class to it.

```java
com.huaweicloud.sermant.template.EchoServiceImpl
```

Next, find the `com.huaweicloud.sermant.template.TemplateDeclarer` class under project `template\template-plugin`, use the already developed plugin service in the `before` method of the [interceptor](bytecode-enhancement.md#Interceptor) of the `main` method, get the plugin service through the [com.huaweicloud.sermant.core.plugin.service.PluginServiceManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginServiceManager.java) plugin service manager and use:

> Note：`com.huaweicloud.sermant.core.plugin.service.PluginServiceManager::getPluginService(Class clazz)` can obtain the instance of plugin service implementation based on Java **SPI** mechanism through plugin service interface.

```java
public ExecuteContext before(ExecuteContext context) throws Exception {
    System.out.println("Good morning!");
    PluginServiceManager.getPluginService(EchoService.class).echo("Good morning!");
    return context;
}
```

After the development is completed, you can refer to the process of [packaging and building](README.md#Packaged-Build) when creating the first plugin, execute **mvn package** in the root directory of the project, and execute `cd agent/` in the root directory after completion, and carry Sermant to test application, and execute **java -javaagent:sermant-agent.jar -jar Application.jar**.

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

As you can see, the call was answered and the plugin service we created is already in effect. If you need to develop a new plugin service, follow the development example above.
