# 动态配置

本文介绍如何使用[动态配置插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-dynamic-config)。

## 功能介绍

Spring Cloud Config动态配置已广泛应用于企业开发项目，为用户更方便使用配置中心，切换配置中心类型更便捷，动态配置插件基于Sermant动态配置中心的能力实现应用配置的动态更新。该插件可屏蔽应用原配置中心，应用在挂载Sermant运行时，通过动态配置中心对宿主应用的配置进行刷新。

## 参数配置

### Sermant-agent配置

动态配置插件依赖动态配置中心，需要在Sermant-agent中配置动态配置中心的地址（`dynamic.config.serverAddress`），动态配置中心的类型（`dynamic.config.dynamicConfigType`）,具体参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

### 插件配置

动态配置插件需打开是否开启适配CSE（`dynamic.config.plugin.enableCseAdapter`），是否开启动态配置插件（`dynamic.config.plugin.enableDynamicConfig`）等开关，可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/dynamic-config/config/config.yaml`找到插件的配置文件，配置如下所示：

```yaml
dynamic.config.plugin:
  enableCseAdapter: false # 是否开启适配CSE
  enableDynamicConfig: true # 是否开启动态配置插件
  enableOriginConfigCenter: false # 是否开启原配置中心, 默认关闭
```

| 参数键                     | 说明                                                         | 默认值         | 是否必须 |
| ------------------------- | ------------------------------------------------------------ | -------------- | ------- |
| enableCseAdapter          | 是否开启适配CSE; <br> **true**:根据应用配置,服务配置,自定义标签配置进行配置订阅；<br> **false**:根据服务名进行订阅；[见详细治理规则说明](./dynamic-config.md#详细治理规则) | true | 是  |
| enableDynamicConfig       | 是否开启动态配置插件              | false | 否  |
| enableOriginConfigCenter | 是否开启原配置中心; <br> **false**:屏蔽原配置中心，只能通过Sermant下发配置; <br> **true**:不屏蔽原配置中心，可通过原配置中心下发配置，**注意**：若不屏蔽应用原配置中心可能会影响动态配置中心下发配置| false | 否  |

## 详细治理规则

动态配置插件基于框架提供的动态配置能力进行配置发布，配置发布可以参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)

动态配置主要基于`group`进行匹配配置订阅，该标签组由多个键值对组成，根据适配开关配置`enableCseAdapter`的不同，`group`的值将会有所区别，如下：

- 若关闭适配，即`enableCseAdapter: false`

    此时插件将根据宿主应用的服务名进行订阅, 即应用配置的`spring.applicaton.name`, 插件订阅配置的group为`service=${spring.applicaton.name}`
    
- 若开启适配, 即`enableCseAdapter: true`

    此时插件将根据**应用配置**，**服务配置**以及**自定义配置**三项数据进行配置**同时**订阅， 而这三类配置可参考`${path}/sermant-agent-x.x.x/agent/config/config.properties`, 相关配置如下：

    ```properties
    # 服务app名称
    service.meta.application=default
    # 服务版本
    service.meta.version=1.0.0
    # serviceComb 命名空间
    service.meta.project=default
    # 环境
    service.meta.environment=development
    # 自定义标签，按需配置，用于后续的配置订阅
    service.meta.customLabel=public
    service.meta.customLabelValue=default
    ```

    应用配置，服务配置，自定义配置说明参考[CSE配置中心概述](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html)
    - 应用配置：由`service.meta.application`与`service.meta.environment`组成， 对应的`group`为`app=default&environment=development`
    - 服务配置：由`service.meta.application`、`service.meta.environment`以及服务名组成，此处服务即`spring.application.name`, 对应的`group`为`app=default&environment=development&service=DynamicConfigDemo`
    - 自定义配置：由`service.meta.customLabel`与`service.meta.customLabelValue`组成， 对应的`group`为`public=default`

以上为`group`的配置介绍，下面说明`content`配置，当前动态配置仅支持yaml格式, 例如配置如下内容:

```yaml
server:
  port: 8004
sermant: sermant
spring:
  application:
    name: DynamicConfigDemo
  cloud:
    zookeeper:
      enabled: true
