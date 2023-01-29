# 服务注册

本文介绍如何使用[服务注册插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry)，以及基于[Spring Cloud](#springcloud的注册迁移)框架和基于[Dubbo](#dubbo的注册迁移)框架注册中心的迁移能力。

## 功能介绍

服务注册插件通过无侵入方式实现注册迁移以及双注册的能力。可让原本注册于Eureka，Nacos，Zookeeper、Consul等主流注册中心的微服务，无侵入地注册到[ServiceComb](https://github.com/apache/servicecomb-service-center)或[Nacos](https://nacos.io/)上，也可通过开关控制是否依然注册到原先的注册中心。

## 参数配置

### Sermant-agent配置

注册插件需要在Sermant-agent中配置服务元数据（应用名、命名空间、版本号、环境、其它元数据），参考[Sermant-agent使用手册](docs/zh/document/user-guide/sermant-agent.md#sermant-agent使用参数配置)

- service.meta.application: 应用名/组名，属于同一组的微服务才能进行服务发现。

- service.meta.project: 命名空间，属于同一命名空间的微服务才能进行服务发现。

- service.meta.version: 版本号，用来标识当前微服务的版本。

- service.meta.environment: 环境，用来标识当前微服务所属环境，属于同一环境的微服务才能进行服务发现。
  
- service.meta.parameters: 其它元数据，用来给当前微服务打标签，形如k1:v1,k2:v2。

### 插件配置

注册插件需要按需修改插件配置文件，可在路径`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-registry/config/config.yaml`找到该插件的配置文件，配置文件如下所示：

```yaml
register.service:
  registerType: SERVICE_COMB         # 新注册中心的类型，控制服务注册时采用哪种注册方式，不同注册中心有不同的注册实现。
  address: http://localhost:30100    # 新注册中心地址。控制服务注册时注册到哪里。
servicecomb.service:
  heartbeatInterval: 15              # 服务实例心跳发送间隔。通过心跳监听服务实例的状态。
  openMigration: false               # 注册迁移开关。开启后将拦截宿主服务原有的注册功能，只注册到新注册中心。
  enableSpringRegister: false        # springcloud插件注册能力开关。开启后将作为Spring Cloud服务注册到新的注册中心。不能和dubbo插件注册能力开关同时开启。
  enableDubboRegister: false         # dubbo插件注册能力开关。开启后将作为dubbo服务注册到新的注册中心。不能和Spring插件注册能力开关同时开启。
  sslEnabled: false                  # ssl开关。控制是否开启SLL安全访问。
  preferIpAddress: false             # 是否采用IP。 控制服务实例注册时采用IP注册还是采用域名注册。
nacos.service:
  username: ""                       # nacos验证账户。新的注册中心为nacos时，注册到时需要使用nacos验证账户。
  password: ""                       # nacos验证账户。新的注册中心为nacos时，注册时需要使用nacos验证密码。
  namespace: ""                      # nacos命名空间的ID值。控制nacos注册时注册到那个命名空间下，属于同一命名空间的微服务才能进行服务发现。
  weight: 1                          # 服务实例权重值。服务注册时使用。服务实例调用时，权重越高访问频率越高。
  clusterName: DEFAULT               # 集群名称。服务注册、发现时使用。服务实例调用时只会调用调用同一个集群下的实例。
  ephemeral: true                    # 是否是临时节点。服务注册时使用。服务下线后节点不需要存在时采用临时节点。
```

配置项说明如下:

| 参数键                                      | 说明                                                                            | 默认值                    | 所属注册中心       | 是否必须 |
|------------------------------------------|-------------------------------------------------------------------------------|------------------------|--------------|------|
| register.service.registerType            | 注册中心类型，支持NACOS/SERVICE_COMB                                                   | SERVICE_COMB           | 通用           | 是    |
| register.service.address                 | 注册服务地址，service_comb：形如http://localhost:30100；nacos：形如127.0.0.1:8848           | http://127.0.0.1:30100 | 通用           | 是    |
| servicecomb.service.heartbeatInterval    | 服务实例心跳发送间隔（单位：秒）                                                              | 15                     | SERVICE_COMB | 是    |
| servicecomb.service.openMigration        | 是否开启迁移功能                                                                      | false                  | SERVICE_COMB | 是    |
| servicecomb.service.enableSpringRegister | 是否开启springcloud插件注册能力，springcloud框架需开启，dubbo框架需关闭。不能和enableDubboRegister同时开启。 | false                  | 通用           | 是    |
| servicecomb.service.enableDubboRegister  | 是否开启dubbo插件注册能力，dubbo框架需开启，springcloud框架需关闭。不能和enableSpringRegister同时开启。      | false                  | 通用           | 是    |
| servicecomb.service.sslEnabled           | 是否开启ssl                                                                       | false                  | SERVICE_COMB | 是    |
| servicecomb.service.preferIpAddress      | 是否采用IP访问                                                                      | false                  | SERVICE_COMB | 是    |
| nacos.service.username                   | nacos验证账户                                                                     | <空>                    | NACOS        | 否    |
| nacos.service.password                   | nacos的验证密码                                                                    | <空>                    | NACOS        | 否    |
| nacos.service.namespace                  | 命名空间，nacos配置创建命名空间的id值                                                        | <空>                    | NACOS        | 否    |
| nacos.service.weight                     | 服务实例权重值                                                                       | 1                      | NACOS        | 是    |
| nacos.service.clusterName                | 集群名称                                                                          | DEFAULT                | NACOS        | 是    |
| nacos.service.ephemeral                  | 是否是临时节点，true为是，false为否                                                        | true                   | NACOS        | 是    |

**说明**：

- nacos的group通过[Sermant-agent配置](#sermant-agent配置)的service.meta.application设置。
  
- nacos参数目前仅展示常用参数，其他参数项见[NACOS配置类](https://github.com/huaweicloud/Sermant/blob/develop/sermant-plugins/sermant-service-registry/registry-common/src/main/java/com/huawei/registry/config/NacosRegisterConfig.java)。

## 支持版本和限制

框架支持：

- SpringCloud Edgware.SR2 - 2021.0.0

- Dubbo 2.6.x - 2.7.x

限制：

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

## 操作和结果验证

下面以dubbo场景为例，演示服务注册插件的双注册能力。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包
  
- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo)dubbo-registry-demo源码

- [下载](https://github.com/apache/servicecomb-service-center)ServiceComb（作为注册中心使用），并启动

- [下载](https://zookeeper.apache.org/releases.html#download)Zookeeper（作为注册中心使用），并启动

### 步骤一：编译打包dubbo-registry-demo应用

在`${path}/Sermant-examples/registry-demo/dubbo-registry-demo`目录执行如下命令：

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-consumer/target`得到` dubbo-registry-consumer.jar`包，在`${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-provider/target`得到`dubbo-registry-provider`包。

> 说明：path为dubbo-registry-demo应用下载所在路径。

### 步骤二：部署应用

（1）启动消费者

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

（2）启动生产者

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo注册开关，如果使用了[其它的方式](docs/zh/document/user-guide/sermant-agent.md#参数配置方式)打开了dubbo注册开关，则无需添加该参数。

其中${path}需要替换为Sermant包路径，x.x.x需要替换为Sermant实际版本号，appName为agent启动参数中的应用名，与注册参数无关，执行命令的目录需要为demo应用的jar包目录。

### 验证

<MyImage src="/docs-img/registry-result.png"/>

当启动以上2个应用后，登录[ServiceComb](http://127.0.0.1:30103/)后台，查看相关服务实例是否已注册，并且访问应用接口`http://localhost:28820/hello`，确认接口是否正常返回，若接口成功返回，则说明注册成功。

## SpringCloud的注册迁移

### 功能介绍

提供代码无侵入方式，基于双注册的模式让线上应用在线上业务不停机的前提下将注册中心快速迁移到[ServiceComb](https://github.com/apache/servicecomb-service-center)或[Nacos](https://nacos.io/)的能力。支持原注册中心如下：

| 原注册中心     | 是否支持 |
|-----------|------|
| Eureka    | ✅    |
| Consul    | ✅    |
| Nacos     | ✅    |
| Zookeeper | ✅    |

**搬迁示意图**

<MyImage src="/docs-img/sermant-register-migration.png"/>

### 参数配置

#### 修改插件配置

配置说明见[插件配置](#插件配置)。

基于以上配置，**新增迁移配置**，并开启springcloud注册插件配置内容如下：

```yaml
servicecomb.service:
  openMigration: true # 是否开启迁移功能 若进行注册中心迁移，则需将该值设置为true
  enableSpringRegister: true # 开启springcloud注册插件
```

#### 关闭原注册中心心跳

注册中心迁移插件提供基于动态配置中心下发关闭原注册中心心跳机制的方法，以避免源源不断的错误日志输出。

请参考[动态配置中心使用手册](docs/zh/document/user-guide/configuration-center.md#sermant动态配置中心模型)。

其中key值为**sermant.agent.registry**。

group建议配置为微服务级别，即**app=${service.meta.application}&environment=${service.meta.environment}&service={spring.application.name}**，其中service.meta.application、service.meta.environment的配置请参考[Sermant-agent使用手册](docs/zh/document/user-guide/sermant-agent.md#sermant-agent使用参数配置), spring.application.name为微服务名（即spring应用中配置的服务名）。

content为**origin.\_\_registry\_\_.needClose: true**。

> ***注意 :***
>
> *该操作为一次性操作，关闭注册中心心跳后，将无法开启，仅当应用实例重启才可恢复。*

### 支持版本和限制

框架支持：

- SpringCloud Edgware.SR2 - 2021.0.0

限制：暂无

### 操作和结果验证

下面以SpringCloug场景为例，演示服务注册插件的迁移功能（从Zookeeper迁移到ServiceComb）。

#### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包

- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/spring-cloud-registry-demo)spring-cloud-registry-demo源码

- [下载](https://github.com/apache/servicecomb-service-center)ServiceComb（作为注册中心使用），并启动

- [下载](https://zookeeper.apache.org/releases.html#download)Zookeeper（作为注册中心使用），并启动

### 步骤一：编译打包spring-cloud-registry-demo应用

在`${path}/Sermant-examples/registry-demo/spring-cloud-registry-demo`目录执行如下命令：

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/registry-demo/spring-cloud-registry-demo/spring-cloud-registry-consumer/target`得到` spring-cloud-registry-consumer.jar`包，在`${path}/Sermant-examples/registry-demo/spring-cloud-registry-demo/spring-cloud-registry-provider/target`得到`spring-cloud-registry-provider.jar`包。

> 说明：path为spring-cloud-registry-demo应用下载所在路径。

#### 步骤二：部署应用

（1）启动原生产者与原消费者（注册到Zookeeper中）

```shell
# windows
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar

# mac, linux
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar
```

<MyImage src="/docs-img/springcloud-migration-1.png"/>

启动成功后，访问消费者接口`http://localhost:8161/hello`，确认接口能够正常返回。

（2）启动双注册生产者

```shell
# windows
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar

# mac, linux
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true的方式打开了spring迁移功能，如果使用了[其它的方式](docs/zh/document/user-guide/sermant-agent.md#参数配置方式)打开了spring迁移开关，则无需添加该参数。为了便于观察，使用了-Dserver.port=8262的方式，修改了生产者的端口。

其中${path}需要替换为Sermant实际包路径，x.x.x需要替换为Sermant实际版本号，appName为agent的启动参数，与注册参数无关。

<MyImage src="/docs-img/springcloud-migration-2.png"/>

启动成功后，多次访问消费者接口`http://localhost:8161/hello`，确认接口能够访问2个生产者。

（3）关闭原生产者

（4）启动双注册消费者

```shell
# windows
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar

# mac, linux
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true的方式打开了spring迁移功能，如果使用了[其它的方式](docs/zh/document/user-guide/sermant-agent.md#参数配置方式)打开了spring迁移开关，则无需添加该参数。为了便于观察，使用了-Dserver.port=8261的方式，修改了消费者的端口。

其中${path}需要替换为Sermant实际包路径，x.x.x需要替换为Sermant实际版本号，appName为agent的启动参数，与注册参数无关。

<MyImage src="/docs-img/springcloud-migration-3.png"/>

启动成功后，多次访问消费者接口`http://localhost:8161/hello`和`http://localhost:8261/hello`，确认2个接口能够访问双注册生产者。

（5）关闭原消费者

（6）停止旧的注册中心（Zookeeper）

> ***提示：***
>
> 关闭原注册中心，由于大部分注册中心存在心跳检查机制，实例可能会不断刷错误日志，但不影响应用的正常调用。
>
> 若需要停止此类错误日志，参考节[**关闭原注册中心心跳**](#关闭原注册中心心跳)。
> 
> 给生产者下发配置时，key值为**sermant.agent.registry**，group为**app=default&environment=&service=spring-cloud-registry-provider**，content为**origin.\_\_registry\_\_.needClose: true**。
>
> 给消费者下发配置时，key值为**sermant.agent.registry**，group为**app=default&environment=&service=spring-cloud-registry-consumer**，content为**origin.\_\_registry\_\_.needClose: true**。

#### 验证

<MyImage src="/docs-img/springcloud-migration-4.png"/>

生产者服务与消费者服务成功把注册中心迁移到了servicecomb中，且在注册中心的迁移过程中，生产者始终可以调用消费者，不需要中断服务。

## Dubbo的注册迁移

### 功能介绍

提供代码无侵入方式，基于双注册的模式让线上应用在线上业务不停机的前提下将注册中心快速迁移到[ServiceComb](https://github.com/apache/servicecomb-service-center)或[Nacos](https://nacos.io/)的能力。支持原注册中心如下：

| 原注册中心     | 是否支持 |
|-----------|------|
| Nacos     | ✅    |
| Zookeeper | ✅    |

**搬迁示意图**

<MyImage src="/docs-img/sermant-register-migration.png"/>

### 参数配置

#### 修改插件配置

配置说明见[插件配置](#插件配置)。

基于以上配置，**新增迁移配置**，并开启dubbo注册插件配置内容如下：

```yaml
servicecomb.service:
  openMigration: true # 是否开启迁移功能 若进行注册中心迁移，则需将该值设置为true
  enableDubboRegister: true # 开启dubbo插件注册
```

**注意：如果开启了迁移功能，则无需修改原有的注册中心地址（即dubbo.registry.address），否则将不会同时向2个注册中心（原注册中心+sc）进行注册。**

### 支持版本和限制

框架支持：

- Dubbo 2.6.x - 2.7.x

限制：暂无

### 操作和结果验证

下面以Dubbo场景为例，演示服务注册插件的迁移功能（从Zookeeper迁移到ServiceComb）。

#### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包

- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/dubbo-registry-demo)dubbo-registry-demo源码

- [下载](https://github.com/apache/servicecomb-service-center)ServiceComb（作为注册中心使用），并启动

- [下载](https://zookeeper.apache.org/releases.html#download)Zookeeper（作为注册中心使用），并启动

### 步骤一：编译打包dubbo-registry-demo应用

在`${path}/Sermant-examples/registry-demo/dubbo-registry-demo`目录执行如下命令：

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-consumer/target`得到` dubbo-registry-consumer.jar`包，在`${path}/Sermant-examples/registry-demo/dubbo-registry-demo/dubbo-registry-provider/target`得到`dubbo-registry-provider`包。

> 说明：path为dubbo-registry-demo应用下载所在路径。

#### 步骤二：部署应用

（1）启动双注册消费者

```shell
# windows
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar

# mac, linux
java -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-consumer.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo迁移功能，如果使用了[其它的方式](docs/zh/document/user-guide/sermant-agent.md#参数配置方式)打开了dubbo迁移开关，则无需添加该参数。

（2）启动原生产者（注册到Zookeeper中）

```shell
# windows
java -jar dubbo-registry-provider.jar

# mac, linux
java -jar dubbo-registry-provider.jar
```

（3）启动新生产者（注册到SC中）

```shell
# windows
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar

# mac, linux
java -Dservicecomb.service.enableDubboRegister=true -Dserver.port=48021 -Ddubbo.protocol.port=48821 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar dubbo-registry-provider.jar
```

注：为了便于测试，这里使用了-Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo注册开关，如果使用了[其它的方式](docs/zh/document/user-guide/sermant-agent.md#参数配置方式)打开了dubbo注册开关，则无需添加该参数；另外为了解决同一台服务器启动2个provider遇到的端口冲突问题，需要增加-Dserver.port=48021 -Ddubbo.protocol.port=48821参数，如果测试时2个provider在不同的服务器，则无需添加该参数。

其中${path}需要替换为Sermant实际包路径，x.x.x需要替换为Sermant实际版本号，appName为agent启动参数中的应用名，与注册参数无关，执行命令的目录需要为demo应用的jar包所在的目录。

#### 验证

<MyImage src="/docs-img/dubbo-migration.png"/>

当启动以上3个应用后，登录[ServiceComb](http://127.0.0.1:30103/)后台，查看Zookeeper节点数据，均可查看到consumer和provider应用，并且多次访问应用接口`http://localhost:28820/hello`，确认接口是否正常返回，若接口成功返回并可访问2个注册中心的生产者实例，则说明注册并迁移成功。