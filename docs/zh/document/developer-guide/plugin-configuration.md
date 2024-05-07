# 插件配置
本文档主要介绍如何在插件中定义配置项，并在插件中使用该配置项，本文仅针对静态配置，如需使用动态配置项，可参考[动态配置](dynamic-config-func.md)。

## 功能介绍
插件配置可以让插件开发者通过配置文件来指定一些插件部署时可变的量，提高插件开发的灵活性，可在不同部署环境下对这些可变量配置不同的值来适配不同的环境。

> **注意**：
> 如果在服务运行过程中修改配置文件，需要重启服务之后才能获取修改后的配置内容。

## 开发示例
本开发示例基于[创建首个插件](../developer-guide/README.md)文档中创建的工程。

在`template\config`目录下的`config.yaml`文件中添加以下内容：

```yaml
template.config:
  enable-dynamic-config: false
  host: 127.0.0.1
```

在工程`template\template-plugin`模块下定义一个插件配置类，其需要继承[PluginConfig](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/config/PluginConfig.java)插件配置接口，并通过[ConfigTypeKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigTypeKey.java)修饰类，指定该配置类可读取配置项的前缀，通过[ConfigFieldKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigFieldKey.java)修饰类中的变量（如果不修饰，则读取名称和该变量名相同的配置项），指定该变量对应的配置项的名称。

```java
@ConfigTypeKey(value = "template.config")
public class TemplateConfig implements PluginConfig {
    @ConfigFieldKey("enable-dynamic-config")
    private boolean enableDynamicConfig;

    private String host;

    public boolean isEnableDynamicConfig() {
        return enableDynamicConfig;
    }

    public void setEnableDynamicConfig(boolean enableDynamicConfig) {
        this.enableDynamicConfig = enableDynamicConfig;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }
}
```

在针对`main`方法的拦截器的`before`方法中通过[io.sermant.core.plugin.config.PluginConfigManager](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/config/PluginConfigManager.java)获取配置实例，并输出配置内容。

```java
@Override
public ExecuteContext before(ExecuteContext context) throws Exception {
        TemplateConfig templateConfig = PluginConfigManager.getPluginConfig(TemplateConfig.class);
        System.out.println(templateConfig.isEnableDynamicConfig());
        System.out.println(templateConfig.getHost());
        System.out.println("Good morning!");
        return context;
}
```

最后不要忘记添加插件配置的**SPI**配置文件：

- 在工程`template\template-plugin`模块下的`src\main\resources\META-INF\services`目录中添加`io.sermant.core.plugin.config.PluginConfig`配置文件。
- 在`io.sermant.core.plugin.config.PluginConfig`文件中键入`com.huaweicloud.sermant.template.TemplateConfig`。

开发完成后，可参照创建首个插件时的打包构建流程，在工程根目录下执行 `mvn package`，执行完成后在根目录执行 `cd agent/`，并在其中携带Sermant运行测试应用，执行如下命令 `java -javaagent:sermant-agent.jar -jar Application.jar`。控制台输出如下所示：

```log            
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
false
127.0.0.1
Good morning!
Good afternoon!
Good night!
```
可以看出我们在插件中，已经获取到我们在配置文件中的配置信息。

## API&配置

### API

#### 获取配置实例
获取配置实例，用于在插件使用过程中获取在*yaml*文件中配置的内容。配置实例会在框架进行初始化的时候创建，插件可直接获取使用。

  ```java
  // ${plugin config class}为插件配置的Class
  PluginConfigManager.getPluginConfig(${plugin config class});
  ```
### 配置
插件配置现在支持的数据类型包括：

- 布尔、数值类的基础类型及包装类型
```yaml
template.config:
  enable-dynamic-config: false
  num: 11
  rate: 11.11
```
- 字符串类型
```yaml
template.config:
  host: 127.0.0.1
```
- 枚举类型
```yaml
template.config:
  status: UP
```
- 复杂对象类型
```yaml
template.config:
  teacher:
    name: 王老师
    age: 48
  student:
    name: 小李
    age: 12
```
- 上述类型构成的数组
```yaml
template.config:
  arrayValue:
    - January
    - February
```
- 前四种类型构成的*List*
```yaml
template.config:
  listValue:
    - NewYork
    - 12
    - 127.0.0.1
```
- 前四种类型构成的*Map*
```yaml
template.config:
  mapValue:
    name: 小李
    age: 12
```

> **注意**：
> - 配置生效的优先级为：启动参数 > 环境变量 > 系统变量(-D参数) > *yaml*文件配置。
> - 配置类的字段名一般为小驼峰命名，可用[ConfigFieldKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigFieldKey.java)注解修饰为中划线风格定义别名。需注意：
>   - 添加注解后，在*yaml*中使用中划线或小驼峰皆可解析。
>   - 对于数组、List和Map中涉及的复杂对象，不支持[ConfigFieldKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigFieldKey.java)修正属性名。
> - **插件配置类**的字符串属性和复杂类型属性内部的字符串属性支持通过`${}`获取在启动参数、环境变量或者系统变量(-D参数)中设置的属性值。数组、List和Map中的字符串不支持通过`${}`获取属性值。
> - 若插件配置类的属性未在*yaml*配置文件中定义，将按照配置生效的优先级来获取属性值。获取属性值时，需注意：
>   - 只支持基本数据类型、数组、map、list、set，不支持复杂对象。
>   - 数组、list、set需配置为`yaml`字符串格式，例如：LIST_NAME=[elem1,elem2]。
>   - map需配置为`yaml`字符串格式，例如：MAP_NAME={key1: value1, key2: value2}。
