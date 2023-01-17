# Plugin 

This article mainly introduces the plugins currently supported by Sermant.

[Dynamic Configuration Plugin](./dynamic-config.md) is based on the Sermant configuration center capability. During running, the configuration can be updated to the host application. The priority of the plugin is higher than that of the environment variable configuration.

[FlowControl Plugin](./flowcontrol.md) is based on the [resilience4j]((https://github.com/resilience4j)) framework and implements non-intrusive flow control based on the "traffic" entry point. Currently, **Traffic Limiting, Circuit Breaker, Bulkhead, Error Injection, and Retry** are supported. In addition, rules can be dynamically configured in the configuration center and take effect in real time.

[Graceful Online/Offline Plugin](./graceful.md) provides **warm-up** and **graceful offline** capabilities to solve the problem that instances that have just been launched are accessed by a large amount of traffic during initialization, resulting in request blocking, and even downtime and instance offline, due to registration discovery delays Refresh problem, unable to notify upstream in time, resulting in two problems of traffic loss or error.

[Loadbalancer Plugin](./loadbalancer.md) is based on the configuration in the configuration center, the loadbalance rules of the host application can be dynamically modified without intrusion.

[Monitor Plugin](./monitor.md) can monitor the usage of hardware resources such as CPU, memory, disk IO and network IO of the server where the host application is located, as well as the usage of the host application Java virtual machine and the Druid database connection pool used by it.

[Tag Router Plugin](./router.md) can manage the routing between services by configuring routing rules when there are multiple versions and instances of microservices, so as to achieve business purposes such as non-destructive upgrades and application dialing tests.

[Registry Plugin](./registry/README.md) allows microservices that have been registered with popular registration centers, such as Eureka, Nacos, ZooKeeper, and Consul, to be registered with ServiceComb (opens new window)in a non-intrusive manner. It also supports Dubbo and SpringCloud frameworks.

### Compatibility List

|Plugin|Microservice Framework Supported|Configuration Center Supported|Registration Center Supported|
|:-:|:-:|:-----|:--|:--|:--|
|[Dynamic Configuration Plugin](./dynamic-config.md)|SpringBoot 1.5.x - 2.6.2<br>spring-cloud-starter-alibaba-nacos-config 1.5.0.RELEASE+<br>spring-cloud-starter-zookeeper-config 1.2.0.RELEASE+|servicecomb-kie<br/>ZooKeeper|N/A|
|[FlowControl Plugin](./flowcontrol.md)|SpringBoot 1.2.x - 2.6.x <br> SpringWebMvc 4.1.3.RELEASE - 5.3.x<br>Dubbo 2.6.x-2.7.x|servicecomb-kie<br>ZooKeeper|N/A|
|[Graceful Online/Offline Plugin](./graceful.md)|SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-kie<br/>ZooKeeper|N/A|
|[Loadbalancer Plugin](./loadbalancer.md)|SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-kie<br/>ZooKeeper|N/A|
|[Monitor Plugin](./monitor.md)|ALL|N/A|N/A|
|[Tag Router Plugin](./router.md)|SpringBoot 1.5.x - 2.6.2 <br/>SpringCloud Edgware.SR2 - 2021.0.0<br/>Dubbo 2.6.x-2.7.x|servicecomb-kie|servicecomb-service-center|
|[Registry Plugin](./registry/README.md)|SpringBoot 1.5.x - 2.6.2 <br> SpringCloud Edgware.SR2 - 2021.0.0<br>Dubbo 2.6.x-2.7.x|N/A|servicecomb-service-center|
|[SpringBoot Registration Plugin](./registry/springboot-registry.md)|SpringBoot 1.5.10.Release+|servicecomb-kie<br/>ZooKeeper|Zookeeper 3.4.x+|
|[Service visibility Plugin](./visibility.md)|SpringBoot 1.5.10+<br>Dubbo 2.6.x-2.7.x|ZooKeeper|N/A|