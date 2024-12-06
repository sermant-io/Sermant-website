# Create Your First Plugin
This article is for guidance on how to develop your first plugin locally.

## Development Environment
- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)
- [Apache Maven 3](https://maven.apache.org/download.cgi)

## Create the Project Based on the Archetype Template

### Build Project

Execute the following Maven commands locally：

```shell
$ mvn archetype:generate -DarchetypeGroupId=io.sermant -DarchetypeArtifactId=sermant-template-archetype -DarchetypeVersion=2.0.0 -DgroupId=io.sermant -Dversion=2.0.0 -Dpackage=io.sermant -DartifactId=first-plugin
```

After executing the above command, press Enter for confirmation when the following log is displayed：

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

If the following success log appears, the project is successfully created using Archetype template：

```shell
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  5.409 s
[INFO] Finished at: 2023-10-19T15:10:05+08:00
[INFO] ------------------------------------------------------------------------
```

### Project Structure

The template project directory generated based on Archetype is as follows：

```shell
.
├── application
├── config
└── template
    ├── config
    ├── template-plugin
    └── template-service
```

`application`：Test application module. This module is used to test whether the plug-ins defined in the template can take effect and can be cleared when the project is formally developed.

`config`：Configuration directory for Sermant.

`template`：template plugin module, plugin are developed here.

`template\template-plugin`：The main module of the template plugin, refering  to [The main module of the plugin](package-structure.md#Plugin-Main-Module).

`template\template-service`：The service module of template plugin, refering to [The service module of plugin](package-structure.md#Plugin-Service-Module).

## Develop Plugin

First find the `io.sermant.template.TemplateDeclarer` class of template project `template\template-plugin`, there we can declare the class we expect to enhance, specify the methods in that class we expect to enhance, and define enhancement logic for it.

### Declares the Class to Be Enhanced

The `getClassMatcher()` method of `io.sermant.template.TemplateDeclarer` class need to be  implement the following logic to enhance the class：

1. Define [Class matcher](bytecode-enhancement.md#Class-Matcher)`ClassMatcher.nameEquals("io.demo.template.Application")`, the matcher matches `io.demo.template.Application` class by class name.

```java
@Override
public ClassMatcher getClassMatcher() {
    return ClassMatcher.nameEquals("io.demo.template.Application");
}
```

> Note：The above logic is implemented in the template code
>
> `io.demo.template.Application`logic is as follows：
>
> ```java
> public class Application {
>        public static void main(String[] args) {
>            System.out.println("Good afternoon!");
>        }
> }
> ```
>
> We will add System.out.println("Good morning!") and System.out.println("Good night!")` logic before and after this plugin.

### Declare the Methods That Need to Be Enhanced

After you specify the class that you want to enhance, you need to specify the method in that class that you want to enhance and define the enhancement logic for that method, the above steps require the following logic to be added to the `getInterceptDeclarers(ClassLoader classLoader)` method in the `io.sermant.template.TemplateDeclarer` class：

1. Define [Method matcher](bytecode-enhancement.md#Method-Matcher) `MethodMatcher.nameEquals("main")`，the matcher matches the `main` method of `io.demo.template.Application` class by method name.
2. Define an [interceptor](bytecode-enhancement.md#Interceptor) for the 'main' method, add `System.out.println("Good morning!")` to the `before` method , and add `System.out.println("Good morning!")` logic to the `after` method, `before` and `after` method will take effect before and after the `main` method is executed.

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

> Note：The above logic is implemented in the template code

### Add SPI Configuration That Enhances the Declaration

At the end of developing the plugin, don't forget to add the **SPI** configuration that enhances the declaration, add the `META-INF/services` directory to `resources` directory under `template\template-plugin` in your project, and create **SPI** file named `io.sermant.core.plugin.agent.declarer.PluginDeclarer`, then add the class name of the bytecode enhanced declaration class to it：

```shell
io.sermant.template.TemplateDeclarer
```

## Packaged Build

Execute **mvn package** under the generated project root directory , the build product directory is generated under the root directory of the build project：

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

 `Application.jar` is an executable package for testing applications，other directory structures refer to [Product directory description](../user-guide/README.md#Product-Directory)

> Note：The template uses Maven's `maven-dependency-plugin:copy` plug-in to pull the [necessary core components of Sermant](../user-guide/README.md#sermant-agent) from the maven central repository into the local build directory, eliminating the need for developers to care about the dependencies and configurations required to start Sermant.
>
> The use of `maven-dependency-plugin:copy` plugin please refer to Maven official document [maven-dependency-plugin:copy](https://maven.apache.org/plugins/maven-dependency-plugin/examples/copying-artifacts.html)

Execute `cd agent/` in the project root directory , perform the following steps in it：

1. Run the following command to run the test application independently  **java -jar Application.jar**


```shell
$ java -jar Application.jar 
Good afternoon!
```

2. Run the test application with **Sermant** and execute the following command **java -javaagent:sermant-agent.jar -jar Application.jar**


```shell
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
Good morning!
Good afternoon!
Good night!
```

As you can see, the execution logic defined in the plugin has been enhanced into the test application, and now that your first plugin has been developed successfully, let's move on to further development of the Sermant plugin.
