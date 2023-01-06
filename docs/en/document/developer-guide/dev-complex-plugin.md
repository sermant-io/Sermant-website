# Plugin Development Introduction

This document describes how to use the API provided by **Sermant** to realize the bytecode enhancement requirements and simplify the development of the plugin by using the functions of logging, heartbeat, configuration, etc.

## Plugin Structure

A **Sermant** plugin module contains the following things

- `Plugin Main Module(plugin)`, This module is mainly used to declare bytecode enhancement and plugin service interface definitions
- `Plugin Service Module(service)`, This module is used to provide the plugin service interface implementation for the `Plugin Main Module(plugin)`

Before we start, it's important to agree that in `plugin` modules, developers can only use the *Java* native API and the [**Sermant** core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core) and cannot rely on or use any third-party dependencies other than `byte-buddy`. If the business needs to use other third-party dependencies, you can only define the interface in the `plugin` module and write the implementation in the `service` module. Refer to the [Plugin Module](../UserGuide/plugin.md#Add-Plugin-Module) for more information.

### Plugin Main Module

Write **enhanced definition**, **interceptor**, and **plugin service interface** in this module. No third party dependencies can be introduced in this module.

### Plugin Service Module

Comparing to **Plugin Main Module**:

- can only write a **plugin configuration** and **plugin service interface** implementation, and cannot write **enhancement definition ** **interceptor** and **plugins service interface**.
- allow the freedom to add third-party dependencies as needed. When packaging, you need to provide a way to export dependencies, you can use the `shade` plugin or `assembly` plugin to export the dependency *jar* package, or you can directly use the `dependency` plugin to export the dependency package.
- the corresponding **Plugin Main Module** is provided in its pom.

## Enhanced logic

The core capability of **Sermant** is to do non-invasive bytecode enhancements to the host application, which are plug-in enabled. In each **Sermant** plugin's **Plugin Main Module(plugin)**, it is possible to declare some enhancement logic that makes bytecode enhancements to some particular method of the host application, so it is an important subject to describe what class and how that class is enhanced.

The declaration plugin enhancement logic needs to implement [PluginDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/PluginDeclarer.java) interface, there are three interface methods：

- `getClassMatcher` used to get the matcher[ClassMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassMatcher.java) of the enhanced class。
- `getInterceptDeclarers` used to get the matcher[MethodMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/MethodMatcher.java) of method in the enhanced class, and the interceptor declared for the interception point, they are encapsulated in [InterceptDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/InterceptDeclarer.java)。
- `getSuperTpeDecarers` gets the plugin's superclass declaration[SuperTypeDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/SuperTypeDeclarer.java)

### Class Matcher

The matcher [ClassMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassMatcher.java), which provides two types of matchers in the core module:

[ClassTypeMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassTypeMatcher.java)(the matcher for class name)

- The most common way to do this is purely by name matching, which is obtained by:
  ```java
  ClassMatcher.nameEquals("${class reference}");
  ```
  Where `${class reference}` is the full qualified class name of the enhanced class.


- Matching multiple classes by name, which is the plural version of `nameEquals`, can be obtained with the following method:
  ```java
  ClassMatcher.nameContains("${class reference array}");
  ```
  Where `${class reference array}` is a full qualified class name mutable array of the enhanced class.

[ClassFuzzyMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassFuzzyMatcher.java)（the fuzzy matcher of class name）

- The enhanced class is located by the prefix of full qualified class name, which can be obtained by:
  ```java
  ClassMatcher.namePrefixedWith("${prefix}");
  ```
  Where `${prefix}` is the prefix of full qualified class name.


- The enhanced class is located by the suffix of full qualified class name, which can be retrieved as follows:
  ```java
  ClassMatcher.nameSuffixedWith("${suffix}")
  ```
  Where `${suffix}` is the suffix of full qualified class name.


- The enhanced class is located by the infix of full qualified class name, which can be obtained as follows:
  ```java
  ClassMatcher.nameinfixedWith("${infix}")
  ```
  Where `${infix}` is the infix of full qualified class name.


