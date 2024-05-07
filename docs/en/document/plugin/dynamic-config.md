# Dynamic Configuration

This article describes how to use the [Dynamic Configuration Plugin](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-dynamic-config)

## Functions

This plugin implements dynamic configuration based on the Sermant configuration center capability. During running, the configuration can be updated to the host application. The priority of the plugin is higher than that of the environment variable configuration.

## Parameter configuration

### Sermant-agent Configurations

The dynamic configuration plug-in depends on the dynamic configuration center. It is necessary to configure the address of the dynamic configuration center (`dynamic.config.serverAddress`) and the type of the dynamic configuration center (`dynamic.config.dynamicConfigType`) in Sermant-agent. For details, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration)

### Plugin Configurations

The dynamic configuration plugin needs to open the switches such as whether to enable the adaptive CSE (`dynamic. config. plugin. enableCseAdapter`) and whether to enable the dynamic configuration plugin (`dynamic. config. plugin. enableDynamicConfig`). The configuration file of the plug-in can be found in `${path}/Sermant-agent-x.x.x/agent/pluginPackage/dynamic-config/config/config.yaml', as shown below:

```yaml
dynamic.config.plugin:
  enableCseAdapter: false # Whether to turn on the adaptive CSE
  enableDynamicConfig: true # Enable dynamic configuration plugin
  enableOriginConfigCenter: false # Whether to open the original configuration center
```

| Parameter Key                     |                   Description                                       | Default Value         | Required |
| ------------------------- | ------------------------------------------------------------ | -------------- | ------- |
| enableCseAdapter          | Whether to turn on the adaptive CSE; <br> **true**:Configure subscription according to application configuration, service configuration and custom tag configuration specified by ServiceMeta；<br> **false**:Subscribe by service name | true | true  |
| enableDynamicConfig       | Enable dynamic configuration plugin              | false | false  |
| enableOriginConfigCenter | Whether to open the original configuration center; <br> **false**:Shield the original configuration center, and the configuration can only be published through Sermant; <br> **true**:Do not shield the original configuration center，The configuration can be distributed through the original configuration center| false | false  |

## Detailed Governance Rules

The dynamic configuration plug-in publishes the configuration based on the dynamic configuration capability provided by the framework. The configuration publishing can be referred to[Dynamic Configuration Center User Manual](../user-guide/configuration-center.md)

Dynamic configuration is performed based on a `group`. The tag group consists of multiple key-value pairs. The value of group varies with the adaptation switch enableCseAdapter, as shown in the following figure.

- If the adaptation function is disabled(`enableCseAdapter: false`)

    In this case, the registration plugin performs subscription according to the service name of the host application, that is, the configured `spring.appplicaton.name`. If the configured service name is `DynamicConfigDemo`, the value of the corresponding `group` is `service=DynamicConfigDemo`, where the key service is fixed. The value DynamicConfigDemo is determined by the host service name.

- If the adaptation function is enabled(`enableCseAdapter: true`)

    In this case, subscription is performed based on the **application configuration, service configuration, and customized configuration**. For details about the three types of configurations, see `${path}/sermant-agent-x.x.x/agent/config/config.properties`,  The related configurations are as follows:

    ```properties
    # application name
    service.meta.application=default
    # service version
    service.meta.version=1.0.0
    # namespace just keep default
    service.meta.project=default
    # your environment, currently, development/testing/production are supported
    service.meta.environment=development
    # Customized tags, which are configured as required for subsequent configuration subscription.
    service.meta.customLabel=public
    service.meta.customLabelValue=default
    ```
  
    Refer to [CSE Configuration Center Overview](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html) for application configuration, service configuration and customized configuration description
    -  **Application configuration**: consists of `service.meta.application` and `service.meta.environment`. The corresponding group is `app=default&environment=development`.
    -  **Service configuration**: consists of `service.meta.application`, `service.meta.environment`, and `service name. Here, the service is spring.application.name`, and the corresponding group is `app=default&environment=development&service=DynamicConfigDemo`.
    -  **Customized configuration**: consists of `service.meta.customLabel` and `service.meta.customLabelValue`. The corresponding group is `public=default`.

The preceding describes the `group` configuration. The following describes the content configuration. Currently, the dynamic configuration supports only the YAML format. For example, the following content is configured:

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

## Supported Versions and Limitations

### Version Required

| Framework                     | Version                                                         |
| ------------------------- | ------------------------------------------------------------ |
| SpringBoot | 1.5.x - 2.6.2 |
| spring-cloud-starter-alibaba-nacos-config | 1.5.0.RELEASE+ |
| spring-cloud-starter-zookeeper-config | 1.2.0.RELEASE+ |

### Limitations

The @Value annotation is used as an example. The @ConfigurationProperties annotation is similar.

```java
/**
 * @Value example
 * need use with @RefreshScope
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


## Operation and result validation

The following shows how to use the dynamic configuration plugin.

### Preparation

- [Download](https://github.com/sermant-io/Sermant-examples/tree/main/flowcontrol-demo/spring-cloud-demo/spring-provider) Demo source code
- [Download](https://github.com/sermant-io/Sermant/releases) or build Sermant package
- [Download](https://zookeeper.apache.org/releases#download) and start zookeeper
- [Download](https://github.com/vran-dev/PrettyZoo/releases) PrettyZoo  and connect zookeeper

### Step 1: Compile and package the demo application

In the `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider` directory execute the following command：

```shell
# windows,Linux,mac
mvn clean package
```

After successful packaging， generate `spring-provider.jar` int the `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target` directory

> **Explain**： Path is the path where the demo application is downloaded

### Step 2: Modify plug-in configuration

Refer to [Plug-in Configuration](#Plugin Configurations) for modification`${path}/sermant-agent-x.x.x/agent/pluginPackage/dynamic-config/config/config.yaml`：
```shell
dynamic.config.plugin:
  enableCseAdapter: false
  enableDynamicConfig: true
  enableOriginConfigCenter: false
```

### Step 3: Start the demo application

Start the demo application with the following command

```shell
# windwos
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar

#linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -Dspring.application.name=spring-flow-provider -Dspring.cloud.zookeeper.connectString=127.0.0.1:2181 -jar spring-provider.jar
```

> **Explain**：
> The ${path} in the above command needs to be replaced with the actual installation path of Sermant。
> x.x.x represents a certain version number of Sermant。

### Step 4: View the original configuration

The browser or curl tool accesses `localhost: 8003/flow` to check whether the console log prints the `sermant` log. The effect image is as follows:

<MyImage src="/docs-img/dynamic-config-old-config.jpg"/>

### Step 5: Modify the application configuration

Refer to [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md)

Take Zookeeper as an example, use PrettyZoo tool to publish dynamic configuration:

1. create node `/service=spring-flow-provider`

<MyImage src="/docs-img/dynamic-config-create-node-1.jpg"/>

2. create node `/service=spring-flow-provider/config` and data `sermant: sermant1`

<MyImage src="/docs-img/dynamic-config-create-node-2.jpg"/>


### Verification

Visit `localhost: 8003/flow  through the browser or curl tool again to check whether the console has output `sermant1` logs.

<MyImage src="/docs-img/dynamic-config-verify.jpg"/>