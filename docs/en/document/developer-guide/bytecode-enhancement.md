# Bytecode Enhancement

In each `plugin main module` of  **Sermant** plugin, some enhancement logic can be declared to enhance bytecode for certain methods of the host application in order to achieve a certain function, so it is an important topic to describe what class and class methods to enhance.

## Enhanced Statement
In plugin development, the bytecode enhancement declaration needs to be defined in the [main module of the plugin](package-structure.md#Plugin-Main-Module), declaring the plugin bytecode enhancement logic requires implementing [PluginDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/PluginDeclarer.java) interface, which consists of three interface methods:

- `getClassMatcher` method is used to get the [ClassMatcher](#Class-Matcher) of the enhanced class .
- `getInterceptDeclarers` method is used to get the [MethodMatcher](#Method-Matcher) of the intercepting method of the enhanced class, and the [Interceptor](#Interceptor) declared for the interception point, they are encapsulated in intercept statements [InterceptDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/InterceptDeclarer.java).
- `getSuperTpeDecarers` is used to get super class declaration [SuperTypeDeclarer](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/declarer/SuperTypeDeclarer.java) of plugin.

After the implementation is complete, you need to add the SPI profile of the PluginDeclarer interface:

- Add `META-INF/services` file in `resources` directory.
- Add `com.huaweicloud.sermant.core.plugin.agent.declarer.PluginDeclarer` profile file in `META-INF/services`.
- In the above file, separated by exchange behavior, type the fully qualified names of all the classes in the plugin package that implement the PluginDeclarer interface.

## Class Matcher

For [ClassMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassMatcher.java), two types of matchers are provided in the core module：

[ClassTypeMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassTypeMatcher.java)(Class type matcher)

- Matching by name, which is the most common method of locating, can be obtained by the following methods:
  ```java
  ClassMatcher.nameEquals("${class reference}");
  ```
  `${class reference}` is the fully qualified name of the enhanced class.


- Matches multiple classes by name, belonging to the plural version of `nameEquals`, which can be obtained by the following method:
  ```java
  ClassMatcher.nameContains("${class reference array}");
  ```
  `${class reference array}` is a fully qualified mutable array of the enhanced class.

[ClassFuzzyMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/ClassFuzzyMatcher.java)（Fuzzy matcher of class）

- The enhanced class is located by the fully qualified name prefix, which can be obtained by the following method:
  ```java
  ClassMatcher.namePrefixedWith("${prefix}");
  ```
  `${prefix}` is a fully qualified name prefix.


- The fully qualified name suffix is used to locate the enhanced class, which can be obtained by the following method：
  ```java
  ClassMatcher.nameSuffixedWith("${suffix}")
  ```
  `${suffix}` is a fully qualified name suffix.


- The enhanced class is located by a fully qualified name infix, which can be obtained by the following method：
  ```java
  ClassMatcher.nameinfixedWith("${infix}")
  ```
  `${infix}` is a fully qualified name infix.


- Locate the enhanced class by matching the fully qualified name with a regular expression, which can be obtained by the following methods:
  ```java
  ClassMatcher.nameMatches("${pattern}")
  ```
  `${pattern}` is a regular expression.


- The annotation is used to locate the class that is modified by the annotation, which can be obtained by:
  ```java
  ClassMatcher.isAnnotationWith("${annotation reference array}");
  ```
  `${annotation reference array}` a fully qualified mutable array for annotations.


- The superclass locates the subclass of the class, which can be obtained by the following method：
  ```java
  ClassMatcher.isExtendedFrom("${super class array}");
  ```
  `${super class array}` is a superclass variable array. Due to Java's inheritance rules, this array can only have one `Class` and the rest must be all `interfaces`.


- A logical operation that matches is true if none of the matchers match：
  ```java
  ClassMatcher.not("${class matcher array}")
  ```
  `${class matcher array}` is a variable length array for matchers.


- A logical operation that matches is true when all matchers match：
  ```java
  ClassMatcher.and("${class matcher array}")
  ```
  `${class matcher array}` is a variable length array for matchers.


- The logical operation of matching, where one of the matchers matches is true：
  ```java
  ClassMatcher.or("${class matcher array}")
  ```
  `${class matcher array}` is a variable length array for matchers.

## Method Matcher

For [MethodMatcher](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/agent/matcher/MethodMatcher.java), a variety of matching methods are provided:

- Full matching：
  ```java
  MethodMatcher.any();
  ```
- Name matching：
  ```java
  MethodMatcher.nameEquals("${method name}");
  ```
  `${method name}` is method name。


- Matching static method：
  ```java
  MethodMatcher.isStaticMethod();
  ```
- Matching constructor：
  ```java
  MethodMatcher.isConstructor();
  ```
- Matching multiple methods：
  ```java
  MethodMatcher.nameContains("${method name array}");
  ```
  `${method name array}` is an array of method names.


- Match by method name prefix：
  ```java
  MethodMatcher.namePrefixedWith("${method name prefix}");
  ```
  `${method name prefix}` is a method name prefix.


- Match by method name suffix：
  ```java
  MethodMatcher.nameSuffixedWith("${method name suffix}");
  ```
  `${method name suffix}` is a method name suffix.


- Match by method name infix：
  ```java
  MethodMatcher.nameinfixedWith("${method name infix}");
  ```
  `${method name infix}` is a method name infix.


- Match according to regular expression：
  ```java
  MethodMatcher.nameMatches("${pattern}");
  ```
  `${pattern}` is regular expression.


- Matches the method modified by the incoming annotation：
  ```java
  MethodMatcher.isAnnotatedWith("${annotations array}");
  ```
  `${annotations array}` is annotation set.


- Matches the method with the specified number of inputs：
  ```java
  MethodMatcher.paramCountEquals("${param count}");
  ```
  `${param count}` is  the specified number of inputs.


- Matches the method of the specified input type：
  ```java
  MethodMatcher.paramTypeEquals("${param type array}");
  ```
  `${param type array}` is an input type set.


- Matches a method of the specified return value type：
  ```java
  MethodMatcher.resultTypeEquals("${result type}");
  ```
  `${result type}` is return value type.


- Logical operation, the result is true if the method matcher set does not match at all:
  ```java
  MethodMatcher.not("${element matcher array}");
  ```
  `${element matcher array}` is method matcher set.


- Logical operation, the result is true if the method matcher set matches all:
  ```java
  MethodMatcher.and("${element matcher array}");
  ```
  `${element matcher array}` is method matcher set.


- Logical operation where the result is true if one of the method matchers in the set matches:
  ```java
  MethodMatcher.or("${element matcher array}");
  ```
  `${element matcher array}` is method matcher set.

For more method matching methods, see the method with the `MethodDescription` generic in [byte-buddy](https://javadoc.io/doc/net.bytebuddy/byte-buddy/latest/net/bytebuddy/matcher/ElementMatchers.html).
### Native Class Enhancement

There is no difference between enhancing native classes and enhancing ordinary classes in terms of enhancement definition and interceptor writing, but it is desirable for plugin developers to enhance native classes as little as possible for three reasons:

- Enhancements to native classes tend to be diffused, and enhancements to them are likely to have an impact on other plugins or host functions.
- Enhanced logic for native classes invokes the interceptor methods in the system class loader using reflection. Due to the limitations of *Java* redefinition *Class*, every time the enhanced method is called, the reflection processing logic will be performed, which will greatly affect the performance of the enhanced method.
- Enhancements to native classes involve generating dynamic intercepting classes using **Advice template classes**. For each enhanced native class method, one is generated dynamically, and they are loaded by the system class loader. If native classes are enhanced without restriction, loading dynamic classes can also become a considerable burden during the startup process.

To sum up, The ability to enhance *Java* native classes is provided in [**Sermant** core function module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core), but it is not recommended to enhance them without restriction, if there are multiple enhancement points to choose from, the common class is preferred.

## Interceptor
Interceptors are used to define enhancement logic when bytecode enhancement is performed on methods of the enhanced class, when postset, and when exception handling is performed：
- [Interceptor](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-god/src/main/java/com/huaweicloud/sermant/core/plugin/agent/interceptor/Interceptor.java): interceptor interface, which contains three methods：
  - `before`: prefix method, which is executed before the intercept point. The ExecuteContext argument is the context in which the plugin executes, encapsulating all the parameters needed for the interceptor to operate. The skip method allows you to skip the main flow and set the final method result. Note that the main flow cannot be skipped when the constructor is enhanced.
  - `after`:  post method, regardless of whether the blocked method is executed normally, will eventually enter the post-method. Post methods can override the return value of the intercepted method with a return value, so developers need to be careful not to return null too easily here.
  - `onThrow`: a method to handle exceptions, triggered when the intercepted method executes an exception. Handling the exception here does not affect the normal throwing of the exception.