```

## 支持版本和限制

### 支持版本

| 框架类型                     | 版本                                                         |
| ------------------------- | ------------------------------------------------------------ |
| SpringBoot | 1.5.x - 2.6.2 |
| spring-cloud-starter-alibaba-nacos-config | 1.5.0.RELEASE+ |
| spring-cloud-starter-zookeeper-config | 1.2.0.RELEASE+ |

### 限制
1. 屏蔽应用原配置中心（目前仅支持**zookeeper**，**nacos**）
2. 需配合注解`@Value, @ConfigurationProperties以及@RefreshScope`使用，以下示范`@Value`注解使用，`@ConfigurationProperties`注解同理

```java
/**
 * @Value配置示范
 * 需配合注解@RefreshScope
 */
@Component
@RefreshScope
public class ValueConfig {
    @Value("${sermant}")
    private Object sermant;

    @Value("${server.port}")
    private int port;

    @Override
    public String toString() {
        return "ValueConfig{" +
            "sermant=" + sermant +
            ", port=" + port + '\'' +
            '}';
    }

    public Object getSermant() {
        return sermant;
    }
}
```

## 操作和结果验证

下面将演示如何使用动态配置插件，验证使用Sermant动态配置中心（zookeeper）更新spring boot应用配置的场景。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/flowcontrol-demo/spring-cloud-demo/spring-provider) demo源码
- [下载](https://github.com/huaweicloud/Sermant/releases) 或编译Sermant包
- [下载](https://zookeeper.apache.org/releases#download) 并启动zookeeper

### 步骤一：编译打包demo应用

在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider`目录执行以下命令：

```shell
# windows,Linux,mac
mvn clean package
```

打包成功后，在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target`得到`spring-provider.jar`

> **说明**： ${path}为demo应用下载所在路径。

### 步骤二：修改插件配置

参考[插件配置](#插件配置) 修改`${path}/sermant-agent-x.x.x/agent/pluginPackage/dynamic-config/config/config.yaml`文件为以下内容：
```shell
dynamic.config.plugin:
  enableCseAdapter: false # 是否开启适配CSE
  enableDynamicConfig: true # 是否开启动态配置插件
  enableOriginConfigCenter: false # 是否开启原配置中心, 默认关闭
```

> **说明**：${path}为sermant所在路径。

### 步骤三：启动demo应用

参考如下命令启动demo应用

```shell
# windwos
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar

#linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar
```

> **说明：** ${path}为sermant实际安装路径，x.x.x代表sermant某个版本号。

### 步骤四：查看原配置

浏览器或curl工具访问`localhost:8003/flow`,查看控制台日志是否打印`sermant`日志


**demo应用配置**如下：

```yaml
# demo 应用配置
server:
  port: 8003
sermant: sermant
spring:
  application:
    name: spring-flow-provider
  cloud:
    zookeeper:
      enabled: true
```

**demo应用/flow接口**代码如下：

```java
// demo应用源码
@Controller
@ResponseBody
@RefreshScope
public class FlowController {
  @Value("${sermant}")
  private Object sermant;

  @RequestMapping(value = "/flow", method = RequestMethod.GET)
  public String flow(@RequestParam(required = false) Integer exRate, HttpServletRequest request) {
    LOGGER.info((String) sermant);
    return "Hello, I am zk rest template provider, my port is " + port;
  }
}
```

当调用**flow接口**时，demo应用执行`LOGGER.info((String) sermant);`语句，在控制台打印`sermant`变量的值`sermant`，如下图所示：

<MyImage src="/docs-img/dynamic-config-old-config.jpg"/>

### 步骤五：修改应用配置

参考使用[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置) 进行配置发布

以zookeeper为例，利用zookeeper提供的命令行工具来来发布动态配置：

1. 在`${path}/bin/`目录执行以下命令创建节点`/service=spring-flow-provider`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider

# windows
zkCli.cmd -server localhost:2181 create /service=spring-flow-provider
```

2. 在`${path}/bin/`目录执行以下命令创建创建节点`/service=spring-flow-provider/config`和数据`sermant: sermant1`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /service=spring-flow-provider/config "sermant: sermant1"

# windows
zkCli.cmd -server localhost:2181 create /service=spring-flow-provider/config "sermant: sermant1"
```

> 说明：${path}为zookeeper的安装目录。

### 验证

再次通过浏览器或curl工具访问`localhost:8003/flow`，查看控制台是否有输出`sermant1`日志。

<MyImage src="/docs-img/dynamic-config-verify.jpg"/>
