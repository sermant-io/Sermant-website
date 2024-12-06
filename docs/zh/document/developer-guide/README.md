# 创建首个插件
本文用于指导如何在本地开发你的第一个插件。

## 开发环境
- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)
- [Apache Maven 3](https://maven.apache.org/download.cgi)

## 基于Archetype模版创建项目

### 生成项目

本地执行如下Maven指令：

```shell
$ mvn archetype:generate -DarchetypeGroupId=io.sermant -DarchetypeArtifactId=sermant-template-archetype -DarchetypeVersion=2.0.0 -DgroupId=io.sermant -Dversion=2.0.0 -Dpackage=io.sermant -DartifactId=first-plugin
```

执行上述指令后，出现下述日志后回车进行确认：

```shell
[INFO] Using property: groupId = io.sermant
[INFO] Using property: artifactId = first-plugin
[INFO] Using property: version = 2.0.0
[INFO] Using property: package = io.sermant
Confirm properties configuration:
groupId: io.sermant
artifactId: first-plugin
version: 2.0.0
package: io.sermant
 Y: :
```

出现下述成功提示日志，则通过Archetype模版创建项目成功：

```shell
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  5.409 s
[INFO] Finished at: 2023-10-19T15:10:05+08:00
[INFO] ------------------------------------------------------------------------
```

### 工程结构

基于Archetype生成的模板工程目录如下：

```shell
.
├── application
├── config
└── template
    ├── config
    ├── template-plugin
    └── template-service
```

`application`：为测试应用模块，该模块用于测试模板中已定义的插件是否能够生效，正式进行项目开发时可清理。

`config`：为Sermant的配置目录。

`template`：template插件模块，此处进行插件能力的开发。

`template\template-plugin`：template插件的主模块，参考[插件主模块](package-structure.md#插件主模块)。

`template\template-service`：template插件的服务模块，参考[插件服务模块](package-structure.md#插件服务模块)。

## 开发插件

首先找到模板工程`template\template-plugin`下的`io.sermant.template.TemplateDeclarer`类，我们可以在其中声明我们期望增强的类，指定该类中我们期望增强的方法，并为其定义增强逻辑。

### 声明需增强的类

指定期望增强的类，需在`io.sermant.template.TemplateDeclarer`中的`getClassMatcher()`方法实现如下逻辑：

1. 定义[类匹配器](bytecode-enhancement.md#类匹配器)`ClassMatcher.nameEquals("io.demo.template.Application")`，该匹配器通过类名称匹配`io.demo.template.Application`类。

```java
@Override
public ClassMatcher getClassMatcher() {
		return ClassMatcher.nameEquals("io.demo.template.Application");
}
```

> 注：上述逻辑已在模版代码中实现
>
> `io.demo.template.Application`逻辑如下：
>
> ```java
> public class Application {
>     public static void main(String[] args) {
>         System.out.println("Good afternoon!");
>         SimulateServer.handleRequest(new HashMap<>());
>     }
> }
> ```
>
> 我们将通过该插件在其前后增加`System.out.println("Good morning!")`和`System.out.println("Good night!")`逻辑。

### 声明需增强的方法

指定需要增强的类后，需要指定该类中你期望增强的方法，并为该方法定义增强逻辑，上述步骤需要在`io.sermant.template.TemplateDeclarer`中的`getInterceptDeclarers(ClassLoader classLoader)`方法中添加如下逻辑：

1. 定义一个[方法匹配器](bytecode-enhancement.md#方法匹配器)`MethodMatcher.nameEquals("main")`，该匹配器通过方法名称匹配`io.demo.template.Application`类中的`main`方法。
2. 定义针对`main`方法的[拦截器](bytecode-enhancement.md#拦截器)，并在其`before`方法中补充`System.out.println("Good morning!")`逻辑，`after`方法中补充`System.out.println("Good night!")`逻辑，`before`方法和`after`方法将会在`main`方法执行前后生效。

```java
@Override
public InterceptDeclarer[] getInterceptDeclarers(ClassLoader classLoader) {
    return new InterceptDeclarer[]{
            InterceptDeclarer.build(MethodMatcher.nameEquals("main"), new Interceptor() {
                @Override
                public ExecuteContext before(ExecuteContext context) throws Exception {
                    System.out.println("Good morning!");
                    return context;
                }

                @Override
                public ExecuteContext after(ExecuteContext context) throws Exception {
                    System.out.println("Good night!");
                    return context;
                }

                @Override
                public ExecuteContext onThrow(ExecuteContext context) throws Exception {
                    return context;
                }
            })
    };
}
```

> 注：上述逻辑已在模版代码中实现

### 添加增强声明的SPI配置

开发插件的最后，不要忘记添加增强声明的**SPI**配置，在工程中`template\template-plugin`下的资源目录`resources`中添加`META-INF/services`目录，并在其中创建名为`io.sermant.core.plugin.agent.declarer.PluginDeclarer`的**SPI**文件，并向其中添加字节码增强声明类的类名：

```shell
io.sermant.template.TemplateDeclarer
```

## 打包构建

在生成的项目根目录下执行 **mvn package**，在生成项目的根目录下会生成构建产物目录：

```shell
.
├── agent
│   ├── Application.jar
│   ├── common
│   ├── config
│   ├── core
│   ├── god
│   ├── implement
│   ├── pluginPackage
│   │   └── template
│   └── sermant-agent.jar
```

 `Application.jar `为测试应用的可执行包，其他目录结构参考[产品目录说明](../user-guide/README.md#产品目录说明)

> 注：该模版利用Maven的`maven-dependency-plugin:copy`插件将[Sermant必要核心组件](../user-guide/README.md#sermant-agent)从Maven中心仓拉取到本地构建产物目录中，开发者无需再关心启动Sermant所需的依赖及配置。
>
> `maven-dependency-plugin:copy`插件使用方式可参考Maven官方文档[maven-dependency-plugin:copy](https://maven.apache.org/plugins/maven-dependency-plugin/examples/copying-artifacts.html)

在项目根目录执行 `cd agent/`，在其中执行如下步骤：

1. 独立运行测试应用，执行如下命令 **java -jar Application.jar**


```shell
$ java -jar Application.jar 
Good afternoon!
```

2. 携带**Sermant**运行测试应用，执行如下命令 **java -javaagent:sermant-agent.jar -jar Application.jar**


```shell
$ java -javaagent:sermant-agent.jar -jar Application.jar
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
Good morning!
Good afternoon!
Good night!
```

可以看到，在插件中定义的执行逻辑已被增强到测试应用中，至此你的首个插件就开发成功了，下面开始进行Sermant插件的进阶开发吧。
> 若需要对Sermant Agent进行Debug调试请参考FAQ的[Sermant Agent Debug指南](../faq/development-debug.md)
