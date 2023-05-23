# 标签路由

本文介绍如何使用[标签路由插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-router)。

## 功能介绍
标签路由：以服务提供者应用为粒度配置路由规则，通过将某一个或多个服务的提供者划分到同一个分组，约束流量只在指定分组中流转，从而实现流量隔离的目的，可以作为蓝绿发布、灰度发布等场景的能力基础。

标签路由插件通过非侵入的方式实现微服务之间路由规则的配置以及管理。在微服务存在多个版本、多个实例的情况下，标签路由插件可以通过配置路由规则管理服务之间的路由，达到无损升级、应用拨测等业务目的。

## 参数配置

### Sermant-agent配置

标签路由插件需要在Sermant-agent中配置服务元数据（版本号、其它元数据），参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

- service.meta.version: 版本号，用来标识当前微服务的版本。

- service.meta.parameters: 其它元数据，用来给当前微服务打标签，形如k1:v1，k2:v2。

## 详细路由规则

标签路由插件基于动态配置中心进行配置发布，配置发布可以参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)。

其中key值为**servicecomb.routeRule.${yourServiceName}**，${yourServiceName}为目标应用的微服务名称（即spring.application.name/dubbo.application.name配置的值）。


group值为**app=${service.meta.application}&environment=${service.meta.environment}**，即应用配置。service.meta.application、service.meta.environment的配置请参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

> **说明：** 应用配置说明参考[CSE配置中心概述](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html)。

content值为具体的路由规则。

### 标签路由规则示例及说明如下：

```yaml
---
- precedence: 2 # 优先级，数字越大，优先级越高。
  match: # 请求匹配规则。0..N个，不配置表示匹配。每条匹配规则只允许存在一个attachments/headers/args。
    attachments: # dubbo attachment匹配。如果是http header匹配，需要配置为headers。
      id: # 属性名，使用时修改为具体的key，如果配置了多个key，那么所有的key规则都必须和请求匹配。
        exact: '1' # 配置策略，key的属性值等于1，详细配置策略参考配置策略表
        caseInsensitive: false # false:不区分大小写（默认）,true:区分大小写。配置为false时，将统一转为大写进行比较
  route: # 路由规则
    - weight: 20 # 权重值
      tags:
        version: 1.0.0 # 实例标记。满足标记条件的实例放到这一组。
    - weight: 80 # 权重值
      tags:
        version: 1.0.1 # 实例标记。满足标记条件的实例放到这一组。
- precedence: 1 # 优先级，数字越大，优先级越高。
  route:
    - weight: 20 # 权重值
      tags:
        group: red # 实例标记。满足标记条件的实例放到这一组。
    - weight: 80 # 权重值
      tags:
        group: green # 实例标记。满足标记条件的实例放到这一组。
```
> **注意：** 新增配置时，请去掉注释，否则会导致新增失败。

**上述路由规则解释：** attachments信息中id属性值为1的请求20%会路由到版本号为1.0.0的服务实例，80%会路由到版本号为1.0.1的服务实例。其他请求20%会路由到组名为red的服务实例，80%会路由到组名为green的服务实例。

|    参数键     |                          说明                           | 默认值 | 是否必须 |
|:----------:|:-----------------------------------------------------:|:---:|:----:|
| precedence |                    优先级，数字越大，优先级越高                     |  空  |  是   |
|   match    | 匹配规则，支持attachments（dubbo应用的attachents参数）/headers（http 请求头） |  空  |  否   |
|   exact    |            配置策略， 详细配置策略参考[配置策略表](#配置策略列表)             |  空  |  否   |
|   route    |                  路由规则，包括权重配置以及标签信息配置                  |  空  |  是   |
|   weight   |                          权重值                          |  空  |  是   |
|    tags    |                  标签信息，满足标记条件的实例放到这一组                  |  空  |  是   |

### 配置策略列表

|  策略名  |    策略值     |                                    匹配规则                                     |
|:-----:|:----------:|:---------------------------------------------------------------------------:|
| 精确匹配  |   exact    |                                  参数值等于配置值                                   |
|  正则   |   regex    | 参数值匹配正则表达式，由于部分正则表达式（如\w与\W等）区分大小写，所以使用正则策略时，请谨慎选择caseInsensitive（是否区分大小写）  |
|  不等于  |   noEqu    |                                  参数值不等于配置值                                  |
| 大于等于  |   noLess   |                                 参数值大于等于配置值                                  |
| 小于等于  | noGreater  |                                 参数值小于等于配置值                                  |
|  大于   |  greater   |                                  参数值大于配置值                                   |
|  小于   |    less    |                                  参数值小于配置值                                   |

## 支持版本和限制

框架支持：

- SpringCloud Edgware.SR2 - 2021.0.0

- Dubbo 2.6.x - 2.7.x

限制：

- 不支持异步调用

## 操作和结果验证

下面将演示如何使用标签路由插件，验证使用Sermant动态配置中心（zookeeper）为SpringCloud服务配置标签路由场景。

### 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases)/编译sermant包
  
- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/router-demo/spring-cloud-router-demo)spring-cloud-router-demo源码

