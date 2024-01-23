# Sermant 框架常见问题

本文档主要说明在使用Sermant框架时遇到的常见问题。

## 启动参数appName是什么参数?

- `appName`表示宿主应用的名称，多个实例`appName`可以相同，`实例id`不同。

## Sermant提供哪些方面的服务治理插件?

- Sermant有着很强的扩展性，除了框架本身提供的服务治理插件([限流降级功能介绍](../plugin/flowcontrol.md)，[服务注册功能介绍](../plugin/service-registry.md)等)之外， 开发者可以根据业务需求去开发插件包括(数据收集，链路等)。

## 如何同时挂载多个Sermant？

- 如果宿主应用需要挂载多个Sermant时请按照以下步骤处理其他的Sermant。

> 注：除非必要，否则不建议挂载多个Sermant

### 步骤一：使用shade插件重定向类路径

- 修改sermant-agentcore-core、sermant-agentcore-implement、sermant-agentcore-premain、sermant-common的pom.xml文件。在打包时使用Shade插件进行类重定向。具体修改见下图（路径重定向后的前缀请根据您的项目进行指定）。

<MyImage src="/docs-img/package.png"/>

### 步骤二：修改Premain-Class路径

- 在sermant-agentcore-premain的pom.xml文件中修改AgentPremain路径。（路径前缀请跟第一步保持一致，防止找不到AgentPremain类）


<MyImage src="/docs-img/premain-classpath.png"/>

### 步骤三：修改Logger实例。

- 修改AgentPremain类中获取日志Logger实例的方法参数，防止不同Sermant使用同一个Logger实例

<MyImage src="/docs-img/sermant-log.png"/>

- 按照以上步骤修改之后，多个Sermant启动将不会产生冲突。

> 注：  
> 1、不要用-D参数去修改Sermant的配置信息，否则会同时修改所有Sermant。  
> 2、使用动态配置时，保证不同Sermant的group信息不一致，或者使用不一样的配置中心。否则所有Sermant会公用同一个动态配置。  
> 3、如果不同Sermant加载同样的插件时，请按照步骤一的方式将插件的类路径进行重定向，防止冲突。

## Sermant不支持对哪些原生类的增强
对Sermant增强过程中使用的个别原生类方法进行增强可能会出现类循环依赖错误，目前已知不支持增强的原生类和方法如下所示：

|类全限定名|类方法名|
| --- | --- |
|java.net.URL|构造方法|
|java.lang.ClassLoader|loadClass|