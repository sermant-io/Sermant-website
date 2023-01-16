# 插件结构

一个**Sermant**的插件中可包含以下模块：

- `插件主模块(plugin)`，该模块主要用于声明字节码增强逻辑及插件服务接口定义
- `插件服务模块(service)`，该模块用于为插件包提供插件服务接口实现

开始之前，需要明确约定，为避免类冲突问题，在`插件主模块(plugin)`中，开发者只能使用Java原生API和[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)中的API，不能依赖或使用任何除`byte-buddy`以外的第三方依赖。如果应业务要求，需要使用其他第三方依赖的话，只能在`插件主模块(plugin)`中定义功能接口，并在`插件服务模块(service)`中编写接口实现。

## 插件主模块

插件主模块是插件的主要实现，开发者需要在该模块中声明该插件的**增强逻辑**。**增强逻辑**开发可参考[字节码增强](bytecode-enhancement.md)章节。为避免类冲突问题，插件主模块中不可引入第三方依赖。

## 插件服务模块

**插件服务模块**较**插件主模块**相比：

- 用于编写[插件配置](plugin-configuration.md)和[插件服务](#插件服务)，无法在其中声明插件所需的**增强逻辑**。
- 允许自由添加需要的第三方依赖，打包的时候，需要提供输出依赖的方式，可以用`shade`插件或`assembly`插件打带依赖jar包，也可以直接使用`dependency`插件输出依赖包。
- 需以`provided`形式在其pom中引入其对应的插件主模块。


### 插件服务

**插件服务**主要分为两部分：

**服务接口定义**在`插件主模块`中用于描述该服务提供的能力，在定义插件的插件服务时，需要继承[PluginService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginService.java)插件服务基础接口，该接口提供`start()`方法会在**Sermant**启动时被调用，`stop()`方法会在JVM停止时被调用。

**服务接口实现**在`插件服务模块`中，在`插件主模块`中可以通过*SPI*机制加载并使用服务的接口实现

最后，不要忘记添加插件服务的*SPI*配置文件：

- 在资源目录`resources`下添加`META-INF/services`文件夹。
- 在`META-INF/services`中添加`com.huaweicloud.sermant.core.plugin.service.PluginService`配置文件。
- 在上述文件中，以换行为分隔，键入插件包中所有的插件配置`PluginService`实现。

在`插件主模块`中通过[PluginServiceManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginServiceManager.java)插件服务管理器提供的获取`PluginService`的接口来获取该插件服务的实例：
  ```java
  // ${plugin service class}为插件服务的Class
  PluginServiceManager.getPluginService(${plugin service class});
  ```
  `PluginServiceManager`其实只是[ServiceManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/ServiceManager.java)的一个特例，也可以直接使用后者的接口获取核心服务和插件服务：

  ```java
  // ${base service class}为核心服务或插件服务的Class
  ServiceManager.getService(${base service class});
  ```
## 类隔离

**Sermant**提供了完善的类隔离机制，插件包结构按照上述方式定义，方便开发者通过**Sermant**的类隔离机制来管理第三方依赖，避免因通过Java Agent来向宿主进程中引入第三方依赖而导致的类冲突问题。
