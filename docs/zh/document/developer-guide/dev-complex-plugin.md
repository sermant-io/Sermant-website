# 插件功能开发介绍

本文档主要针对**Sermant**的插件开发进行说明，介绍如何在插件开发中利用**Sermant**提供的API实现字节码增强需求并利用日志、心跳、配置等功能简化插件的开发。

## 插件结构

一个**Sermant**的插件中可包含以下内容：

- `插件主模块(plugin)`，该模块主要用于声明字节码增强逻辑及插件服务接口定义
- `插件服务模块(service)`，该模块用于为插件包提供插件服务接口实现

开始之前，需要明确约定，为避免类冲突问题，在`插件主模块(plugin)`中，开发者只能使用Java原生API和[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)中的API，不能依赖或使用任何除`byte-buddy`以外的第三方依赖。如果应业务要求，需要使用其他第三方依赖的话，只能在`插件主模块(plugin)`中定义功能接口，并在`插件服务模块(service)`中编写接口实现。

### 插件主模块

在插件主模块中编写**增强定义**、**拦截器**和**插件服务接口**，插件主模块中不可引入第三方依赖。
### 插件服务模块

**插件服务模块**较**插件主模块**相比：

- 只能编写**插件配置**和**插件服务接口**的实现，不能编写**增强定义**、**拦截器**和**插件服务接口**
- 允许自由添加需要的第三方依赖，打包的时候，需要提供输出依赖的方式，可以用`shade`插件或`assembly`插件打带依赖jar包，也可以直接使用`dependency`插件输出依赖包。
- 需以`provided`形式在其pom中引入其对应的插件主模块。

## 增强逻辑

**Sermant**的核心能力是对宿主应用做非侵入式的字节码增强，而这些增强能力则是插件化的。在每个**Sermant**插件的`插件主模块(plugin)`中，都可以声明一些增强逻辑，针对宿主应用的某些特定方法进行字节码增强，从而实现某种功能，因此描述好该增强什么类及类的方法是一个重要的课题。

声明插件增强逻辑需要实现[PluginDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/PluginDeclarer.java)接口，其中包含三个接口方法：

- `getClassMatcher`方法用于获取被增强类的匹配器[ClassMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassMatcher.java)。
- `getInterceptDeclarers`方法用于获取被增强类的拦截方法的匹配器[MethodMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/MethodMatcher.java)，以及为拦截点声明的拦截器，他们封装于拦截声明[InterceptDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/InterceptDeclarer.java)中。
- `getSuperTpeDecarers`方法用于获取插件的超类声明[SuperTypeDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/SuperTypeDeclarer.java)

### 类匹配器

对匹配器 [ClassMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassMatcher.java)，在核心模块中提供了两种类型的匹配器：

[ClassTypeMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassTypeMatcher.java)(类的类型匹配器)

- 完全通过名称匹配，也是最常见的定位方式，通过以下方法获取：
  ```java
  ClassMatcher.nameEquals("${class reference}");
  ```
  其中`${class reference}`为被增强类的全限定名。


- 通过名称匹配多个类，属于`nameEquals`的复数版，可通过以下方法获取：
  ```java
  ClassMatcher.nameContains("${class reference array}");
  ```
  其中`${class reference array}`为被增强类的全限定名可变数组。

[ClassFuzzyMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassFuzzyMatcher.java)（类的模糊匹配器）

- 通过全限定名前缀定位到被增强类，可通过以下方法获取：
  ```java
  ClassMatcher.namePrefixedWith("${prefix}");
  ```
  其中`${prefix}`为全限定名前缀。


- 通过全限定名后缀定位到被增强类，可以通过一下方法获取：
  ```java
  ClassMatcher.nameSuffixedWith("${suffix}")
  ```
  其中`${suffix}`为全限定名后缀。


- 通过全限定名内缀定位到被增强类，可以通过以下方法获取：
  ```java
  ClassMatcher.nameinfixedWith("${infix}")
  ```
  其中`${infix}`为全限定名内缀。


- 通过正则表达式匹配全限定名定位到被增强类，可以通过以下方法获取：
  ```java
  ClassMatcher.nameMatches("${pattern}")
  ```
  其中`${pattern}`为正则表达式。


- 通过注解定位到被该注解修饰的类，可通过以下方法获取：
  ```java
  ClassMatcher.isAnnotationWith("${annotation reference array}");
  ```
  其中`${annotation reference array}`为注解的全限定名可变数组。


