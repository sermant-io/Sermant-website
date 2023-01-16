# 插件配置
本文档主要介绍如何在插件中定义配置项，并在插件中使用该配置项，本文仅针对静态配置，如需使用动态配置项，可参考[动态配置](dynamic-config-func.md)

## 定义配置项
在插件的`config`目录下创建一个config.yaml文件：
```yaml
demo.config:
  demo-config-A: false
  demoConfigB: 127.0.0.1
```
再为插件定义一个插件配置类，其需要继承[PluginConfig](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/plugin/config/PluginConfig.java)插件配置接口，并通过[ConfigTypeKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigTypeKey.java)修饰类，指定该配置类可读取配置项的前缀，通过[ConfigFieldKey](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/config/common/ConfigFieldKey.java)修饰类中的变量（如果不修饰，则读读取名称和该变量名相同的配置项），指定该变量对应的配置项的名称。
```java
@ConfigTypeKey(value = "demo.config")
public class DemoConfig implements PluginConfig {
    @ConfigFieldKey("demo-config-A")
    private boolean demoConfigA;

    private String demoConfigB;
}
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

最后，不要忘记添加插件配置的*SPI*配置文件：

- 在资源目录`resources`下添加`META-INF/services`文件夹。
- 在`META-INF/services`中添加`com.huaweicloud.sermant.core.plugin.config.PluginConfig`配置文件。
- 在上述文件中，以换行为分隔，键入插件包中所有的插件配置`PluginConfig`实现。

## 使用配置项
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