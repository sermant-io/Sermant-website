# Plugin Configuration
This document describes how to define a configuration item in the plugin and use the configuration item in the plugin. This article is only for static configuration. If you need to use the dynamic configuration item, see [Dynamic Configuration](dynamic-config-func.md).

## Function Introduction
Plugin configuration allows plugin developers to specify some variable amount of plugin deployment through the configuration file, improve the flexibility of plugin development, and configure different values for these variables in different deployment environments to adapt to different .

> **Note**：
> If you modify the configuration file when the service is running, you need to restart the service to obtain the modified configuration content.

## Development Examples
This development example is based on [Create first plugin](README.md) document to create the project.

Add the following to the `config.yaml` file in the `template\config` directory：

```yaml
template.config:
  enable-dynamic-config: false
  host: 127.0.0.1
```

Define a plugin configuration class under the `template\template-plugin` project. It needs to inherit the [PluginConfig](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/config/PluginConfig.java) plugin configuration interface, and specify the [ConfigTypeKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigTypeKey.java) class to read the prefix of the configuration. Specify the name of the configuration for this variable by decorating the variable in the class with [ConfigFieldKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigFieldKey.java) (or, if not, reading the configuration with the same name as the variable).

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

For ` main ` method of the interceptor ` before ` method through [io.sermant.core.plugin.config.PluginConfigManager](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/config/PluginConfigManager.java) get configuration instance, content and output configuration.

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

Finally, don't forget to add the **SPI** profile of the plugin configuration:

- In engineering `template\template-plugin module ` under `src\main\resources\META-INF\services` directory to add  `io.sermant.core.plugin.config.PluginConfig` configuration file.
- Add `com.huaweicloud.sermant.template.TemplateConfig` to `io.sermant.core.plugin.config.PluginConfig` file.

After the development is completed, you can refer to the packaging construction process when creating the first plugin, execute `mvn package` in the project root directory, and execute `cd agent/` in the root directory after completion, and run the test application with Sermant in it. Execute the command `java-javaagent: sermant-agent.jar-jar Application.jar`. The console output is as follows:

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
You can see that in the plugin, we have already obtained the configuration information that we have in the configuration file.

## API&Configuration

### API

#### Get Configuration Example
Gets a configuration instance to get what was configured in the *yaml* file during plugin usage. The configuration instance is created when the framework is initialized, and the plugin can be used directly.

  ```java
  // ${plugin config class} is the Class configured by the plugin
  PluginConfigManager.getPluginConfig(${plugin config class});
  ```
### Configuration
The data types now supported by the plugin configuration include:

- Basic types and packaging types of Boolean and numerical classes
```yaml
template.config:
  enable-dynamic-config: false
  num: 11
  rate: 11.11
```
- String type
```yaml
template.config:
  host: 127.0.0.1
```
- Enumeration type
```yaml
template.config:
  status: UP
```
- Complex object type
```yaml
template.config:
  teacher:
    name: Mr. Wang
    age: 48
  student:
    name: Xiao Li
    age: 12
```
- An array of the above types
```yaml
template.config:
  arrayValue:
    - January
    - February
```
- The first four types form a *List*
```yaml
template.config:
  listValue:
    - NewYork
    - 12
    - 127.0.0.1
```
- The first four types form a *Map*
```yaml
template.config:
  mapValue:
    name: Xiao Li
    age: 12
```

> **Note**：
>
> - The priority for the configuration to take effect: Startup Parameters > Environment Variables > System Variables (-D parameter) > *yaml* file configuration.
> - The field names of configuration classes are typically small camel cases.You can use the [ConfigFieldKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigFieldKey.java) annotation to define aliases with underscores. Note:
>   - After adding annotation, you can parse using a hyphen or small hump in *yaml*.
>   - [ConfigFieldKey](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/config/common/ConfigFieldKey.java) fixing property names is not supported for complex objects involved in arrays, lists, and maps.
> - String properties inside the **plug-in configuration class** and complex type properties support `${}` to get property values set in startup parameters, environment variables, or system variables (-D arguments). Strings in arrays, lists, and maps do not support obtaining property values by `${}`.
> - If the attributes of the plugin configuration class are not defined in the *yaml* configuration file, the attribute values are obtained based on the priority at which the configuration takes effect. When obtaining attribute values, note:
>   - Only basic data types, arrays, maps, lists, and sets are supported. Complex objects are not supported.
>   - Array, list, set should be configured in `yaml` string format, e.g. LIST_NAME=[elem1, elem2].
>   - Map must be in yaml string format, e.g. MAP_NAME={key1: value1, key2: value2}. 
