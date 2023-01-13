# 服务注册

本文主要介绍[服务注册插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry)的使用方法,以及基于[Spring Cloud](#springcloud的注册迁移)框架和基于[Dubbo](#dubbo的注册迁移)框架注册中心的迁移能力。

## 功能介绍

服务注册插件提供代码无侵入方式，可让原本注册于Eureka，Nacos，Zookeeper、Consul等主流注册中心的微服务，无侵入地注册到[Service Center](https://github.com/apache/servicecomb-service-center)上, 同时支持Dubbo与SpringCloud框架。

## 参数配置

### 按需修改[核心配置文件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-config/config/config.properties)

修改服务信息（应用名、版本号、命名空间、环境），参考[Sermant-agent使用手册](../../user-guide/sermant-agent.md)

### 按需修改[插件配置文件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

文件路径为：`${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml`，其中`${agent_package_path}`需要替换为实际的打包路径。

配置文件如下所示：

```yaml
register.service:
  registerType: SERVICE_COMB
servicecomb.service:
  address: http://localhost:30100
  heartbeatInterval: 15
  openMigration: false
  enableSpringRegister: false
  enableDubboRegister: false
  sslEnabled: false
  preferIpAddress: false
nacos.service:
  address: 127.0.0.1:8848
  username: ""
  password: ""
  namespace: ""
  weight: 1
  clusterName: DEFAULT
  ephemeral: true
```

配置项说明如下:

|参数|默认值|所属注册中心|描述|
|---|---|---|---|
|register.service.registerType|SERVICE_COMB|通用|注册中心类型，支持NACOS/SERVICE_COMB|
|register.service.registerType.address|http://127.0.0.1:30100|通用|注册服务地址，service_comb：http://localhost:30100；nacos：127.0.0.1:8848|
|servicecomb.service.heartbeatInterval|15|SERVICE_COMB|服务实例心跳发送间隔（单位：秒）|
|servicecomb.service.openMigration|false|SERVICE_COMB|是否开启迁移功能|
|servicecomb.service.enableSpringRegister|false|SERVICE_COMB|是否开启spring插件注册能力，spring cloud框架需开启，dubbo框架需关闭|
|servicecomb.service.enableDubboRegister|false|SERVICE_COMB|是否开启dubbo插件注册能力，dubbo框架需开启，spring cloud框架需关闭|
|servicecomb.service.sslEnabled|false|SERVICE_COMB|是否开启ssl|
|nacos.service.username|<空>|NACOS|nacos验证账户|
|nacos.service.password|<空>|NACOS|nacos的验证密码|
|nacos.service.namespace|<空>|NACOS|命名空间，nacos配置创建命名空间的id值|
|nacos.service.weight|1|NACOS|服务实例权重值|
|nacos.service.clusterName|DEFAULT|NACOS|集群名称|
|nacos.service.ephemeral|true|NACOS|是否是临时节点，true为是，false为否|

### 说明：

- nacos的group通过核心配置文件的service.meta.application设置。
  
- nacos参数目前仅展示常用参数，其他参数项见[NACOS配置类](https://github.com/huaweicloud/Sermant/blob/develop/sermant-plugins/sermant-service-registry/registry-common/src/main/java/com/huawei/registry/config/NacosRegisterConfig.java)。

- 对应springcloud单注册场景，注册插件会屏蔽掉所有原注册中心相关的bean，所以，请不要在业务代码中注入原注册中心相关的bean，否则会导致服务启动失败。

- 对于**新开发**的dubbo应用，还需要设置dubbo本身注册中心地址的配置。这个配置项一般在dubbo应用的配置文件中，比如“dubbo/provider.xml”文件中：

```xml
<dubbo:registry address="sc://127.0.0.1:30100"/>
```

也可能在application.yml（或application.properties）中，以application.yml为例：

```yml
dubbo:
  registry:
    address: sc://127.0.0.1:30100
```

需要强调的是，这个配置项的地址信息**不会使用**，只使用了协议名称sc（即ip地址不重要，只需要**sc://** 开头即可）。

**注意**：对于**存量**dubbo应用（即原本已经设置过dubbo本身注册中心地址的应用）**无需**进行这一步。

## 支持版本和限制

|微服务框架组件支持列表|注册中心支持列表|注意事项|
|---|---|---|
|SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-service-center<br>Nacos|-|
|Dubbo 2.6.x-2.7.x|servicecomb-service-center<br>Nacos|-|

## 操作步骤和结果验证

### 部署应用

1. 启动Service Center，下载、使用说明和启动流程详见[官网](https://github.com/apache/servicecomb-service-center)

2. 编译[demo应用](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo)

```shell
mvn clean package
```

3. 启动消费者

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

4. 启动生产者

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo注册开关，如果使用了其它的方式打开了dubbo注册开关，则无需添加该参数。

其中${path}需要替换为Sermant工程路径，x.x.x需要替换为Sermant实际版本号，appName为agent启动参数中的应用名，与注册参数无关，执行命令的目录需要为demo应用的jar包目录。

### 结果验证

当启动以上2个应用后，登录[Service Center](http://127.0.0.1:30103/)后台，查看相关服务实例是否已注册，并且访问应用接口<http://localhost:28820/hello>，确认接口是否正常返回，若接口成功返回，则说明注册成功。

## SpringCloud的注册迁移

提供代码无侵入方式，基于双注册的模式让线上应用在线上业务不停机的前提下将注册中心快速迁移到[Service Center](https://github.com/apache/servicecomb-service-center)的能力。支持注册中心如下：

| 注册中心  | 是否支持 |
| --------- | -------- |
| Eureka    | ✅        |
| Consul    | ✅        |
| Nacos     | ✅        |
| Zookeeper | ✅        |

**搬迁示意图**

<MyImage src="/docs-img/sermant-register-migration.png"/>

### 参数配置

#### 修改[配置文件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

配置说明见[服务注册插件文档](./README.md#按需修改插件配置文件)

基于以上配置，**新增迁移配置**，并开启Spring注册插件配置内容如下：

```yaml
servicecomb.service:
  openMigration: true # 是否开启迁移功能 若进行注册中心迁移，则需将该值设置为true
  enableSpringRegister: true # 开启spring注册插件
```

#### 注册中心心跳配置下发

注册中心迁移插件提供基于动态配置中心下发关闭原注册中心心跳机制的方法，以避免源源不断的错误日志输出。

请参考[动态配置中心使用手册](../../user-guide/configuration-center.md#sermant动态配置中心模型)。

其中key值为**sermant.agent.registry**。

group建议配置为微服务级别，即**app=${yourApp}&environment=${yourEnvironment}&service={yourServiceName}**，其中app默认为default，environment默认为空, service为微服务名（通常为spring.application.name配置的值）。

content为**origin.\_\_registry\_\_.needClose: true**。

> ***注意 :***
>
> *该操作为一次性操作，关闭注册中心心跳后，将无法开启，仅当应用实例重启才可恢复。*

### 支持版本和限制

| Spring Cloud Version | Spring Boot Version | Zookeeper Discovery Version | Nacos Discovery Version     | Consul Discovery Version   | Eureka Client Version                               |
| -------------------- | ------------------- | --------------------------- | --------------------------- | -------------------------- | --------------------------------------------------- |
| Edgware.SR2          | 1.5.x               | 1.x.x, 2.0.x                | 1.5.x                       | 1.x.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Finchley.x           | 2.0.x, 2.1.x        | 2.x.x                       | 1.5.x, 2.0.x, 2.1.x         | 1.3.x, 2.0.x, 2.1.x        | 1.4.x, 2.0.x, 2.1.x                                 |
| Hoxton.x             | 2.2.x, 2.3.x        | 2.x.x, 3.0.0 - 3.1.0        | 2.x.x, 2020.0.RC1, 2021.1   | 1.3.x, 2.0.x, 2.1.x, 2.2.x | 1.4.4.RELEASE - 1.4.7.RELEASE, 2.x.x, 3.0.0 - 3.1.0 |
| 2020.0.x             | 2.4.x, 2.5.x        | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 2.1.x, 2.2.x, 3.0.0 - 3.1.0                         |
| 2021.0.0             | 2.6.x               | 3.0.0 - 3.1.0               | 2.x.x, 2020.0.RC1, 2021.1   | 3.0.0 - 3.1.0              | 3.0.0 - 3.1.0                                       |

### 操作步骤和结果验证

#### 部署应用

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

#### 结果验证

在注册中心的迁移过程中，生产者始终可以调用消费者，不需要中断服务。

## Dubbo的注册迁移

提供代码无侵入方式，基于双注册的模式让线上应用在线上业务不停机的前提下将注册中心快速迁移到[Service Center](https://github.com/apache/servicecomb-service-center)的能力。支持注册中心如下：

| 注册中心   | 是否支持 |
| --------- | -------- |
| Nacos     | ✅        |
| Zookeeper | ✅        |

**搬迁示意图**

<MyImage src="/docs-img/sermant-register-migration.png"/>

### 参数配置

#### 修改[插件配置文件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry/config/config.yaml)

文件路径为：${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml，其中${agent_package_path}需要替换为实际的打包路径。

将servicecomb.service.openMigration与servicecomb.service.enableDubboRegister的值设置为true，如下所示：

```yaml
servicecomb.service:
  openMigration: true # 开启迁移功能
  enableDubboRegister: true # 开启dubbo插件注册
```

详细配置说明见[服务注册插件文档](./README.md#按需修改插件配置文件)

**注意：如果开启了迁移功能，则无需修改原有的注册中心地址，否则将不会同时向2个注册中心（原注册中心+sc）进行注册。**

### 支持版本和限制

|微服务框架组件支持列表|注册中心支持列表|注意事项|
|---|---|---|
|Dubbo 2.6.x-2.7.x|**目标注册中心**支持：servicecomb-service-center、Nacos<br/>**原注册中心**支持：Nacos、Zookeeper|-|

### 操作步骤和结果验证

#### 部署应用

1. 准备环境

- 启动Service Center，下载、使用说明和启动流程详见[官网](https://github.com/apache/servicecomb-service-center)。

- 启动Zookeeper，下载、使用说明和启动流程详见[官网](https://zookeeper.apache.org/index.html)。

- 编译[demo应用](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo)。

```shell
mvn clean package
```

- 说明：此处以原注册中心为Zookeeper进行举例。

2. 启动demo应用

- 启动双注册消费者

```shell
# windows
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo迁移功能，如果使用了其它的方式打开了dubbo迁移开关，则无需添加该参数。

- 启动原生产者（注册到Zookeeper中）

```shell
# windows
java -jar dubbo-registry-provider.jar

# mac, linux
java -jar dubbo-registry-provider.jar
```

- 启动新生产者（注册到SC中）

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo注册开关，如果使用了其它的方式打开了dubbo注册开关，则无需添加该参数；另外为了解决同一台服务器启动2个provider遇到的端口冲突问题，需要增加-Dserver.port=48021 -Ddubbo.protocol.port=48821参数，如果测试时2个provider在不同的服务器，则无需添加该参数。

其中${path}需要替换为Sermant工程路径，x.x.x需要替换为Sermant实际版本号，appName为agent启动参数中的应用名，与注册参数无关，执行命令的目录需要为demo应用的jar包所在的目录。

##### 结果验证

当启动以上3个应用后，登录[Service Center](http://127.0.0.1:30103/)后台，查看Zookeeper节点数据，均可查看到consumer和provider应用，并且多次访问应用接口<http://localhost:28820/hello>，确认接口是否正常返回，若接口成功返回并可访问2个注册中心的生产者实例，则说明注册并迁移成功。