- [下载](https://github.com/apache/servicecomb-service-center)ServiceComb（注册中心），并启动

- [下载](https://zookeeper.apache.org/releases.html#download)Zookeeper（动态配置中心），并启动

### 步骤一：编译打包spring-cloud-router-demo应用

在`${path}/Sermant-examples/router-demo/spring-cloud-router-demo`目录执行如下命令：

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/router-demo/spring-cloud-router-demo/spring-cloud-router-consumer/target`得到` spring-cloud-router-consumer.jar`包，在`${path}/Sermant-examples/router-demo/spring-cloud-router-demo/spring-cloud-router-provider/target`得到`spring-cloud-router-provider`包，在`${path}/Sermant-examples/router-demo/spring-cloud-router-demo/spring-cloud-router-zuul/target`得到`spring-cloud-router-zuul`包。

> 说明：${path}为spring-cloud-router-demo应用下载所在路径。

### 步骤二：部署应用

（1）启动zuul网关

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-zuul.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-zuul.jar
```

（2）启动消费者

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-consumer.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-consumer.jar
```

（3）启动生产者

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar
```

（4）启动标签生产者（版本为1.0.1，标签为group:gray）

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -Dservice_meta_version=1.0.1 -Dservice_meta_parameters=group:gray -Dserver.port=8163 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -Dservice_meta_version=1.0.1 -Dservice_meta_parameters=group:gray -Dserver.port=8163 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar
```

> **说明：** ${path}为sermant实际安装路径，x.x.x代表sermant某个版本号。

### 步骤三：查看服务注册情况

登录[ServiceComb](http://127.0.0.1:30103/)后台，查看服务是否注册成功。

<MyImage src="/docs-img/router-registry.png"/>

### 步骤四：发布配置

配置路由规则，参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)进行配置发布。

其中key值为**servicecomb.routeRule.spring-cloud-router-provider**，group为**app=default&environment=**，content为具体的路由规则，如下所示：

```yaml
---
- precedence: 1
  match:
    headers:
      id:
        exact: '1'
        caseInsensitive: false
  route:
    - tags:
        group: gray
      weight: 100
- precedence: 2
  match:
    headers:
      id:
        exact: '2'
        caseInsensitive: false
  route:
    - tags:
        version: 1.0.1
      weight: 100
```
**上述标签路由规则解释：** 请求头信息中id属性值为1的请求会路由到组名为gray的服务实例，id属性值为2的请求会路由到版本号为1.0.1的服务实例。

利用zookeeper提供的命令行工具进行配置发布。

1、在`${path}/bin/`目录执行以下命令创建节点`/app=default&environment=`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=
```

2、在`${path}/bin/`目录执行以下命令创建节点`/app=default&environment=/servicecomb.routeRule.spring-cloud-router-provider`并设置数据。

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=/servicecomb.routeRule.spring-cloud-router-provider "---
- precedence: 1
  match:
    headers:
      id:
        exact: '1'
        caseInsensitive: false
  route:
    - tags:
        group: gray
      weight: 100
- precedence: 2
  match:
    headers:
      id:
        exact: '2'
        caseInsensitive: false
  route:
    - tags:
        version: 1.0.1
      weight: 100"

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=/servicecomb.routeRule.spring-cloud-router-provider "---
- precedence: 1
  match:
    headers:
      id:
        exact: '1'
        caseInsensitive: false
  route:
    - tags:
        group: gray
      weight: 100
- precedence: 2
  match:
    headers:
      id:
        exact: '2'
        caseInsensitive: false
  route:
    - tags:
        version: 1.0.1
      weight: 100"
```

> 说明：`${path}`为zookeeper的安装目录。

### 验证

<MyImage src="/docs-img/router-result.png"/>

当启动以上4个应用并正确配置路由规则后，通过http客户端工具访问`http://127.0.0.1:8170/consumer/hello/rest`，可以发现，当请求头为id: 1或者id: 2时，会路由到版本为1.0.1的provider，当不满足以上条件时，会访问到版本为1.0.0的provider。