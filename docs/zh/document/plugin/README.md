# 插件介绍

本文主要介绍目前Sermant支持的插件。

[动态配置插件](./dynamic-config.md)：基于Sermant配置中心能力实现动态配置，可在运行时将配置刷新到宿主应用，其优先级将高于环境变量配置。

[流控插件](./flowcontrol.md): 基于resilience4j框架，以"流量"切入点，实现"无侵入式"流量控制；当前支持限流、熔断、隔离仓、错误注入与重试能力，并且支持配置中心动态配置规则，实时生效。

[优雅上下线插件](./graceful.md)：提供**预热**与**优雅下线**能力，来解决刚上线的实例，在初始化时便被大量流量访问，导致请求阻塞，甚至宕机和实例下线时，因注册发现延迟刷新问题，无法及时告知上游，导致流量丢失或者错误的两个问题。

[负载均衡插件](./loadbalancer.md)：基于配置中心进行动态配置，采用**流量标记+负载均衡规则**的方式规则，即配置一条规则需**同时配置两者**，因此使用该能力需在配置中心配置对应负载均衡策略。

[监控插件](./monitor.md)：用于监控宿主应用所在服务器的CPU、内存、磁盘IO和网络IO等硬件资源的使用情况，以及宿主应用Java虚拟机和微服务公共指标情况。

[标签路由插件](./router.md)：在微服务存在多个版本、多个实例的情况下，通过配置路由规则管理服务之间的路由，达到无损升级、应用拨测等业务目的。

[注册插件](./registry/README.md)：提供代码无侵入方式，可让原本注册于Eureka，Nacos，Zookeeper、Consul等主流注册中心的微服务，无侵入地注册到[Service Center](https://github.com/apache/servicecomb-service-center)上, 同时支持Dubbo与SpringCloud框架。

### 当前功能列表

|功能名称|微服务框架组件支持列表|配置中心支持列表|注册中心支持列表|
|:-:|:-----|:--|:--|
|[动态配置](./dynamic-config.md)|SpringBoot 1.5.x - 2.6.2<br>spring-cloud-starter-alibaba-nacos-config 1.5.0.RELEASE+<br>spring-cloud-starter-zookeeper-config 1.2.0.RELEASE+|servicecomb-kie<br/>ZooKeeper|N/A|
|[限流降级](./flowcontrol.md)|SpringBoot 1.2.x - 2.6.x <br> SpringWebMvc 4.1.3.RELEASE - 5.3.x<br>Dubbo 2.6.x-2.7.x|servicecomb-kie<br>ZooKeeper|N/A|
|[优雅上下线](./graceful.md)|SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-kie<br/>ZooKeeper|N/A|该功能基于SpringCloud默认负载均衡实现，若实现自定义负载均衡，该能力将失效|
|[负载均衡](./loadbalancer.md)|SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-kie<br/>ZooKeeper|N/A|
|[服务监控](./monitor.md)|ALL|N/A|N/A|
|[标签路由](./router.md)|SpringBoot 1.5.x - 2.6.2 <br/>SpringCloud Edgware.SR2 - 2021.0.0<br/>Dubbo 2.6.x-2.7.x|servicecomb-kie|servicecomb-service-center|不支持异步调用<br>不支持混合框架（Dubbo调SpringCloud或者SpringCloud调Dubbo）做路由|
|[服务注册](./registry/README.md)|SpringBoot 1.5.x - 2.6.2 <br> SpringCloud Edgware.SR2 - 2021.0.0<br>Dubbo 2.6.x-2.7.x|N/A|servicecomb-service-center|
|[服务双注册迁移](./registry/spring-cloud-registry-migiration.md)|SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0<br>Dubbo 2.6.x-2.7.x|N/A|**目标注册中心**支持：servicecomb-service-center<br/>**SpringCloud原注册中心**支持：Eureka、Nacos、Zookeeper、Consul<br/>**Dubbo原注册中心**支持：Nacos、Zookeeper|
|[SpringBoot服务注册与发现](./registry/springboot-registry.md)|SpringBoot 1.5.10.Release+|servicecomb-kie<br/>ZooKeeper|Zookeeper 3.4.x+|