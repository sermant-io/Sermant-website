# 注册迁移

本文介绍如何使用[注册迁移插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-service-registry)。

## 功能介绍

对于绝大多数企业客户来说，比较关心注册中心迁移过程的平滑性以及业务的连续性。注册迁移插件通过非侵入方式实现注册中心迁移的能力，让原本注册于Eureka、Nacos、Zookeeper、Consul等主流注册中心的微服务，非侵入地注册到
[ServiceComb](https://github.com/apache/servicecomb-service-center)或[Nacos](https://nacos.io/)上。

**搬迁示意图：**

<MyImage src="/docs-img/registration-migration.jpg"/>

从上述搬迁示意图可知，搬迁的应用服务挂载了Sermant通过**双注册**的方式将业务从旧注册中心快速迁移到新注册中心上。后续新开发的应用服务也可通过挂Sermant通过**单注册**的方式注册到新的注册中心（注册逻辑不在新开发应用服务的SDK中而且通过注册迁移插件实现）。

## 参数配置

### Sermant Agent配置

注册迁移插件需要在Sermant Aagent中配置服务元数据（应用名、命名空间、版本号、环境、其它元数据），参考[Sermant Agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

- service.meta.application: 应用名/组名，属于同一组的微服务才能进行服务发现。

- service.meta.project: 命名空间，属于同一命名空间的微服务才能进行服务发现。

- service.meta.version: 版本号，用来标识当前微服务的版本。

- service.meta.environment: 环境，用来标识当前微服务所属环境，属于同一环境的微服务才能进行服务发现。
  
- service.meta.parameters: 其它元数据，用来给当前微服务打标签，形如k1:v1，k2:v2。

### 插件配置

注册迁移插件需要按需修改插件配置文件，可在路径`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-registry/config/config.yaml`找到该插件的配置文件，配置文件如下所示：

```yaml
register.service:
  registerType: SERVICE_COMB         # 新注册中心的类型，控制服务注册时采用哪种注册方式，不同注册中心有不同的注册实现。
  address: http://localhost:30100    # 新注册中心地址。控制服务注册时注册到哪里。
  enableSpringRegister: false        # springcloud插件注册能力开关。开启后将作为Spring Cloud服务注册到新的注册中心。不能和dubbo插件注册能力开关同时开启。
  enableDubboRegister: false         # dubbo插件注册能力开关。开启后将作为dubbo服务注册到新的注册中心。不能和Spring插件注册能力开关同时开启。
  openMigration: false               # 注册迁移开关。开启后将拦截宿主服务原有的注册功能，只注册到新注册中心。
servicecomb.service:
  heartbeatInterval: 15              # 服务实例心跳发送间隔。通过心跳监听服务实例的状态。
  sslEnabled: false                  # ssl开关。控制是否开启SSL安全访问。
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

| 参数键                                      | 参数类型（所属注册中心）         |说明                                                                            | 默认值                    | 是否必须 |
|------------------------------------------|-------------------------------------------------------------------------------|------------------------|--------------|------|
| register.service.registerType            | 通用               |新注册中心类型，目前支持NACOS/SERVICE_COMB。                                           | SERVICE_COMB           | 是    |
| register.service.address                 | 通用               |注册服务地址，SERVICE_COMB：形如http://localhost:30100；NACOS：形如127.0.0.1:8848。           | http://127.0.0.1:30100 | 是    |
| register.service.enableSpringRegister | 通用               |是否开启springcloud插件注册能力，springcloud框架需开启，dubbo框架需关闭。不能和enableDubboRegister同时开启。 | false                          | 是    |
| register.service.enableDubboRegister  | 通用                 |是否开启dubbo插件注册能力，dubbo框架需开启，springcloud框架需关闭。不能和enableSpringRegister同时开启。      | false                  | 是    |
| register.service.openMigration        | 通用                 |是否开启迁移功能，开启后将拦截宿主服务原有的注册功能，只注册到新注册中心。                                                                    | false                  | SERVICE_COMB | 是    |
| servicecomb.service.heartbeatInterval    | SERVICE_COMB |服务实例心跳发送间隔（单位：秒）。                                                | 15                     | 是    |
| servicecomb.service.sslEnabled           | SERVICE_COMB |是否开启ssl安全访问。                                                                       | false                  |  是    |
| servicecomb.service.preferIpAddress      | SERVICE_COMB |是否采用IP访问，控制服务实例注册时采用IP注册还是采用域名注册。                                                                      | false                  | 是    |
| nacos.service.username                   | NACOS        |nacos验证账户，新的注册中心为nacos时，注册到时需要使用nacos验证账户。                                                                     | <空>                    |  否    |
| nacos.service.password                   | NACOS        | nacos的验证密码，新的注册中心为nacos时，注册时需要使用nacos验证密码。                                                                    | <空>                    | 否    |
| nacos.service.namespace                  | NACOS        |命名空间，nacos配置创建命名空间的id值。控制nacos注册时注册到那个命名空间下，属于同一命名空间的微服务才能进行服务发现。                                                        | <空>                    | 否    |
| nacos.service.weight                     | NACOS        |服务实例权重值。服务注册时使用。服务实例调用时，权重越高访问频率越高。                                                                       | 1                      | 是    |
| nacos.service.clusterName                | NACOS        |集群名称。服务注册、发现时使用，服务实例调用时只会调用调用同一个集群下的实例。                                                                          | DEFAULT                | 是    |
| nacos.service.ephemeral                  | NACOS        |是否是临时节点，true为是，false为否。服务注册时使用，服务下线后节点不需要存在时采用临时节点。                                                        | true                   | 是    |

> **说明：**
> - nacos的group通过[Sermant-agent配置](../user-guide/sermant-agent.md#sermant-agent使用参数配置)的service.meta.application设置。
> - nacos参数目前仅展示常用参数，其他参数项见[NACOS配置类](https://github.com/sermant-io/Sermant/blob/develop/sermant-plugins/sermant-service-registry/registry-common/src/main/java/io/sermant/registry/config/NacosRegisterConfig.java)。

## 关闭原注册中心心跳规则

<MyImage src="/docs-img/offline-old-registration.png"/>

如上图所示，双注册上线稳定后需下线旧注册中心，注册迁移插件提供基于动态配置中心下发关闭原注册中心心跳机制的方法，以避免源源不断的错误日志输出。

请参考[动态配置中心使用手册](../user-guide/configuration-center.md#sermant动态配置中心模型)，配置内容如下：

```json
{
  "content为": "origin.__registry__.needClose: true",
  "group": "app=${service.meta.application}&environment=${service.meta.environment}&service={spring.application.name}",
  "key": "sermant.agent.registry"
}
```

> **说明：** group为服务配置。配置时请将service.meta.application、service.meta.environment、spring.application.name修改为具体的值，其中service.meta.application、service.meta.environment的配置请参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置), spring.application.name为微服务名（即spring应用中配置的服务名）。服务配置说明参考[CSE配置中心概述](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html)。

> **注意 :** 该操作为一次性操作，关闭注册中心心跳后，将无法开启，仅当应用实例重启才可恢复。

## 支持版本和限制

### SpringCloud框架

**版本支持**：Edgware.SR2 - 2021.0.0

**注册中心迁移支持类型**：

<table>     
<tr>         <th>原注册中心</th><th>目标注册中心</th><th>是否支持</th>   </tr>  
<tr>         <td rowspan="2">Eureka</td><td>ServiceComb</td> <td>✅</td>    
</tr> 
<tr>         <td>Nacos</td> <td>✅</td>    
</tr>  
<tr>         <td rowspan="2">Consul</td><td>ServiceComb</td> <td>✅</td>    
</tr> 
<tr>         <td>Nacos</td> <td>✅</td>    
</tr>
<tr>         <td rowspan="2">Nacos</td><td>ServiceComb</td> <td>✅</td>    
</tr> 
<tr>         <td>Nacos</td> <td>✅</td>    
</tr> 
<tr>         <td rowspan="2">Zookeeper</td><td>ServiceComb</td> <td>✅</td>    
</tr> 
<tr>         <td>Nacos</td> <td>✅</td>    
</tr> 
</table>

**目标注册中心版本支持**：

- ServiceComb：2.x
- Nacos：2.x

> **说明**：原注册中心版本和自身应用服务需使用的版本相关。

限制：

- **关闭原注册中心心跳规则仅支持SpringCloud应用**

- 对应SpringCloud单注册场景，注册迁移插件会屏蔽掉所有原注册中心相关的bean，所以，请不要在业务代码中注入原注册中心相关的bean，否则会导致服务启动失败。

### Dubbo框架


**框架支持**：2.6.x - 2.7.x

**注册中心迁移支持类型**：

<table>     
<tr>         <th>原注册中心</th><th>目标注册中心</th><th>是否支持</th>   </tr>  
<tr>         <td rowspan="2">Nacos</td><td>ServiceComb</td> <td>✅</td>    
</tr> 
<tr>         <td>Nacos</td> <td>✅</td>    
</tr>  
</tr> 
<tr>         <td rowspan="2">Zookeeper</td><td>ServiceComb</td> <td>✅</td>    
</tr> 
<tr>         <td>Nacos</td> <td>✅</td>    
</tr> 
</table>

**目标注册中心版本支持**：

- ServiceComb：2.x
- Nacos：2.x

> **说明**：原注册中心版本和自身应用服务需使用的版本相关。

**限制**：

- 对于**新开发**的dubbo应用（**单注册场景**），还需要设置dubbo本身注册中心地址的配置。这个配置项一般在dubbo应用的配置文件中，比如“dubbo/provider.xml”文件中：

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

> **注意：** 对于**存量**dubbo应用（即原本已经设置过dubbo本身注册中心地址的应用）**无需**进行这一步。

## 操作和结果验证

### 1 单注册模式

下面将演示如何使用注册迁移插件，验证dubbo应用在单注册模式下注册至新注册中心（ServiceComb）场景。

#### 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-registry-demo-2.0.0.tar.gz) Demo二进制产物压缩包
- [下载](https://github.com/apache/servicecomb-service-center)ServiceComb，并启动

> **注意：** [动态配置中心](../user-guide/configuration-center.md)会在本场景中默认使用，由于非本场景的核心组件，因此在本文中不额外赘述。

#### 步骤一：获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`dubbo-registry-consumer.jar`和`dubbo-registry-provider.jar`。

#### 步骤二：部署应用

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

> **说明：** 其中${path}需要替换为sermant包路径，x.x.x需要替换为sermant实际版本号，appName为agent启动参数中的应用名，与注册参数无关，执行命令的目录需要为Demo应用的jar包目录。

> **注意：** 为了便于测试，这里使用了-Dservicecomb.service.enableDubboRegister=true的方式打开了dubbo注册开关，如果使用了其它的[参数配置方式](../user-guide/sermant-agent.md#参数配置方式)打开了dubbo注册开关，则无需添加该参数。


#### 验证

当启动以上2个应用后，登录ServiceComb后台`http://127.0.0.1:30103/`，查看相关服务实例是否已注册。

<MyImage src="/docs-img/registry-result.png"/>

访问应用接口`http://localhost:28820/hello`，确认接口是否正常返回，若接口成功返回，则说明注册成功。

<MyImage src="/docs-img/registry-request-result.png"/>

### 2 双注册模式

下面将演示如何使用注册迁移插件，验证SpringCloud应用在双注册模式下的从旧注册中心（ZooKeeper）迁移到新注册中心（ServiceComb）场景。

#### 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases)/编译sermant包

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v1.2.1/sermant-examples-registry-demo-1.2.1.tar.gz) Demo二进制产物压缩包

- [下载](https://github.com/apache/servicecomb-service-center)ServiceComb，并启动

- [下载](https://zookeeper.apache.org/releases.html#download)ZooKeeper，并启动

> **注意：** [动态配置中心](../user-guide/configuration-center.md)会在本场景中默认使用，由于非本场景的核心组件，因此在本文中不额外赘述。

#### 步骤一：获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`spring-cloud-registry-consumer.jar`和`spring-cloud-registry-provider.jar`。

#### 步骤二：部署应用

（1）启动原生产者与原消费者（注册到ZooKeeper中）

```shell
# windows, linux, mac
java -jar spring-cloud-registry-provider.jar

java -jar spring-cloud-registry-consumer.jar
```

启动成功后，访问消费者接口`http://localhost:8161/hello`，确认接口能够正常返回。

<MyImage src="/docs-img/springcloud-migration-1.png"/>

（2）启动双注册生产者

```shell
# windows
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar

# mac, linux
java -Dserver.port=8262 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-provider.jar
```
> **说明：** 其中${path}需要替换为sermant实际包路径，x.x.x需要替换为sermant实际版本号，appName为agent的启动参数，与注册参数无关。

> **注意：** 为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true的方式打开了spring迁移功能，如果使用了其它[参数配置方式](../user-guide/sermant-agent.md#参数配置方式)打开了spring迁移开关，则无需添加该参数。为了便于观察，使用了-Dserver.port=8262的方式，修改了生产者的端口。

启动成功后，多次访问消费者接口`http://localhost:8161/hello`，确认接口能够访问2个生产者。

<MyImage src="/docs-img/springcloud-migration-2.png"/>

<MyImage src="/docs-img/springcloud-migration-1.png"/>

（3）关闭原生产者

（4）启动双注册消费者

```shell
# windows
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar

# mac, linux
java -Dserver.port=8261 -Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-registry-consumer.jar
```

> **说明：** 其中${path}需要替换为sermant实际包路径，x.x.x需要替换为sermant实际版本号，appName为agent的启动参数，与注册参数无关。

> **注意：** 为了便于测试，这里使用了-Dservicecomb.service.openMigration=true -Dservicecomb.service.enableSpringRegister=true的方式打开了spring迁移功能，如果使用了其它的[参数配置方式](../user-guide/sermant-agent.md#参数配置方式)打开了spring迁移开关，则无需添加该参数。为了便于观察，使用了-Dserver.port=8261的方式，修改了消费者的端口。

启动成功后，多次访问消费者接口`http://localhost:8161/hello`和`http://localhost:8261/hello`，确认2个接口能够访问双注册生产者。

<MyImage src="/docs-img/springcloud-migration-3.png"/>

<MyImage src="/docs-img/springcloud-migration-4.png"/>

（5）关闭原消费者

（6）停止旧的注册中心（ZooKeeper）

> **注意：**
>
> 关闭原注册中心，由于大部分注册中心存在心跳检查机制，实例可能会不断刷错误日志，但不影响应用的正常调用。
>
> 若需要停止此类错误日志，参考节[**关闭原注册中心心跳规则**](#关闭原注册中心心跳规则)。
> 
> 给生产者下发配置时，key值为**sermant.agent.registry**，group为**app=default&environment=&service=spring-cloud-registry-provider**，content为**origin.\_\_registry\_\_.needClose: true**。
>
> 给消费者下发配置时，key值为**sermant.agent.registry**，group为**app=default&environment=&service=spring-cloud-registry-consumer**，content为**origin.\_\_registry\_\_.needClose: true**。

#### 验证

<MyImage src="/docs-img/springcloud-migration-5.png"/>

生产者服务与消费者服务成功把注册中心迁移到了servicecomb中，且在注册中心的迁移过程中，生产者始终可以调用消费者，不需要中断服务。