- 通过超类定位到该类的子类，可通过以下方法获取：
  ```java
  ClassMatcher.isExtendedFrom("${super class array}");
  ```
  其中`${super class array}`为超类可变数组。考虑到Java的继承规则，该数组只能有一个`Class`，其余必须全为`Interface`。


- 匹配的逻辑操作，匹配器全部不匹配时为真：
  ```java
  ClassMatcher.not("${class matcher array}")
  ```
  其中`${class matcher array}`为匹配器可变长数组


- 匹配的逻辑操作，匹配器全部都匹配时为真：
  ```java
  ClassMatcher.and("${class matcher array}")
  ```
  其中`${class matcher array}`为匹配器可变长数组


- 匹配的逻辑操作，匹配器其中一个匹配时为真：
  ```java
  ClassMatcher.or("${class matcher array}")
  ```
  其中`${class matcher array}`为匹配器可变长数组

### 方法匹配器

对于方法匹配器[MethodMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/MethodMatcher.java)，提供了多种匹配方法：

- 全数匹配：
  ```java
  MethodMatcher.any();
  ```
- 名称匹配：
  ```java
  MethodMatcher.nameEquals("${method name}");
  ```
  其中`${method name}`为方法名称。


- 匹配静态方法：
  ```java
  MethodMatcher.isStaticMethod();
  ```
- 匹配构造函数：
  ```java
  MethodMatcher.isConstructor();
  ```
- 匹配多个方法：
  ```java
  MethodMatcher.nameContains("${method name array}");
  ```
  其中`${method name array}`为方法名称数组。


- 根据方法名称前缀匹配：
  ```java
  MethodMatcher.namePrefixedWith("${method name prefix}");
  ```
  其中`${method name prefix}`为方法名称前缀。


- 根据方法名称后缀匹配：
  ```java
  MethodMatcher.nameSuffixedWith("${method name suffix}");
  ```
  其中`${method name suffix}`为方法名称后缀。


- 根据方法名称内缀匹配：
  ```java
  MethodMatcher.nameinfixedWith("${method name infix}");
  ```
  其中`${method name infix}`为方法名称内缀。


- 根据正则表达式匹配：
  ```java
  MethodMatcher.nameMatches("${pattern}");
  ```
  其中`${pattern}`为正则表达式。


- 匹配被传入注解修饰的方法：
  ```java
  MethodMatcher.isAnnotatedWith("${annotations array}");
  ```
  其中`${annotations array}`为注解集。


- 匹配指定入参数量的方法：
  ```java
  MethodMatcher.paramCountEquals("${param count}");
  ```
  其中`${param count}`为入参数量。


- 匹配指定入参类型的方法：
  ```java
  MethodMatcher.paramTypeEquals("${param type array}");
  ```
  其中`${param type array}`为入参类型集。


- 匹配指定返回值类型的方法：
  ```java
  MethodMatcher.resultTypeEquals("${result type}");
  ```
  其中`${result type}`返回值类型。


- 逻辑操作，方法匹配器集全不匹配时则结果为真
  ```java
  MethodMatcher.not("${element matcher array}");
  ```
  其中`${element matcher array}`为方法匹配器集。


- 逻辑操作，方法匹配器集全匹配时则结果为真
  ```java
  MethodMatcher.and("${element matcher array}");
  ```
  其中`${element matcher array}`为方法匹配器集。


- 逻辑操作，方法匹配器集其中一个匹配时则结果为真
  ```java
  MethodMatcher.or("${element matcher array}");
  ```
  其中`${element matcher array}`为方法匹配器集。

