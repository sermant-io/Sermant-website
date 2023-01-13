# 动态配置

本文档主要介绍[动态配置插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-dynamic-config)以及该插件的使用方法。

## 功能介绍

该插件基于Sermant配置中心能力实现动态配置，可在运行时将配置刷新到宿主应用，其优先级将高于环境变量配置。

当前插件插件支持[SpringCloud](https://github.com/spring-cloud)应用，需配合注解`@Value, @ConfigurationProperties以及@RefreshScope`使用


## 参数配置

### 修改配置中心/动态配置插件的配置

**（1）修改配置中心（可选）**

修改动态配置中心类型与地址，参考[Sermant-agent使用手册](../user-guide/sermant-agent.md)。

**（2）配置动态配置插件**

修改配置文件`${javaagent路径}/pluginPackage/dynamic-config/config/config.yaml`, 配置如下：

```yaml
dynamic.config.plugin:
  enableCseAdapter: true # 是否开启适配CSE
  enableDynamicConfig: true # 是否开启动态配置插件
  enableOriginConfigCenter: false # 是否开启原配置中心, 默认关闭
  #sourceKeys: sourceKey #针对指定键生效
```

配置说明：

| 参数键                     | 说明                                                         | 默认值         | 是否必须 |
| ------------------------- | ------------------------------------------------------------ | -------------- | ------- |
| dynamic.config.plugin.enableCseAdapter          | 当配置为true时, 会根据ServiceMeta指定的应用配置，服务配置以及自定义标签配置三种类型进行配置订阅；当为false时，只会根据服务名进行订阅，即对键为`service`, 值为"宿主服务名（即spring.application.name获取）" | true | 是  |
| dynamic.config.plugin.enableDynamicConfig       | 动态配置开关，仅当配置为true时，动态配置才会生效             | false | 否  |
| dynamic.config.plugin.enableOriginConfigCenter | 是否开启原配置中心, 默认不开启。当前仅支持Zookeeper与Nacos配置中心（基于SpringCloud Config实现） | false | 否  |
| dynamic.config.plugin.sourceKeys                | 当需要指定的配置键生效时，可配置该值，例如只是想读取application.yaml，否则默认会读取所有的配置；多个键使用`,`隔开。 | - | 否  |



动态配置主要基于`group`进行匹配配置订阅，该标签组由多个键值对组成，根据适配开关配置`enableCseAdapter`的不同，`group`的值将会有所区别，如下：

（1）若关闭适配，即`enableCseAdapter: false`

​	此时注册插件将根据宿主应用的服务名进行订阅, 即配置的`spring.applicaton.name`, 若此时配置的服务名为`DynamicConfigDemo`, 那么对应的`group`的值为`service=DynamicConfigDemo`， 其中键service是固定的, 值DynamicConfigDemo由宿主服务名决定

（2）若开启适配, 即`enableCseAdapter: true`

​	此时将根据**应用配置**，**服务配置**以及**自定义配置**三项数据进行配置**同时**订阅， 而这三类配置可参考`${javaagent路径}/pluginPackage/config.properties`, 相关配置如下：

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
- 应用配置：由`service.meta.application`与`service.meta.environment`组成， 对应的`group`为`app=default&environment=development`
- 服务配置：由`service.meta.application`、`service.meta.environment`以及服务名组成，此处服务即`spring.application.name`, 对应的`group`为`app=default&environment=development&service=DynamicConfigDemo`
- 自定义配置：由`service.meta.customLabel`与`service.meta.customLabelValue`组成， 对应的`group`为`public=default`

**以上为`group`的配置介绍**，下面说明`content`配置，当前动态配置仅支持yaml格式, 例如配置如下内容:

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

针对`key`配置无特殊要求，但需要注意的是，若您配置了`sourceKeys`配置项，仅当`key`与`sourceKeys`匹配时才会生效

#### 通过配置中心发布配置

不同的配置中心配置方式都不同， 以下分别说明Zookeeper与Kie配置中心的配置方式

##### Kie配置中心

KIE发布配置需通过其自身API发布，其接口为`http://ip:30110/v1/default/kie/kv`, 配置内容如下:

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

以上配置key与labels分别与[通过Sermant后台服务发布配置](#通过Sermant后台服务发布配置)的key与group相对应，若对KIE请求不了解，可参考[api文档](https://github.com/apache/servicecomb-kie/tree/master/docs)

##### Zookeeper配置中心

Zookeeper配置发布则需基于命令行配置，即`zkServer`, 其路径由[通过Sermant后台服务发布配置](#通过Sermant后台服务发布配置)的key与group组成， 即/group/key, 其值即为content。例如发布一个配置：

当前服务名为`DynamicConfigDemo`,对应的**group**为`service=DynamicConfigDemo`, 指定的**key**为`test`, **content**为`sermant: sermant`, 那么发布的命令为

```shell
# create /group/key content
create /service=DynamicConfigDemo/test "sermant: sermant"
```

## 支持版本和限制

### 版本要求

**SpringCloud:** 版本支持
- SpringBoot 1.5.x - 2.6.2
- spring-cloud-starter-alibaba-nacos-config 1.5.0.RELEASE+
- spring-cloud-starter-zookeeper-config 1.2.0.RELEASE+


## 操作和结果验证

### 部署应用

准备好demo应用，例如xxx.jar, 参考如下启动命令如下:

```shell
#根据配置enableCseAdapter按需调整
java -javaagent:${agent路径}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=DynamicConfigDemo -Dspring.application.name=DynamicConfigDemo -Ddynamic.config.plugin.enableDynamicConfig=true -Ddynamic.config.plugin.enableCseAdapter=false -jar xxx.jar
```

以下示范`@Value`注解使用，`@ConfigurationProperties`注解同理

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


### 验证

尝试发布更新配置，再次访问demo应用，观察配置是否刷新，控制台是否有输出`Refresh Keys`日志。