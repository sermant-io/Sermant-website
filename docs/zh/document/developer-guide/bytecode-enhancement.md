# 字节码增强

在每个**Sermant**插件的`插件主模块(plugin)`中，都可以声明一些增强逻辑，针对宿主应用的某些特定方法进行字节码增强，从而实现某种功能，因此描述好该增强什么类及类的方法是一个重要的课题。

## 增强声明
插件开发中，需要在[插件主模块](package-structure.md#插件主模块)中定义字节码增强的声明，声明插件字节码增强逻辑需要实现[PluginDeclarer](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/declarer/PluginDeclarer.java)接口，其中包含三个接口方法：

- `getClassMatcher`方法用于获取被增强类的匹配器[ClassMatcher](#类匹配器)。
- `getInterceptDeclarers`方法用于获取被增强类的拦截方法的匹配器[MethodMatcher](#方法匹配器)，以及为拦截点声明的拦截器[Interceptor](#拦截器)，他们封装于拦截声明[InterceptDeclarer](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/declarer/InterceptDeclarer.java)中。
- `getSuperTpeDecarers`方法用于获取插件的超类声明[SuperTypeDeclarer](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/declarer/SuperTypeDeclarer.java)

实现完成后，需要添加`PluginDeclarer`接口的*SPI*配置文件：

- 在资源目录`resources`下添加`META-INF/services`文件夹。
- 在`META-INF/services`中添加`io.sermant.core.plugin.agent.declarer.PluginDeclarer`配置文件。
- 在上述文件中，以换行为分隔，键入插件包中所有的增强定义`PluginDeclarer`实现。

## 类匹配器

对匹配器 [ClassMatcher](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/matcher/ClassMatcher.java)，在核心模块中提供了两种类型的匹配器：

[ClassTypeMatcher](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/matcher/ClassTypeMatcher.java)(类的类型匹配器)

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

[ClassFuzzyMatcher](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/matcher/ClassFuzzyMatcher.java)（类的模糊匹配器）

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

## 方法匹配器

对于方法匹配器[MethodMatcher](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/agent/matcher/MethodMatcher.java)，提供了多种匹配方法：

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
### 原生类增强

增强原生类和增强普通类在增强定义和拦截器编写上没有什么区别，但还是希望插件开发者尽量少地对原生类进行增强，原因有二：

- 对原生类进行增强可能导致不可预知的错误。因为原生类在开发过程中被广泛使用，对它们增强后可能会对使用到该类的其他插件或宿主功能造成影响。
- 对Sermant增强过程中使用的个别原生类方法进行增强可能会出现类循环依赖错误。比如Sermant类加载器在加载类的过程中会使用`java.net.URL`类，如果在插件中对URL类的构造方法进行增强，宿主应用挂载Agent启动后JVM抛出`ClassCircularityError`错误。

综上，[**Sermant**核心功能模块](https://github.com/sermant-io/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)中提供对*Java*原生类增强的能力，但不建议不加限制地对他们进行增强，如果有多个增强点可选，优先考虑增强普通类。

> 我们在FAQ中的[Sermant框架常见问题](../faq/framework.md)里列举了已知的[Sermant不支持增强的原生类](../faq/framework.md#sermant不支持对哪些原生类的增强)。

## 拦截器
拦截器被用来定义对被增强类的增强逻辑。Sermant的拦截器中，Before、After、Throw三个阶段共同组成了完整的拦截器生命周期，并在其上提供了形如跳过方法执行，修改方法参数，修改方法返回，修改异常抛出等通用能力。
- [Interceptor](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-god/src/main/java/io/sermant/core/plugin/agent/interceptor/Interceptor.java): 拦截器接口，其中包含before、after和onThrow三个方法，分别对应于拦截器生命周期的三个阶段。ExecuteContext参数为插件执行的上下文，里面封装拦截器运作所需的所有参数：
  - `before`，前置方法，对应拦截器生命周期的Before阶段。该方法在拦截点之前执行。可通过ExecuteContext参数执行修改方法入参、跳过拦截点宿主方法的执行等操作。注意，增强构造函数时，不能跳过构造方法的执行。
  - `after`，后置方法，对应拦截器生命周期的After阶段。after方法在拦截点运行结束后执行，在after方法中可以通过ExecuteContext参数修改方法的返回值。
  - `onThrow`，异常处理方法，对应拦截器生命周期的Throw阶段。该方法在拦截点抛出异常时才能触发执行，如果异常在拦截点方法中被捕获，则无法触发onThrow方法。在onThrow方法中可以通过ExecuteContext参数修改抛出的异常，如果将异常修改为null，此时方法将不再会抛出异常。