更多方法匹配方式可以参考[byte-buddy](https://javadoc.io/doc/net.bytebuddy/byte-buddy/latest/net/bytebuddy/matcher/ElementMatchers.html)中含`MethodDescription`泛型的方法。

开发完成后，需要添加`PluginDeclarer`接口的*SPI*配置文件：

- 在资源目录`resources`下添加`META-INF/services`文件夹。
- 在`META-INF/services`中添加`com.huaweicloud.sermant.core.plugin.agent.declarer.PluginDeclarer`配置文件。
- 在上述文件中，以换行为分隔，键入插件包中所有的增强定义`PluginDeclarer`实现。
#### 原生类增强

增强原生类和增强普通类在增强定义和拦截器编写上没有什么区别，但是还是希望插件开发者尽量少地对原生类进行增强，原因有三：

- 对原生类的增强往往是发散的，对他们增强很可能会对其他插件或宿主功能造成影响。
- 对原生类的增强逻辑，将使用反射的方式调用系统类加载器中的拦截器方法。由于*Java*重定义*Class*的限制，每次调用被增强方法的时候，都会进行反射处理的逻辑，这将极大影响被增强方法的性能。
- 对原生类的增强过程中，涉及到使用**Advice模板类**生成动态拦截类。对于每个被增强的原生类方法，都会动态生成一个，他们将被系统类加载器加载。如果不加限制的增强原生类，加载动态类也会成为启动过程中不小的负担。

综上，[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)中提供对*Java*原生类增强的能力，但不建议不加限制地对他们进行增强，如果有多个增强点可选，优先考虑增强普通类。

### 拦截器
拦截器用于定义在对被增强类的方法进行字节码增强时的前置、后置及处理异常时的增强逻辑：
- [Interceptor](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/interceptor/Interceptor.java): 拦截器接口，其中包含三个方法：
  - `before`，前置方法，该方法在拦截点之前执行。ExecuteContext参数为插件执行的上下文，里面封装拦截器运作所需的所有参数，通过skip方法可跳过主要流程，并设置最终方法结果，注意，增强构造函数时，不能跳过主要流程。
  - `after`，后置方法，无论被拦截方法是否正常执行，最后都会进入后置方法中。后置方法可以通过返回值覆盖被拦截方法的返回值，因此这里开发者需要注意不要轻易返回null。
  - `onThrow`，处理异常的方法，当被拦截方法执行异常时触发。这里处理异常并不会影响异常的正常抛出。
## 插件配置

定义插件配置首先需要为插件定义一个插件配置类，其需要继承[PluginConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/config/PluginConfig.java)插件配置接口，并通过[ConfigTypeKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigTypeKey.java)修饰类，指定该配置类可读取配置的前缀，通过[ConfigFieldKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigFieldKey.java)修饰类中的变量（如果不修饰，则读读取配置名和该变量名相同的配置），指定该变量对应的配置的配置名。

在插件的`config`目录下创建一个config.yaml文件：
```yaml
demo.config:
  demo-config-A: false
  demoConfigB: 127.0.0.1
```
对应的配置类：
```java
@ConfigTypeKey(value = "demo.config")
public class DemoConfig implements PluginConfig {
    @ConfigFieldKey("demo-config-A")
    private boolean demoConfigA;

    private String demoConfigB;
}
```

最后，不要忘记添加插件配置的*SPI*配置文件：

- 在资源目录`resources`下添加`META-INF/services`文件夹。
- 在`META-INF/services`中添加`com.huaweicloud.sermant.core.plugin.config.PluginConfig`配置文件。
- 在上述文件中，以换行为分隔，键入插件包中所有的插件配置`PluginConfig`实现。

在插件中如何使用该配置呢，[PluginConfigManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/config/PluginConfigManager.java)插件配置管理器提供获取插件配置`PluginConfig`的接口，在插件中可以通过该管理器获取插件配置的实例并使用，获取实例的方法如下：

  ```java
  // ${plugin config class}为插件配置的Class
  PluginConfigManager.getPluginConfig(${plugin config class});
  ```
  `PluginConfigManager`是统一配置管理器[ConfigManager](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/ConfigManager.java)的特例，插件端可以直接使用后者的接口获取插件配置和统一配置：

  ```java
  // ${base config class}为统一配置或插件配置的Class
  ConfigManager.getConfig(${base config class});
  ```
插件配置现在支持的数据类型包括：

- 布尔、数值类的基础类型及包装类型
- 字符串类型
- 枚举类型
- 复杂对象类型
- 上述类型构成的数组
- 前四种类型构成的*List*
- 前四种类型构成的*Map*

*yaml*格式配置文件目前还有一些其他规则：

- 对于数组、List和Map中涉及的复杂对象，不支持`ConfigFieldKey`修正属性名
- 对于数组、List和Map中的字符串，不支持`${}`转换，**插件配置类**的字符串属性和复杂类型属性内部的字符串属性支持
- 仅在字符串做`${}`转换时使用入参，不支持使用入参直接设置属性值
- 配置类的字段名一般为小驼峰命名，可用[ConfigFieldKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigFieldKey.java)注解修饰为中划线风格定义别名。添加注解后，在*yaml*中即可用中划线或小驼峰皆可解析。
- 配置生效的优先级为：启动参数 > 环境变量 > 系统变量(-D参数) > *yaml*文件配置
- 配置类的属性在按照生效的优先级获取参考值(启动参数，环境变量和系统变量(-D参数))时，小驼峰和中划线都可以被分割成单词来进行查找匹配。
- 若*yaml*配置中基本数据类型/数组/map/list/set(不支持包含复杂对象)的key未定义，将按照配置生效的优先级：启动参数 > 环境变量 > 系统变量(-D参数) 来获取参考值。从上述数据源获取参考值时，需注意：
  - 数组/list/set需配置为`yaml`字符串格式，例如：LIST_NAME=[elem1,elem2]
  - map需配置为`yaml`字符串格式，例如：MAP_NAME={key1: value1, key2: value2}
## 插件服务

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
## 日志功能

考虑到依赖隔离的问题，[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)提供给`插件主模块(plugin)`和`插件服务模块(service)`使用的日志是**jul**日志，通过以下方法获取**jul**日志实例：

```java
import com.huaweicloud.sermant.core.common.LoggerFactory;
Logger logger=LoggerFactory.getLogger();
```
打印不同级别的日志：
```java
LOGGER.severe("severe");
LOGGER.warning("warning");
LOGGER.info("info");
LOGGER.fine("fine");
```

## 动态配置功能

**动态配置功能**是[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)的核心服务之一。该功能允许Sermant从动态配置中心拉取配置以实现丰富多样的服务治理能力。

如何使用动态配置中心能力可参考[Sermant动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html)。 下文将介绍如何在插件中开发动态配置相关能力。

### 动态配置服务API

**动态配置功能**的服务功能`API`由[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)抽象类提供，其实现三个接口，见于[API](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api)目录中，具体接口如下所示：

| 接口                                                         | 方法                                                         | 解析                                                       |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------- |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | String getConfig(String)                                     | 获取某个键的配置值(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean publishConfig(String, String)                        | 设置某个键的配置值(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean removeConfig(String)                                 | 移除某个键的配置值(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | List\<String> listKeys()                                     | 获取所有键(默认组)                                         |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | 为某个键添加监听器(默认组)                                 |
| [KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java) | boolean removeConfigListener(String)                         | 移除某个键的监听器(默认组)                                 |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | String getConfig(String, String)                             | 获取组下某个键的配置值                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean publishConfig(String, String, String)                | 设置组下某个键的配置值                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean removeConfig(String, String)                         | 移除组下某个键的配置值                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean addConfigListener(String, String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | 为组下某个键添加监听器                                     |
| [KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java) | boolean removeConfigListener(String, String)                 | 移除组下某个键的监听器                                     |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | List\<String> listKeysFromGroup(String)                      | 获取组中所有键                                             |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)) | 为组下所有的键添加监听器                                   |
| [GroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/GroupService.java) | boolean removeGroupListener(String)                          | 移除组下所有键的监听器                                     |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addConfigListener(String, [DynamicConfigListener](../../sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | 为某个键添加监听器(默认组)，根据入参决定是否触发初始化事件 |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addConfigListener(String, String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | 为组下某个键添加监听器，根据入参决定是否触发初始化事件     |
| [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) | boolean addGroupListener(String, [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), boolean) | 为组下所有的键添加监听器，根据入参决定是否触发初始化事件   |

以上，需要明确两个概念：

- `Key`，单指某个动态配置的键
- `Group`，指一系列动态配置的分组，通常用于区分使用者

通过观察可以发现，以上的`API`主要分为数据的增删查改操作，以及监听器的[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)增删操作，其中后者的事件回调是**动态配置服务**得以实现功能中至关重要的一环，也是插件中使用**动态配置服务**的主要功能。

另外，在[KeyService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyService.java)接口中定义的所有`API`都是不带`Group`的`API`，它们在[DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java)中其实都会使用默认`Group`修正为[KeyGroupService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api/KeyGroupService.java)的`API`，这点需要注意。默认`Group`可以通过**统一配置文件**`config.properties`的`dynamic.config.defaultGroup`修改。

最后，除了以上的服务接口以外，开发者还需要关注一些其他接口、配置或实体：

**动态配置服务**的静态配置[DynamicConfig](https://github.com/huaweicloud/Sermant/blob/0.9.x/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/config/DynamicConfig.java)，其参数配置可参考[Sermant动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html)。

**动态配置服务**实现类型[DynamicConfigServiceType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigServiceType.java)，含以下几种类型：

- | 枚举值    | 解析                |
  | :-------- | :------------------ |
  | ZOOKEEPER | ZooKeeper实现       |
  | KIE       | ServiceComb Kie实现 |
  | NOP       | 无实现              |

- 动态配置监听器[DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)，其中包含的接口方法如下：

  | 方法                                                         | 解析                       |
  | :----------------------------------------------------------- | :------------------------- |
  | void process([DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)) | 处理配置改变事件的回调接口 |

- 动态配置改变事件[DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)，其成员属性如下：

  | 类型                                                         | 属性      | 解析     |
  | :----------------------------------------------------------- | :-------- | :------- |
  | String                                                       | key       | 配置键   |
  | String                                                       | group     | 配置分组 |
  | String                                                       | content   | 配置信息 |
  | [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java) | eventType | 事件类型 |

- 动态配置改变事件类型[DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)，含以下四种：

  | 枚举值 | 解析                     |
  | :----- | :----------------------- |
  | INIT   | 添加监听器时的初始化响应 |
  | CREATE | 配置新增事件             |
  | MODIFY | 配置信息修改事件         |
  | DELETE | 配置删除事件             |

### 动态配置功能开发示例

动态配置功能的`DynamicConfigService`实例可以通过以下代码获取：

```java
DynamicConfigService service = ServiceManager.getService(DynamicConfigService.class);
```

获取服务实例之后，可以调用上文表格中列出的API进行相应的动作。例如，若需注册一个动态配置的监听器，可通过以下方法来实现：
```java
// ${group}为用户分组，${key}为监听的键，对zookeeper来说，监听的路径相当于: / + ${group} + ${key}
// 如果不传${group}，则会默认设置为统一配置中dynamicconfig.default_group对应的值
service.addConfigListener("${key}", "${group}", new DynamicConfigListener() {
  @Override
  public void process(ConfigChangedEvent event) {
    // do something
  }
});
```

注册监听器之后，当服务器对应节点发生创建、删除、修改、添加子节点等事件时，就会触发`process`函数。

其他接口的使用示例此处不一一列出，可参考上文的API描述。

## 心跳功能

心跳功能是[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)的核心服务之一，通过以下代码获取实例：
```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

心跳功能在初始化的时候就会启动执行，定期将每个插件的名称、版本等信息发送至后端服务器。目前来说，插件的心跳上报的信息包括：

- `hostname`：发送客户端的主机名
- `ip`：发送客户端的IP地址
- `app`：应用名称，即启动参数中的`appName`
- `appType`：应用类型，即启动参数中的`appType`
- `heartbeatVersion`：上一次心跳发送时间
- `lastHeartbeat`：上一次心跳发送时间
- `version`：核心包的版本，即核心包`manifest`文件的`Sermant-Version`值
- `pluginInfoMap`：当前Sermant携带的插件信息
  - `pluginName`：插件名称，通过插件设定文件确定
  - `pluginVersion`：插件版本号，取插件jar包中`manifest`文件的`Sermant-Plugin-Version`值
  - `extInfo`：插件希望在插件上报的数据中上报的额外内容

如果希望在插件上报的数据中增加额外的内容，可以调用以下api：
```java
// 通过自定义ExtInfoProvider提供额外内容集合
heartbeatService.setExtInfo(new ExtInfoProvider() {
  @Override
  public Map<String, String> getExtInfo() {
    // do something
  }
});
```

## 链路功能

**链路功能**是一个继消息发送能力建立的一个上层功能，该功能简单来说就是从宿主端的调用链之间嵌入以下逻辑：

- 在发送数据的时候，在数据包中插入链路所需的`TraceId`和`SpanId`，前者是请求在分布式系统中的整个链路视图，后者代表整个链路中不同服务内部的视图。
- 在接收数据的时候，解析数据包中嵌入的链路相关内容，形成链路的一环提交到后台服务器中，逐渐形成调用链。

如需跨进程形成完整调用链，需要在生产者处理外部请求的方法和消费者向外部发起请求的方法中进行链路上下文数据的提取和注入：
- 对于生产者处理外部请求的方法，做如下增强：
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
- 对于消费者请求外部的方法，做如下增强：
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