- The enhanced class is located by matching the full qualified class name with a regular expression, which can be obtained as follows:
  ```java
  ClassMatcher.nameMatches("${pattern}")
  ```
  Where `${pattern}` is a regular expression.


- The enhanced class is located by annotation decorated, which can be obtained as follows:

  ```java
  ClassMatcher.isAnnotationWith("${annotation reference array}");
  ```
  Where `${annotation reference array}` is a full qualified class name array of annotations.


- Locating a subclass by means of a superclass can be obtained using the following methods:
  ```java
  ClassMatcher.isExtendedFrom("${super class array}");
  ```
  Where `${super class array}` is a superclass mutable array. Due to Java inheritance rules, the array can only have one `class`, the rest must be `interface`.


- A matching logical operation, which is true when all matchers do not match:
  ```java
  ClassMatcher.not("${class matcher array}")
  ```
  Where `${class matcher array}` is a variable-length array of matcher.


- A matching logical operation, which is true if the matcher matches all of them:
  ```java
  ClassMatcher.and("${class matcher array}")
  ```
  Where `${class matcher array}` is a variable-length array of matcher.


- A matching logical operation, which is true if one of the matcher matches:
  ```java
  ClassMatcher.or("${class matcher array}")
  ```
  Where `${class matcher array}` is a variable-length array of matcher.

### Method Matcher

For method interception points [MethodMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/MethodMatcher.java), we provide a variety of matching methods:

- Match any method:
  ```java
  MethodMatcher.any();
  ```
- Match by method name:
  ```java
  MethodMatcher.nameEquals("${method name}");
  ```
  Where `${method name}` is the method name.
  
- Match static method:
  ```java
  MethodMatcher.isStaticMethod();
  ```
- Match constructor:
  ```java
  MethodMatcher.isConstructor();
  ```
- Match multiple methods:
  ```java
  MethodMatcher.nameContains("${method name array}");
  ```
  Where `${method name array}` is an array of method names.


- Match by prefix of method name:
  ```java
  MethodMatcher.namePrefixedWith("${method name prefix}");
  ```
  Where `${method name prefix}` is the prefix of method name .


- Match by suffix of method name:
  ```java
  MethodMatcher.nameSuffixedWith("${method name suffix}");
  ```
  Where `${method name suffix}` is the suffix of method name.


- Match by infix of method name：
  ```java
  MethodMatcher.nameinfixedWith("${method name infix}");
  ```
  Where `${method name infix}` is the infix of method name.


- Match by regular expression:
  ```java
  MethodMatcher.nameMatches("${pattern}");
  ```
  Where `${pattern}` is a regular expression.


- Matches by annotation:
  ```java
  MethodMatcher.isAnnotatedWith("${annotations array}");
  ```
  Where `${annotations array}` is the annotation set.


- Match by specified number of arguments:
  ```java
  MethodMatcher.paramCountEquals("${param count}");
  ```
  Where `${param count}` is the number of input parameters.


- Match by the specific type of argument:
  ```java
  MethodMatcher.paramTypeEquals("${param type array}");
  ```
  Where `${param type array}` is the set of input types.


- Match by return type
  ```java
  MethodMatcher.resultTypeEquals("${result type}");
  ```
  Where `${result type}` is the return type.


- Logical operation, where the result is true if the method matcher set does not match at all.
  ```java
  MethodMatcher.not("${element matcher array}");
  ```
  Where `${element matcher array}` is the set of method matcher.


- Logical operation, where the result is true if the method matcher set fully matches.
  ```java
  MethodMatcher.and("${element matcher array}");
  ```
  Where `${element matcher array}` is the set of method matcher.


- Logical operation, where the result is true if method matcher set matches one of the result.
  ```java
  MethodMatcher.or("${element matcher array}");
  ```
  Where `${element matcher array}` is the set of method matcher.

