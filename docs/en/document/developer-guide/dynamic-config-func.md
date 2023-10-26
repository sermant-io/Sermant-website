# Dynamic Configuration Function

This article describes how to use the dynamic configuration capabilities provided by Sermant in your development.

## Function Introduction

**Dynamic Configuration function** allows Sermant to perform configuration management and monitoring operations on the configuration issued by the dynamic configuration Center to achieve rich and diverse service governance capabilities.

> Note：How to deploy and use the dynamic Configuration Center can be found in [Sermant Dynamic Configuration Center User Manual](../user-guide/configuration-center.md).

## Development Examples

This development example is based on the project created in the [Create the First Plugin](README.md) document to demonstrate the development process with the acquisition of a dynamic configuration：

1. Add new variable `dynamicConfigService` in `com.huaweicloud.sermant.template.TemplateDeclarer` class of `template\template-plugin`, the new variable in the class gets the dynamic configuration service provided by the Sermant framework, which is used to create dynamically configured listeners and obtain configurations:

   ```java
   DynamicConfigService dynamicConfigService = ServiceManager.getService(DynamicConfigService.class);
   ```

2. After obtaining the service instance, we can call the API provided by `DynamicConfigService` to take action accordingly. For this example, we will use direct access to dynamic config as an example, which can be achieved with the following code:

   ```java
   @Override
   public ExecuteContext before(ExecuteContext context) throws Exception {
     System.out.println("Good morning!");
     // test_group is user group，test_key is the key to listen to, for zookeeper，configure the obtaining path equivalent to: /test_group/test_key
     System.out.println(dynamicConfigService.getConfig("test_key", "test_group"));
     return context;
   }
   ```

   Once you're done, follow the [build package](README.md#Packaged-Build) process you used when creating your first plugin and run **mvn package** in your project root to generate the build.

4. Take the Zookeeper deployment as an example of the dynamic configuration center, please refer to the [Sermant dynamic configuration Center manual](../user-guide/configuration-center.md) for relevant parameter configuration.  Issue the example configuration in Zookeeper's `/test_group/test_key` node:

   ```shell
   create /test_group/test_key "This is a dynamic config!"
   ```
5. Start the Zookeeper server and set the `dynamic.config` related configuration in `agent/config/config.properties`, and set the dynamic configuration switch `agent.service.dynamic.config.enable` to `true`. The main configuration examples are as follows:
   ```properties
   # Dynamically configure service switches
   agent.service.dynamic.config.enable=true
   # The server address for the configuration center
   dynamic.config.serverAddress=127.0.0.1:2181
   # The type for the configuration center, The range of values is NOP(No implementation)、ZOOKEEPER、KIE、NACOS
   dynamic.config.dynamicConfigType=ZOOKEEPER
   ```
6. When the execution is complete, execute `cd agent/` in the root directory of the project and run the test 
Application with **Sermant** in it, executing the command **java-javaagent: sermant-agent.jar-jar application.jar**

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

As you can see, the configuration issued in the dynamic configuration center can be obtained by the `getConfig` function and output to the console in step 2.

Examples of other interfaces are not listed here. You can refer to the following API descriptions.

## API&Configuration

### API

The **Dynamic Configuration functionality** service functionality `API` is provided by the [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java) abstract class, which implements three interfaces, as found in the [API](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/api) directory.

#### Get the dynamic configuration service

- Get the dynamic configuration service, which is used to implement the creation of dynamic configuration listeners, configuration acquisition, etc

```java
DynamicConfigService dynamicConfigService = ServiceManager.getService(DynamicConfigService.class);
```

There are three concepts that need to be clarified for the API we'll cover next：

- `key`，Only a dynamically configured key
- `group`，A set of dynamically configured groupings, often used to distinguish users
- `content`，It refers to the specific content of dynamic configuration

> Note：In the following API example parameters, `key` is uniformly configured as ` test_key`,  `group` as ` test_group`, and `content` as` test_content`.
>

#### Operations related to a configuration key

- Gets the configuration value of a key in the dynamic configuration center

    ```java
    dynamicConfigService.getConfig("test_key")
    ```

- Set the configuration value of a key in the dynamic configuration center

  ```java
  dynamicConfigService.publishConfig("test_key", "test_content")
  ```

- Remove the configuration value of a key in the dynamic configuration center

  ```java
  dynamicConfigService.removeConfig("test_key")
  ```

- Obtain all configuration values in the dynamic configuration center

  ```java
  dynamicConfigService.listKeys();
  ```

- Add a listener for a key in the dynamic configuration center. The listener `process` function performs custom actions after listening for an event

  ```java
  dynamicConfigService.addConfigListener("test_key", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  });
  ```

