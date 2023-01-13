# SpringCloud的注册迁移

本文主要介绍[服务注册插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry)基于Spring Cloud框架注册中心的迁移能力。

Dubbo迁移见[Dubbo注册中心迁移](dubbo-registry-migiration.md)

## 功能介绍

提供代码无侵入方式，基于双注册的模式让线上应用在线上业务不停机的前提下将注册中心快速迁移到[Service Center](https://github.com/apache/servicecomb-service-center)的能力。支持注册中心如下：

| 注册中心  | 是否支持 |
| --------- | -------- |
| Eureka    | ✅        |
| Consul    | ✅        |
| Nacos     | ✅        |
| Zookeeper | ✅        |

**搬迁示意图**

<MyImage src="/docs-img/sermant-register-migration.png"/>

## 参数配置

### 修改[配置文件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

配置说明见[服务注册插件文档](./README.md#按需修改插件配置文件)

基于以上配置，**新增迁移配置**，并开启Spring注册插件配置内容如下：

```yaml
servicecomb.service:
  openMigration: true # 是否开启迁移功能 若进行注册中心迁移，则需将该值设置为true
  enableSpringRegister: true # 开启spring注册插件
```

### 注册中心心跳配置下发

注册中心迁移插件提供基于动态配置中心下发关闭原注册中心心跳机制的方法，以避免源源不断的错误日志输出。

请参考[动态配置中心使用手册](../../user-guide/configuration-center.md#Sermant动态配置中心模型)。

其中key值为**sermant.agent.registry**。

group建议配置为微服务级别，即**app=${yourApp}&environment=${yourEnvironment}&service={yourServiceName}**，其中app默认为default，environment默认为空, service为微服务名（通常为spring.application.name配置的值）。

content为**origin.\_\_registry\_\_.needClose: true**。

> ***注意 :***
>
> *该操作为一次性操作，关闭注册中心心跳后，将无法开启，仅当应用实例重启才可恢复。*

## 支持版本和限制

| Spring Cloud Version | Spring Boot Version | Zookeeper Discovery Version | Nacos Discovery Version     | Consul Discovery Version   | Eureka Client Version                               |
| -------------------- | ------------------- | --------------------------- | --------------------------- | -------------------------- | --------------------------------------------------- |
| Edgware.SR2          | 1.5.x               | 1.x.x, 2.0.x                | 1.5.x                       | 1.x.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Finchley.x           | 2.0.x, 2.1.x        | 2.x.x                       | 1.5.x, 2.0.x, 2.1.x         | 1.3.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Hoxton.x             | 2.2.x, 2.3.x        | 2.x.x, 3.0.0 - 3.1.0        | 2.x.x, 2020.0.RC1, 2021.1   | 1.3.x, 2.0.x, 2.1.x, 2.2.x | 1.4.4.RELEASE - 1.4.7.RELEASE, 2.x.x, 3.0.0 - 3.1.0 |
| 2020.0.x             | 2.4.x, 2.5.x        | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 2.1.x, 2.2.x, 3.0.0 - 3.1.0                         |
| 2021.0.0             | 2.6.x               | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 3.0.0 - 3.1.0                                       |

## 操作步骤和结果验证

### 部署应用

1. 准备环境

- 启动Service Center，下载、使用说明和启动流程详见[官网](https://github.com/apache/servicecomb-service-center)。

- 启动Zookeeper，下载、使用说明和启动流程详见[官网](https://zookeeper.apache.org/index.html)。

- 编译[demo应用](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/spring-cloud-registry-demo)。

```shell
mvn clean package
```

- 说明：此处以原注册中心为Zookeeper进行举例。

2. 启动demo应用

（1）启动原生产者与原消费者（注册到Zookeeper中）

```shell
# windows
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar

# mac, linux
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar
```

（2）启动成功后，访问消费者接口<http://localhost:8161/hello>，确认接口是否正常返回。

（3）启动双注册生产者

```shell
# windows
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar

# mac, linux
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true的方式打开了spring迁移功能，如果使用了其它的方式打开了spring迁移开关，则无需添加该参数。为了便于观察，使用了-Dserver.port=8262的方式，修改了生产者的端口。

其中path需要替换为Sermant实际打包路径，x.x.x需要替换为Sermant实际版本号，appName为agent的启动参数，与注册参数无关。

（4）启动成功后，多次访问消费者接口<http://localhost:8161/hello>，确认接口是否能够访问2个生产者。

（5）关闭原生产者

（6）启动双注册消费者

```shell
# windows
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar

# mac, linux
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true的方式打开了spring迁移功能，如果使用了其它的方式打开了spring迁移开关，则无需添加该参数。为了便于观察，使用了-Dserver.port=8261的方式，修改了消费者的端口。

其中path需要替换为Sermant实际打包路径，x.x.x需要替换为Sermant实际版本号，appName为agent的启动参数，与注册参数无关。

（7）启动成功后，多次访问消费者接口<http://localhost:8161/hello>和<http://localhost:8261/hello>，确认2个接口是否能够访问双注册生产者。

（8）关闭原消费者

（9）停止旧的注册中心（Zookeeper）

> ***提示：***
>
> 关闭原注册中心，由于大部分注册中心存在心跳检查机制，实例可能会不断刷错误日志，但不影响应用的正常调用。
>
> 若需要停止此类错误日志，参考节[**注册中心心跳配置下发**](#注册中心心跳配置下发)。
> 
> 给生产者下发配置时，key值为**sermant.agent.registry**，group为**app=default&environment=&service=spring-cloud-registry-provider**，content为**origin.\_\_registry\_\_.needClose: true**。
>
> 给消费者下发配置时，key值为**sermant.agent.registry**，group为**app=default&environment=&service=spring-cloud-registry-consumer**，content为**origin.\_\_registry\_\_.needClose: true**。

### 结果验证

在注册中心的迁移过程中，生产者始终可以调用消费者，不需要中断服务。