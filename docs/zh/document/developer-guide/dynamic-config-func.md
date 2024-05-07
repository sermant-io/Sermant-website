# 动态配置功能

本文介绍如何在开发中使用Sermant提供的动态配置功能。

## 功能介绍

**动态配置功能**允许Sermant对动态配置中心下发的配置进行配置管理和监听等操作，以实现丰富多样的服务治理能力。

> 说明：如何部署动态配置中心以及使用动态配置功能可参考[Sermant动态配置中心使用手册](../user-guide/configuration-center.md)。 

## 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程，以动态配置的获取来演示开发过程：

1. 在工程中`template\template-plugin`下的`com.huaweicloud.sermant.template.TemplateDeclarer` 类中新增变量`dynamicConfigService`获取Sermant框架提供的动态配置服务，用于实现动态配置的监听器的创建、配置的获取等：

   ```java
   DynamicConfigService dynamicConfigService = ServiceManager.getService(DynamicConfigService.class);
   ```

2. 获取服务实例之后，可以调用`DynamicConfigService`提供的API进行相应的动作。本示例以动态配置的直接获取为例，可通过如下代码来实现：

   ```java
   @Override
   public ExecuteContext before(ExecuteContext context) throws Exception {
     System.out.println("Good morning!");
     // test_group为用户分组，test_key为监听的键，对zookeeper来说，配置获取的路径相当于: /test_group/test_key
     System.out.println(dynamicConfigService.getConfig("test_key", "test_group"));
     return context;
   }
   ```

   开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**后生成构建产物。

4. 以Zookeeper部署为动态配置中心为例，相关参数配置请参考[Sermant动态配置中心使用手册](../user-guide/configuration-center.md)。在Zookeeper的`/test_group/test_key`节点中下发示例配置:

   ```shell
   create /test_group/test_key "This is a dynamic config!"
   ```
5. 开启Zookeeper服务并且在`agent/config/config.properties`中设置`dynamic.config`相关配置，并且将动态配置开关`agent.service.dynamic.config.enable`设置为`true`，主要配置示例如下：
   ```properties
   # 动态配置服务开关
   agent.service.dynamic.config.enable=true
   # 指定配置中心的服务端地址
   dynamic.config.serverAddress=127.0.0.1:2181
   # 指定动态配置中心类型, 取值范围为NOP(无实现)、ZOOKEEPER、KIE、NACOS
   dynamic.config.dynamicConfigType=ZOOKEEPER
   ```

6. 执行完成后在项目的根目录执行 `cd agent/`，并在其中携带**Sermant**运行测试应用，执行如下命令 **java -javaagent:sermant-agent.jar -jar Application.jar**

   ```shell
   $ java -javaagent:sermant-agent.jar -jar Application.jar
   [xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
   [xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
   [xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
   [xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
   [xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
   Good morning!
   This is a dynamic config!
   Good afternoon!
   Good night!
   ```

可以看到在动态配置中心下发的配置可以通过`getConfig`函数获取得到，并在步骤2中输出到控制台。

其他接口的使用示例此处不一一列出，可参考下文的API描述。

## API&配置

### API

