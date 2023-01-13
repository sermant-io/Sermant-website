# 服务注册

本文主要介绍[服务注册插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry)以及该插件的使用方法。

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