- Add a listener for a key in the dynamic configuration center. According to the third parameter `ifNotify`, determine whether to trigger the initialization event after adding the listener. The listener `process` function can perform custom operations on the initialization event and other subsequent events after listening

  ```java
  dynamicConfigService.addConfigListener("test_key", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  }, true);
  ```

- Removes a listener for a key in the dynamic configuration center

  ```java
  dynamicConfigService.removeConfigListener("test_key");
  ```

#### This section describes how to perform operations on all configuration keys in a group

- Gets all keys in a group in the dynamic configuration center

  ```java
  dynamicConfigService.listKeysFromGroup("test_group")
  ```

- Add a listener for all keys under a group in the dynamic configuration Center. The listener `process` function performs custom actions after listening for an event

  ```java
  dynamicConfigService.addGroupListener("test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  });
  ```

- Add listeners for all keys in a group in the dynamic configuration center. According to the third parameter `ifNotify`, determine whether to trigger the initialization event after adding the listener. The listener `process` function can perform custom operations on the initialization event and other subsequent events after listening

  ```java
  dynamicConfigService.addGroupListener("test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  }, true);
  ```

- Removes listeners for all keys in a group in the dynamic configuration center

  ```java
  dynamicConfigService.removeConfigListener("test_group");
  ```

#### Operations related to a configuration key in a group

- Gets the configuration value of a key in a group in the dynamic configuration center

  ```java
  dynamicConfigService.getConfig("test_key", "test_group")
  ```

- Set the configuration value of a key in a group in the dynamic configuration center

  ```java
  dynamicConfigService.publishConfig("test_key", "test_group", "test_content")
  ```

- Remove the configuration value of a key in a group in the dynamic configuration center

  ```java
  dynamicConfigService.removeConfig("test_key", "test_group")
  ```

- Add a listener for a key under a group in the dynamic configuration Center, and the listener `process` function can perform a custom action after listening for an event

  ```java
  dynamicConfigService.addConfigListener("test_key", "test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  });
  ```

- Add a listener for a key under a group in the dynamic configuration center. According to the third parameter `ifNotify`, determine whether to trigger the initialization event after adding the listener. The `process` function of the listener can perform custom operations on the initialization event and other subsequent events after listening

  ```java
  dynamicConfigService.addConfigListener("test_key", "test_group", new DynamicConfigListener() {
    @Override
    public void process(DynamicConfigEvent dynamicConfigEvent) {
      // do something
    }
  }, true);
  ```

- Remove a listener for a key in a group in the dynamic configuration center

  ```java
  dynamicConfigService.removeConfigListener("test_key", "test_group");
  ```

#### Illustrate

The above `API` is mainly divided into the operation of adding, selecting, changing and deleting data, and the operation of adding and deleting Listener [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java). The event callback of the latter is a crucial part of the function of the **dynamic configuration service**, and is also the main function of the plugin using **dynamic configuration service**.

Also, it's important to note that all `APIs` for **certain configuration keys** are` APIs` without `Group`. They all use the default `Group` in [DynamicConfigService](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/DynamicConfigService.java). The default ` Group ` can be changed by sermant-agent **configuration file** , which is `dynamic.config.default` of` /config/config.properties ` . Parameters can be described in [Sermant-agent User manual](../user-guide/sermant-agent.md#Parameters-Related-to-Dynamic-Configuration-Center).

Finally, in addition to the above service interfaces, there are a few other interfaces, configurations, or entities that developers need to focus on:

- [DynamicConfigListener](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigListener.java), the interface methods are as follows：

  | Method                                                       | Parse                                                       |
  | :----------------------------------------------------------- | :---------------------------------------------------------- |
  | void process([DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java)) | Callback interface for handling configuration change events |

- [DynamicConfigEvent](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEvent.java), its member properties are as follows：

  | Type                                                         | Property  | Parse          |
  | :----------------------------------------------------------- | :-------- | :------------- |
  | String                                                       | key       | Config Key     |
  | String                                                       | group     | Config group   |
  | String                                                       | content   | Config content |
  | [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java) | eventType | Event type     |

- [DynamicConfigEventType](https://github.com/huaweicloud/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/com/huaweicloud/sermant/core/service/dynamicconfig/common/DynamicConfigEventType.java)，including the following four：

  | Enums  | Parse                                         |
  | :----- | :-------------------------------------------- |
  | INIT   | Initialization event when a listener is added |
  | CREATE | Added a configured event                      |
  | MODIFY | Event of modifying the configuration content  |
  | DELETE | Delete the configured event                   |

### Configuration

The configuration of dynamic configuration function can be refered to the [Sermant Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#Parameter-Configuration) related chapters about parameter configuration.

