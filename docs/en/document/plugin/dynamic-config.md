# Dynamic Configuration

This document is used to introduce the usage of [dynamic configuration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-dynamic-config)

## Functions

This plugin implements dynamic configuration based on the Sermant configuration center capability. During running, the configuration can be updated to the host application. The priority of the plugin is higher than that of the environment variable configuration.

The current plugin supports [SpringCloud](https://github.com/spring-cloud) applications and needs to be used together with the `@Value, @ConfigurationProperties, and @RefreshScope` annotations.


## Parameter configuration

### Modify the configuration of the configuration center/dynamic configuration plugin

**（1）Modify the config center(Optional)**

To modify the type and address of the dynamic configuration center, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md).


**（2）Configure Dynamic Configuratin plugin**

Modify the `${javaagent path}/pluginPackage/dynamic-config/config/config.yaml`, configuration file as follows:

```yaml
dynamic.config.plugin:
  enableCseAdapter: true # Whether to enable CSE adaptation
  enableDynamicConfig: true # Whether to enable the dynamic configuration plugin
  enableOriginConfigCenter: false # Indicates whether to enable the original configuration center. By default, the configuration center is disabled.
  #sourceKeys: sourceKeys # related the keys that can effect， default is null
```

## Publish Configurations by Config Center

Configuration distribution reference [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md)

Configuration description:

| Key in Input Parameters    | Description                                         |  Default Value  |   Required  |
| ------------------------- | ------------------------------------------------------------ | --------- | --------- |
| enableCseAdapter          | If this parameter is set to true, subscription is performed based on the application configuration, service configuration, and customized tag configuration specified by ServiceMeta. If the value is false, subscription is performed only based on the service name. That is, the key is service and the value is "Host service name (obtained by spring.application.name)". | true | true|
| enableDynamicConfig       | Indicates whether to enable dynamic configuration. The dynamic configuration takes effect only when this parameter is set to true. | false | false|
| enableOriginConfigCenter | Indicates whether to enable the original configuration center. This parameter is disabled by default. Currently, only ZooKeeper and Nacos configuration center (implemented based on SpringCloud Config) are supported. | false | false|
| sourceKeys                | When the specified configuration key takes effect, you can set this parameter. For example, you only want to read the application.yaml file. Otherwise, all configurations are read by default. Use commas (,) to separate multiple keys. | - | false|

Dynamic configuration is performed based on a group. The tag group consists of multiple key-value pairs. The value of group varies with the adaptation switch enableCseAdapter, as shown in the following figure.

（1）If the adaptation function is disabled(`enableCseAdapter: false`)

​	In this case, the registration plugin performs subscription according to the service name of the host application, that is, the configured `spring.appplicaton.name`. If the configured service name is `DynamicConfigDemo`, the value of the corresponding `group` is `service=DynamicConfigDemo`, where the key service is fixed. The value DynamicConfigDemo is determined by the host service name.

（2）If the adaptation function is enabled(`enableCseAdapter: true`)

​	In this case, subscription is performed based on the **application configuration, service configuration, and customized configuration**. For details about the three types of configurations, see `${javaagent path}/pluginPackage/config.properties`,  The related configurations are as follows:

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
-  **Application configuration**: consists of `service.meta.application` and `service.meta.environment`. The corresponding group is `app=default&environment=development`.
-  **Service configuration**: consists of `service.meta.application`, `service.meta.environment`, and `service name. Here, the service is spring.application.name`, and the corresponding group is `app=default&environment=development&service=DynamicConfigDemo`.
-  **Customized configuration**: consists of `service.meta.customLabel` and `service.meta.customLabelValue`. The corresponding group is `public=default`.

The preceding describes the group configuration. The following describes the content configuration. Currently, the dynamic configuration supports only the YAML format. For example, the following content is configured:

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

There is no special requirement for key configuration. Note that if you set the **sourceKeys** configuration item, the configuration item **takes effect only when the key matches the sourceKeys** configuration item.

### KIE Config Center

The KIE publish configuration needs to be released through its own API. The configuration content of the http://ip:30110/v1/default/kie/kv, interface is as follows:

```json
{
	"key": "test",
	"value": "limitRefreshPeriod: \"1000\"\nname: hello\nrate: \"2\"\n",
	"labels": {
		"app": "discovery",
		"environment": "testing"
	},
	"status": "enabled"
}
```

The preceding configuration keys and labels correspond to the keys and groups that are released [through the Sermant background service](#Publish-configurations-through-the-Sermant-Backend-service). If you are not familiar with KIE requests, see the [API document](https://github.com/apache/servicecomb-kie/tree/master/docs).

### ZOOKEEPER Config Center

The ZOOKEEPER configuration publishment needs to be configured based on the command line, that is, zkServer. Its path consists of the key and group configured [through the Sermant background service](#Publish-configurations-through-the-Sermant-Backend-service) release, that is, /group/key, whose value is content. 

The following shows how to publish a configuration:

If the current service name is **DynamicConfigDemo**, the corresponding **group is service=DynamicConfigDemo**, the specified **key is test**, and the content is **sermant: sermant**, the released command is as follows:

```shell
# create /group/key content
create /service=DynamicConfigDemo/test "sermant: sermant"
```

## Supported Versions and Limitations

### Version Required

**SpringCloud:**  version support
- SpringBoot 1.5.x - 2.6.2
- spring-cloud-starter-alibaba-nacos-config 1.5.0.RELEASE+
- spring-cloud-starter-zookeeper-config 1.2.0.RELEASE+


## Operation and result validation

### Deploy Application

Prepare the demo application, for example, xxx.jar. Run the following command to start the application:

```shell
#EnableCseAdapter based on the configuration
java -javaagent:${agent path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=DynamicConfigDemo -Dspring.application.name=DynamicConfigDemo -Ddynamic.config.plugin.enableDynamicConfig=true -Ddynamic.config.plugin.enableCseAdapter=false -jar xxx.jar
```

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

    @Value("${spring.application.name}")
    private String name;

    @Override
    public String toString() {
        return "ValueConfig{" +
            "test=" + test +
            ", dubbo=" + dubbo +
            ", sermant=" + sermant +
            ", port=" + port +
            ", name='" + name + '\'' +
            '}';
    }

    public Object getSermant() {
        return sermant;
    }

    public Object getDubbo() {
        return dubbo;
    }

    public Object getTest() {
        return test;
    }
}

```



### Verification

Release the updated configuration, access the demo application again, and check whether the configuration is refreshed and whether `Refresh Keys` logs are generated on the console.