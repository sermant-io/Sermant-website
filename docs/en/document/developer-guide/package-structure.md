# Plugin Structure

A **Sermant** plugin primarily consists of the following modules:

- **Plugin Main Module (`plugin`)**: This module is mainly responsible for declaring the bytecode enhancement logic.
- **Plugin Service Module (`service`)**: This module assists the Plugin Main Module in completing the enhancement logic, such as adding dynamic configuration listeners (this module is optional).

The type of module is determined by specifying the value of `package.plugin.type` in the `properties` section of the `pom` file. The value `plugin` indicates that the module is a Plugin Main Module, while `service` indicates that the module is a Plugin Service Module. A plugin can contain multiple Plugin Main Modules and Plugin Service Modules.

Thanks to Sermant's well-designed class loader mechanism, third-party dependencies can be introduced into the Plugin Main Module (`plugin`) via the `compile` method without causing conflicts with the classes in the host application. However, if developers need to use classes from the host application within the plugin, it is not recommended to introduce the corresponding dependencies via `compile` in the plugin module. Instead, these dependencies should be introduced in the service module and the service module's implementation can then be invoked from the plugin module. The usage details are described below.

## Plugin Main Module

The main module of a plugin contains its primary implementation. Developers need to declare the plugin's **enhancement logic** within this module. For developing **enhancement logic**, refer to the [Bytecode Enhancement](bytecode-enhancement.md) section.

## Plugin Service Module

**Plugin Service Module** Compared to **Plugin Main Module**

- Used to write **enhanced logic** that the [Plugin Main Module](#插件主模块) cannot implement.
- Allows adding required third-party dependencies freely through the compile method.

> Note: If you need to introduce the Plugin Main Module, you must include it in its `pom` file as `provided`.

## Plugin Service

**Plugin Services** are mainly divided into two parts:

**Service Interface Definition** is used in the [plugin main module](#Plugin-Main-Module) to describe the capabilities provided by the service. When defining the plug-in service of a plugin, you need to inherit the plugin service base interface [io.sermant.core.plugin.service.PluginService](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/service/PluginService.java),. This interface provides the `start()` method to be called when **Sermant** is started, and the `stop()` method to be called when the JVM is stopped.

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

Finally, when developing a plug-in service, don't forget to add the plugin service's **SPI** configuration, add the `META-INF/services` directory to the `resources` directory under` template\template-service` in the project, then create **SPI** file named `io.sermant.core.plugin.service.PluginService` in it，and add the class name of the plugin service implementation class to it.

```java
com.huaweicloud.sermant.template.EchoServiceImpl
```

Next, find the `com.huaweicloud.sermant.template.TemplateDeclarer` class under project `template\template-plugin`, use the already developed plugin service in the `before` method of the [interceptor](bytecode-enhancement.md#Interceptor) of the `main` method, get the plugin service through the [io.sermant.core.plugin.service.PluginServiceManager](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/service/PluginServiceManager.java) plugin service manager and use:

> Note：`io.sermant.core.plugin.service.PluginServiceManager::getPluginService(Class clazz)` can obtain the instance of plugin service implementation based on Java **SPI** mechanism through plugin service interface.

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