For more methods matching method, refer to [byte-buddy](https://javadoc.io/doc/net.bytebuddy/byte-buddy/latest/net/bytebuddy/matcher/ElementMatchers.html) methods with a generic type of `MethodDescription` .

Don't forget to add the *SPI* configuration file for the `PluginDeclarer` interface:

- Add `META-INF/services` folder under `resources`.
- Add `com.huaweicloud.sermant.core.plugin.agent.declarer.PluginDeclarer` under `META-INF/services` .
- In the above file, type all the enhancements definitions of `PluginDeclarer` in the plugin package separated with LF.

#### 原生类增强

There is no difference between native classes and regular classes in terms of enhancement definition and writing interceptors. However, it is desirable for plugin developers to minimize enhancement to native classes for three reasons:

- Enhancements to native classes tend to be divergent. And enhancements to them are likely to impact other plugins or host functionality.
- The native class enhancement logic will use reflection to invoke interceptor methods in the system classloader. Due to the *Java* redefinition of the *Class*, every time an enhanced method is called, the reflection logic is processed, which significantly limits the performance of the method.
- The enhancements to the native classes involved using the **Advice template class** to generate a dynamic interceptor class. For each enhanced native class method, one will be generated dynamically and they will be loaded by the system classloader. If native classes are enhanced without restriction, loading dynamic classes can also become a significant burden during startup.

In summary, [**Sermant** core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core) provides the ability to augment *Java* native classes. However, it is not recommended to enhance them without restrictions. If there are multiple enhancement points to choose from, you'd better choose enhancing regular classes.


### Interceptor
Interceptors are used to define enhancement logic before and after bytecode enhancement of methods of the enhanced class, and when handling exceptions:
- [interceptor](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/interceptor/Interceptor.java): the interceptor interface, which contains three methods:
  - `before`, the preceding method, which is executed before the interception point. The ExecuteContext parameter is the context of the plugin execution, which encapsulates all the parameters required for the interceptor to operate. Through the skip method, the main process can be skipped and the final method result can be set. Note that the main process cannot be skipped when the constructor is enhanced .
  - `after`, the post-method, ends up in the post-method whether or not the intercepted method executes normally. Postmethods can override the return value of the intercepted method with their return value, so developers need to be careful not to return null easily here.
  - `onThrow`, an exception handling method that is triggered when the intercepted method executes an exception. Handling the exception here does not affect the normal throwing of the exception.

## Plugin Configuration

Defining the plugin configuration starts with defining a plugin configuration class for the plugin, which needs to inherite[PluginConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/config/PluginConfig.java)，uses [ConfigTypeKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigTypeKey.java) to decorate, specifies the prefix of the configuration that the configuration class can read, use [ConfigFieldKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigFieldKey.java)to decorate the fields of this class(if not decorated, read a configuration whose read configuration name is the same as that of the variable), specifying the configuration name of the configuration corresponding to that variable.

Create a config.yaml file in the plugin's `config` directory:
```yaml
demo.config:
  demo-config-A: false
  demoConfigB: 127.0.0.1
```
Corresponding configuration classes:
```java
@ConfigTypeKey(value = "demo.config")
public class DemoConfig implements PluginConfig {
    @ConfigFieldKey("demo-config-A")
    private boolean demoConfigA;

    private String demoConfigB;
}
```

Finally, don't forget to add the *SPI* configuration file for the plugin configuration:

- Add `META-INF/services` folder under `resources`.
- Add `com.huaweicloud.sermant.core.plugin.config.PluginConfig` configuration file under `META-INF/services`.
- In the above file, type the `PluginConfig` implementation for all plugin configurations in the plugin package and separate them by LF.

How to use configuration in plugin. The [PluginConfigManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/config/PluginConfigManager.java) provides the interface to obtain the plugin configuration `PluginConfig`. In the plugin, you can obtain an instance of the plugin configuration through this manager and use it. The method of obtaining the instance is as follows:
  
  ```java
  // ${plugin config class} is the plugin configuration class
  PluginConfigManager.getPluginConfig(${plugin config class});
  ```
  `PluginConfigManager` is the unified configuration manager [ConfigManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/ConfigManager.java), The plugin side can directly use the interface of the latter to obtain plugin configuration and unified configuration：
  
  ```java
  // ${base config class}is the plugin configuration class or unified configuration class
  ConfigManager.getConfig(${base config class});
  ```
Configuration now supports data types include:

- Primitive and wrapper types for Boolean and numeric classes
- String
- Enum
- Complex object
- Array of the above types
- List of the first four types
- Map of the first four types

*YAML* format configuration files currently have a few other rules:

- For complex objects involved in arrays, lists, and maps, using `ConfigFieldKey` to fix property names is not supported.
- For strings in arrays, lists, and maps, there is no support for `${}` conversions, **plugin configuration class** string properties and string properties inside complex type properties are supported.
- Parameters are only used for string `${}` conversions. Direct setting property values using parameters is not supported.
- The field names of configuration classes are usually small camels.You can use [ConfigFieldKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigTypeKey.java) to define aliases for the transverse-line style. After the annotation is added, it can be parsed in *YAML* using either transverse-line or small camel style.
- The priority of the configuration is: startup parameters > environment variables > system variables (-d parameter) > *YAML* file configuration
- When the attributes of the configuration class obtain reference values (startup parameter, environment variable, and system variable (-D parameter)) according to the priority of the effective value, the small hump and the hyphen can be split into words for searching and matching.
- If the key of the basic data type/array /map/list/set(which does not support complex objects) is not defined in the *YAML* configuration, the reference value will be obtained according to the priority of the configuration effect: startup parameters > environment variables > system variables (-d parameter). When retrieving reference values from the above data sources, note that:
  - The array /list/set should be configured in `YAML` string format. For example: DEMO_TEST_LIST_NAME=[elem1,elem2]
  - The map needs to be configured as a `YAML` string format. For example: DEMO_TEST_MAP_NAME={key1: value1, key2: value2}
## Plugin Service

**Plugin Services** are mainly divided into two parts:

**Service interface definition** is used to describe the capabilities provided by the service in `Plugin Main Module`, 
when define the service interface, need to inherit[PluginService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginService.java)plugin service base interface, it provide `start()` will be called when **Sermant** start，`stop()` will be called when JVM stop.


**Service interface implementation** is in `Plugin Service Module`，in `Plugin Main Module` you can get and use the implementations by *SPI*.

Finally, don't forget to add the *SPI* configuration file for the plugin service:

- Add `META-INF/services` folder under `resources`.
- Add `com.huaweicloud.sermant.core.plugin.service.PluginService` configuration file under `META-INF/services`.
- In the above file, type the `PluginConfig` implementation for all plugin services in the `Plugin Service Module` package and separate them by LF.

In `Plugin Main Module` you can use [PluginServiceManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/service/PluginServiceManager.java) to get `PluginService`:
  ```java
  // ${plugin service class} is the plugin service class
  PluginServiceManager.getPluginService(${plugin service class});
  ```
  `PluginServiceManager` is a particular case of [ServiceManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/ServiceManager.java). The latter interface can be used directly to access the core and plugin services:
  
  ```java
  // ${base service class}is the core service class or plugin service class
  ServiceManager.getService(${base service class});
  ```
## Log

Considering dependency isolation, [**Sermant** core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core) provides the `plugin` and `service` to use **jul** log. Get the **jul** log instance by:

```java
import com.huaweicloud.sermant.core.common.LoggerFactory;
Logger logger=LoggerFactory.getLogger();
```
To print logs of different levels:
```java
LOGGER.severe("severe");
LOGGER.warning("warning");
LOGGER.info("info");
LOGGER.fine("fine");
```

## Dynamic Config

Dynamic configuration is one of the core services in [**Sermant** core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core). An instance is obtained by:
```java
DynamicConfigService service = ServiceManager.getService(DynamicConfigService.class);
```

Invoke the following method to register a listener:
```java
// ${group} is user group，${key} is the key listened. For zookeeper, the path is: / + ${group} + ${key}
// if ${group} do not exist，it will set the value by dynamicconfig.default_group in unified configuration
service.addConfigListener("${key}", "${group}", new DynamicConfigListener() {
  @Override
  public void process(ConfigChangedEvent event) {
    // do something
  }
});
```

Once the listener is registered, the `process` method will be triggered when the server creates, deletes, modifies, or adds child nodes.

## Heartbeat

Heartbeat is one of the core services in [**Sermant** core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core). An instance of heartbeatService is obtained by:
```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

The heartbeat service starts execution when it is initialized, and periodically sends the name, version and other information of each plugin to the backend server. Currently, plugin heartbeats report information like:

- `hostname`: The hostname of the sending client
- `ip`: The ip of the sending client
- `app`: Application name, as well as `appName` in startup parameters
- `appType`: Application type，as well as `appType` in startup parameters
- `heartbeatVersion`: Time of last heartbeat
- `lastHeartbeat`: Time of last heartbeat
- `version`: The version of the core package, as well as the `sermant-version` value of the core package `manifest` file
- `pluginInfoMap`: Current Sermant carried plugin information
  - `pluginName`: Plug-in name, which can be determined in the plug-in configuration file
  - `pluginVersion`: Plug-in version, which is the `Sermant-plugin-version` value of the `manifest` file in the plugin jar
  - `extInfo`: Additional content that the plug-in wants to report in the data that the plug-in reports

If you want to add additional content to the data reported by the plugin, you can call the following API:
```java
// use ExtInfoProvider to add additional content
heartbeatService.setExtInfo(new ExtInfoProvider() {
  @Override
  public Map<String, String> getExtInfo() {
    // do something
  }
});
```

## Trace Tracking

The **Trace Tracking** is an upper layer function established by message sending capability, which simply means embedding the following logic between the invoke chains of the host side:

- When sending data, the `TraceId` and `SpanId` required by the trace are inserted in the data packet. The former is the view of the whole trace in the distributed system, and the later represents the view inside the different services in the whole trace.
- When receiving data, it parses the trace-related content embedded in the data packet, forms a trace and submits it to the backend server, and gradually forms a invoke chain.

To form a complete call chain across processes, link context data needs to be extracted and injected in the producer's method of processing external requests and the consumer's method of initiating requests to the external:

- Enhancements to the way producers handle external requests are as follows:
```java
  TracingService tracingService = ServiceManager.getService(TracingService.class);

  @Override
  public ExecuteContext before(ExecuteContext context) throws Exception {
      TracingRequest request =
          new TracingRequest(context.getRawCls().getName(), context.getMethod().getName());
      ExtractService<HashMap<String, String>> extractService = (tracingRequest, carrier) -> {
          tracingRequest.setTraceId(carrier.get(TracingHeader.TRACE_ID.getValue()));
          tracingRequest.setParentSpanId(carrier.get(TracingHeader.PARENT_SPAN_ID.getValue()));
          tracingRequest.setSpanIdPrefix(carrier.get(TracingHeader.SPAN_ID_PREFIX.getValue()));
      };
      tracingService.onProviderSpanStart(request, extractService, (HashMap<String, String>)context.getArguments()[0]);
      return context;
  }

  @Override
  public ExecuteContext after(ExecuteContext context) throws Exception {
      tracingService.onSpanFinally();
      return context;
  }

  @Override
  public ExecuteContext onThrow(ExecuteContext context) throws Exception {
      tracingService.onSpanError(context.getThrowable());
      return context;
  }
```
- For the consumer request external method, make the following enhancements:
```java
  TracingService tracingService = ServiceManager.getService(TracingService.class);

  @Override
  public ExecuteContext before(ExecuteContext context) throws Exception {
      return context;
  }

  @Override
  public ExecuteContext after(ExecuteContext context) throws Exception {
      TracingRequest request =
          new TracingRequest(context.getRawCls().getName(), context.getMethod().getName());
      InjectService<HashMap<String, String>> injectService = (spanEvent, carrier) -> {
          carrier.put(TracingHeader.TRACE_ID.getValue(), spanEvent.getTraceId());
          carrier.put(TracingHeader.PARENT_SPAN_ID.getValue(), spanEvent.getSpanId());
          carrier.put(TracingHeader.SPAN_ID_PREFIX.getValue(), spanEvent.getNextSpanIdPrefix());
      };
      tracingService.onConsumerSpanStart(request, injectService, (HashMap<String, String>)context.getResult());
      tracingService.onSpanFinally();
      return context;
  }

  @Override
  public ExecuteContext onThrow(ExecuteContext context) throws Exception {
      tracingService.onSpanError(context.getThrowable());
      return context;
  }
```