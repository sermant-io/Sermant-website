# 流量标签透传

本文介绍[流量标签透传插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-tag-transmission)及其使用方式。

## 功能介绍

流量标签在微服务流量治理的各个场景中发挥关键作用，我们可以通过不同的流量标签对流量进行分组，不同组别的流量施以不同的流量管理策略，例如全链路灰度发布、流控等场景。流量标签能够在流量治理领域发挥作用的一个关键前提是流量标签具备在整个调用链不中断地透传的能力。如下是一个HTTP报文中的请求头的示例，每一条header都可以作为一条流量标签，例如通过流量染色等方式自定义添加的`x-sermant-version: v1`，我们可以用它来表示该请求流量对应的版本信息。通过流量标签透传插件，可以将标签键为`x-sermant-version`的所有标签在整个调用链中全部透传下去，在全链路灰度发布、流控等场景发挥作用。

```shell
// HTTP报文中的请求头示例
Get /sermant/docs HTTP/1.1
Host: sermant.io
Connection: keep-alive
Content-Length: 100
Accept: application/json, text/plain, */*
Origin: https://sermant.io
User-Agent: Mozilla/5.0
Content-Type: application/json
Referer: https://sermant.io
Accept-Language: zh-CN,en-US;q=0.8
x-sermant-version: v1          // 自定义header，此处表示通过流量染色等方式添加了x-sermant-version: v1的标签
```

本插件着手于解决流量标签在各种不同传媒介中进行透传的问题，包括HTTP协议、RPC协议、消息队列等，借助header、attachment等载体把流量标签往下游透传。除了解决流量标签在跨进程场景中的透传，还实现在同一服务实例的线程内和跨线程透传的能力，打通了全链路的流量标签透传传播路径。该插件在使用时按照标签透传配置会将HTTP的header、Dubbo的attachment、grpc的metadata、kafka消息的header等包含的需要透传的标签键值对在整个调用链中进行透传。

本插件只包含流量标签的透传，不包含流量染色能力。如果需要流量染色能力，请参考[标签路由插件](./router.md)的相关介绍。

###  快速开始