**动态配置功能**的服务功能`API`由[DynamicConfigService](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/DynamicConfigService.java)抽象类提供，其实现三个接口，见于[API](https://github.com/sermant-io/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/api)目录中。

#### 获取动态配置服务

- 获取动态配置服务，用于实现动态配置的监听器的创建、配置的获取等

```java
DynamicConfigService dynamicConfigService = ServiceManager.getService(DynamicConfigService.class);
```

下面介绍的API接口需要明确三个概念：

- `key`，单指某个动态配置的键
- `group`，指一系列动态配置的分组，通常用于区分使用者
- `content`，指动态配置的具体内容

> 说明：下列API示例中的参数中统一将`key` 配置为`test_key`，`group`配置为`test_group`， `content`配置为`test_content`。
>

#### 对某个配置键的相关操作

- 获取动态配置中心某个键的配置值

    ```java
    dynamicConfigService.getConfig("test_key")
    ```

- 设置动态配置中心某个键的配置值

  ```java
  dynamicConfigService.publishConfig("test_key", "test_content")
  ```

- 移除动态配置中心某个键的配置值

  ```java
  dynamicConfigService.removeConfig("test_key")
  ```

- 获取动态配置中心所有配置值

  ```java
  dynamicConfigService.listKeys();
  ```

- 为动态配置中心某个键添加监听器，监听器`process`函数可在监听到事件后执行自定义操作

  ```java
  dynamicConfigService.addConfigListener("test_key", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  });
  ```

- 为动态配置中心某个键添加监听器，根据第三个入参`ifNotify`决定是否触发添加监听器后的初始化事件，监听器`process`函数可在监听后对初始化事件和后续其他事件执行自定义操作

  ```java
  dynamicConfigService.addConfigListener("test_key", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  }, true);
  ```

- 移除动态配置中心某个键的监听器

  ```java
  dynamicConfigService.removeConfigListener("test_key");
  ```

#### 对某个分组下的所有配置键的相关操作

- 获取动态配置中心某个组中所有键

  ```java
  dynamicConfigService.listKeysFromGroup("test_group")
  ```

- 为动态配置中心某个组下的所有键添加监听器，监听器`process`函数可在监听到事件后执行自定义操作

  ```java
  dynamicConfigService.addGroupListener("test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  });
  ```

- 为动态配置中心某个组下的所有键添加监听器，根据第三个入参`ifNotify`决定是否触发添加监听器后的初始化事件，监听器`process`函数可在监听后对初始化事件和后续其他事件执行自定义操作

  ```java
  dynamicConfigService.addGroupListener("test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  }, true);
  ```

- 移除动态配置中心某个组下所有键的监听器

  ```java
  dynamicConfigService.removeConfigListener("test_group");
  ```

#### 对某个分组下的某个配置键的相关操作

- 获取动态配置中心某个分组下的某个键的配置值

  ```java
  dynamicConfigService.getConfig("test_key", "test_group")
  ```

- 设置动态配置中心某个分组下的某个键的配置值

  ```java
  dynamicConfigService.publishConfig("test_key", "test_group", "test_content")
  ```

- 移除动态配置中心某个分组下的某个键的配置值

  ```java
  dynamicConfigService.removeConfig("test_key", "test_group")
  ```

- 为动态配置中心某个分组下的某个键添加监听器，监听器`process`函数可在监听到事件后执行自定义操作

  ```java
  dynamicConfigService.addConfigListener("test_key", "test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  });
  ```

- 为动态配置中心某个分组下的某个键添加监听器，根据第三个入参`ifNotify`决定是否触发添加监听器后的初始化事件，监听器`process`函数可在监听后对初始化事件和后续其他事件执行自定义操作

  ```java
  dynamicConfigService.addConfigListener("test_key", "test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  }, true);
  ```

- 移除动态配置中心某个分组下的某个键的监听器

  ```java
  dynamicConfigService.removeConfigListener("test_key", "test_group");
  ```

#### 说明

以上的`API`主要分为数据的增删查改操作，以及监听器的[DynamicConfigListener](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)增删操作，其中后者的事件回调是**动态配置服务**得以实现功能中至关重要的一环，也是插件中使用**动态配置服务**的主要功能。

另外，对**某个配置键的相关操作**的所有`API`都是不带`Group`的`API`，它们在[DynamicConfigService](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/DynamicConfigService.java)中其实都会使用默认`Group`，这点需要注意。默认`Group`可以通过sermant-agent的**配置文件**`/config/config.properties`的`dynamic.config.defaultGroup`修改，参数说明可参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#动态配置中心相关参数)。

最后，除了以上的服务接口以外，开发者还需要关注一些其他接口、配置或实体：

- 动态配置监听器[DynamicConfigListener](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java)，其中包含的接口方法如下：

  | 方法                                                         | 解析                       |
  | :----------------------------------------------------------- | :------------------------- |
  | void process([DynamicConfigEvent](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)) | 处理配置改变事件的回调接口 |

- 动态配置改变事件[DynamicConfigEvent](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)，其成员属性如下：

  | 类型                                                         | 属性      | 解析     |
  | :----------------------------------------------------------- | :-------- | :------- |
  | String                                                       | key       | 配置键   |
  | String                                                       | group     | 配置分组 |
  | String                                                       | content   | 配置信息 |
  | [DynamicConfigEventType](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java) | eventType | 事件类型 |

- 动态配置改变事件类型[DynamicConfigEventType](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)，含以下四种：

  | 枚举值 | 解析                     |
  | :----- | :----------------------- |
  | INIT   | 添加监听器时的初始化事件 |
  | CREATE | 新增配置的事件           |
  | MODIFY | 修改配置内容的事件       |
  | DELETE | 删除配置的事件           |

### 配置

动态配置功能相关的配置可参考[Sermant动态配置中心使用手册](../user-guide/configuration-center.md#参数配置)参数配置相关章节。