本插件的快速上手使用教程可参考[操作和结果验证](#操作和结果验证)。

### 适用场景

以下列出本插件可以适用的部分场景

- 全链路灰度发布

  全链路灰度发布是一种软件发布策略，通过逐渐将新版本的应用程序或服务引入生产环境的方式，来确保稳定性和性能。这种方法可以最小化潜在问题的风险，因为我们可以逐步将新版本推送给一小部分用户或服务器，然后根据反馈逐渐扩大发布范围。

  本插件可和Sermant的[标签路由插件](./router.md)配合，实现流量染色、流量标签透传以及按标签进行路由的全链路灰度发布解决方案。主要使用流程为：

  （1）利用标签路由插件的染色功能，给入口流量染色，添加灰度标签(可选步骤，亦可使用API网关来进行染色)；

  （2）利用本插件的标签透传功能，将染色的灰度标签在调用链中进行透传；

  （3）利用标签路由插件的路由功能，使得灰度流量在正确的灰度泳道中流动。

- 基于流量标签的精细化流控

  流控是一种用于控制数据流量或请求频率的技术，旨在保护服务器、应用程序或服务免受过多请求或数据的压力，以确保它们能够正常运行且不会过载。

  本插件可和Sermant的[流控插件](./flowcontrol.md)以及[标签路由插件](./router.md)配合，实现流量染色、流量标签透传以及按标签进行流量管理的流控解决方案。主要使用流程为：

  （1）利用标签路由插件的染色功能，给入口流量染色，添加流量分组标签(可选步骤，亦可使用API网关来进行染色)；

  （2）利用本插件的标签透传功能，将染色的分组标签在调用链中进行透传；

  （3）利用流控插件的限流、熔断等流控能力，对不同流量标签的流量进行精细化的流控策略配置。

## 支持版本和限制

### 支持版本

流量标签透传插件支持目前支持三类跨进程透传媒介：HTTP、RPC以及消息队列。目前支持的各组件版本如下：

| 框架类型                 | 版本              |
| ------------------------ | ----------------- |
| Servlet                  | 3.0+              |
| Jetty                    | 8.x+              |
| Tomcat                   | 7.x+              |
| Spring Framework         | 4.x+              |
| Apache HttpClient        | 3.x, 4.x          |
| OKHttp2                  | 2.x               |
| HttpURLConnection        | 1.7.x+            |
| Dubbo                    | 2.6.x, 2.7.x, 3.x |
| GRPC                     | 1.13+             |
| SOFARPC                  | 5.x               |
| ServiceComb Java Chassis | 2.x               |
| RocketMQ                 | 4.8.x+, 5.x       |
| Kafka                    | 1.x, 2.x, 3.x     |

## 操作和结果验证

本节内容以SpringBoot示例微服务来介绍如何使用Sermant流量标签透传插件以及验证结果，本示例使用curl命令携带流量标签发起入口请求调用HTTP客户端应用，HTTP客户端应用再调用HTTP的服务端应用。在HTTP的服务端的返回结果中查看标签是否透传成功。

### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-tag-transmission-demo-2.0.0.tar.gz) Demo二进制产物压缩包

### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`http-client-demo.jar`和`http-server-demo.jar`。

### 3 部署应用

（1）启动HTTP客户端应用

```shell
# windows
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar http-client-demo.jar

# mac, linux
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar http-client-demo.jar
```

（2）启动HTTP服务端应用

```shell
# windows
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar http-server-demo.jar

# mac, linux
java -Dagent_service_dynamic_config_enable=false -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar http-server-demo.jar
```

> 说明：此处${path}为sermant-agent包所在路径。

### 4 验证

执行下面的命令，携带流量标签`id: 888`发起入口调用，以HTTP方式调用http-client-demo，http-client-demo将调用http-server-demo，最后返回输出结果。

```shell
// 执行命令发起入口调用，携带流量标签
curl --location --request GET 'http://127.0.0.1:9002/testHttpClient4' --header 'id: 888'
// 返回结果
Hello World! This is HTTP server. Received Traffic Tag is [ id : 888]
```

若结果如上输出，则说明流量标签透传生效，标签`id: 888`由入口请求经过http-client-demo透传至http-server-demo。

## 参数配置

### 插件静态配置

流量标签透传的静态配置文件位于Sermant构建的产品包下，可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/tag-transmission/config/config.yaml`找到该插件的配置文件， 配置如下所示：

```yaml
# 流量标签在各种通道间(http/rpc/消息队列等)传递的配置
tag.transmission.config:
  # 是否开启流量标签透传功能, 默认为true
  enabled: true
  # 需要透传的流量标签的key的匹配规则, 支持精确、前缀、后缀匹配
  matchRule:
    # 精确匹配规则，为列表形式。若列表中的某个元素与标签键相同，则表示该标签需要透传。示例值为["id", "name"]
    exact: ["id", "name"]
    # 前缀匹配规则，为列表形式。若列表中的某个元素是标签键的前缀，则表示该标签需要透传。示例值为["x-sermant-"]
    prefix: ["x-sermant-"]
    # 后缀匹配规则，为列表形式。若列表中的某个元素是标签键的后缀，则表示该标签需要透传。示例值为["-sermant"]
    suffix: ["-sermant"]

# 跨线程传递标签的配置
crossthread.config:
  # 是否需要在new Thread时透传流量标签，默认开启
  enabled-thread: true
  # 是否需要在普通线程池创建新的线程任务时透传流量标签，默认开启
  enabled-thread-pool: true
  # 是否需要在定时线程池创建新的线程任务时透传流量标签，默认开启
  enabled-scheduler: true
```

以上示例配置表示，如果流量标签中携带了`id: 1`、`name: huawei`、`x-sermant-version`、`group-sermant`等符合精确匹配、前缀匹配、后缀匹配规则的标签键，则该标签键值对会在请求链路中透传。

### 插件动态配置

流量标签透传插件支持通过动态配置中心进行配置发布，配置发布可以参考[动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html#发布配置)。动态配置模型中的`group`, `key`, `content` 分别对应如下：

- group

  group为**sermant/tag-transmission-plugin**，表示配置分组为流量标签透传插件

- key

  key为**tag-config**，表示流量标签透传相关的配置节点

- content

  content为具体的流量标签透传配置内容。动态配置与静态配置中的`tag.transmission.config`一致，遵循yaml的格式，参数说明参考上文。在运行时动态修改透传规则时需将该配置刷新至动态配置中心。若直接删除配置，则关闭标签透传能力。

  ```yaml
  enabled: true
  matchRule:
    exact: ["id", "name"]
    prefix: ["x-sermant-"]
    suffix: ["-sermant"]
  ```

每次动态配置成功下发后会覆盖原有静态配置或之前的动态配置，且立即生效。
