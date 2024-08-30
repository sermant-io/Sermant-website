# Plugin 

This article mainly introduces the plugins currently supported by Sermant.

### Basic service registration discovery and real-time configuration categories:

[Dynamic Configuration Plugin](./dynamic-config.md) is based on the Sermant configuration center capability. During running, the configuration can be updated to the host application. The priority of the plugin is higher than that of the environment variable configuration.

[SpringBoot Registration Plugin](./springboot-registry.md): Pure SpringBoot applications provide service registration discovery capabilities, allowing users to quickly access the registration center without modifying the code (currently only **Zookeeper** is supported). It also provides the ability to retry after timeout to achieve high availability of service calls.

[Registry Plugin](./service-registry.md) allows microservices that have been registered with popular registration centers, such as Eureka, Nacos, ZooKeeper, and Consul, to be registered with [ServiceComb](https://github.com/apache/servicecomb-service-center) or [Nacos](https://nacos.io/) in a non-intrusive manner. It also supports Dubbo and SpringCloud frameworks.

### Limiting, downgrade and serviceability categories:

[FlowControl Plugin](./flowcontrol.md) is based on the [resilience4j]((https://github.com/resilience4j)) framework and implements non-intrusive flow control based on the "traffic" entry point. Currently, **Traffic Limiting, Circuit Breaker, Bulkhead, Error Injection, and Retry** are supported. In addition, rules can be dynamically configured in the configuration center and take effect in real time.

[Graceful Startup/Shutdown Plugin](./graceful.md) provides **warm-up** and **graceful offline** capabilities to solve the problem that instances that have just been launched are accessed by a large amount of traffic during initialization, resulting in request blocking, and even downtime and instance offline, due to registration discovery delays Refresh problem, unable to notify upstream in time, resulting in two problems of traffic loss or error.

[Outlier Instance Removal](./removal.md): The Outlier Instance Removal plugin detects the availability of application instances in a non-intrusive manner and performs removal operations on anomalous application instances to ensure service stability.

### Application traffic routing categories:

[Loadbalancer Plugin](./loadbalancer.md) is based on the configuration in the configuration center, the loadbalance rules of the host application can be dynamically modified without intrusion.

[Tag Router Plugin](./router.md) can manage the routing between services by configuring routing rules when there are multiple versions and instances of microservices, so as to achieve business purposes such as non-destructive upgrades and application dialing tests.

[Traffic Tag Transmission](./tag-transmission.md): Provides full-link transmission capability for traffic tags to meet traffic management needs.

### Application Observable categories:

[Monitor Plugin](./monitor.md) can monitor the usage of hardware resources such as CPU, memory, disk IO and network IO of the server where the host application is located, as well as the usage of the host application Java virtual machine and the Druid database connection pool used by it.

[Service visibility Plugin](./visibility.md): Provides contract information and blood relationship collection and display functions for Spring Cloud and Dubbo applications, allowing users to view the interface information provided by all services and the calling relationship information between services through the Sermant Backend without modifying the code.

## Multi-Active and Disaster Recovery

[MQ Consume Prohibition](./mq-consume-prohibition.md): Used to disable and re-enable message queue consumers at runtime, ensuring that message queues temporarily stop being consumed during system upgrades, failures, data synchronization, or migration scenarios.

[Database Write Prohibition Plugin](./database-write-prohibition.md): Used to prohibit writing to a specified database during service runtime, ensuring database data consistency in multi-cloud, multi-active scenarios.

### Compatibility List

|                            Plugin                            | Microservice Framework Supported                             | Configuration Center Supported          | Registration Center Supported        |
| :----------------------------------------------------------: | :----------------------------------------------------------- | :-------------------------------------- | :----------------------------------- |
|     [Dynamic Configuration Plugin](./dynamic-config.md)      | SpringBoot 1.5.x - 2.6.2<br>spring-cloud-starter-alibaba-nacos-config 1.5.0.RELEASE+<br>spring-cloud-starter-zookeeper-config 1.2.0.RELEASE+ | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|  [SpringBoot Registration Plugin](./springboot-registry.md)  | SpringBoot 1.5.10.Release+                                   | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | Zookeeper 3.4.x+                     |
|           [Registry Plugin](./service-registry.md)           | SpringBoot 1.5.x - 2.6.2 <br> SpringCloud Edgware.SR2 - 2021.0.0<br>Dubbo 2.6.x-2.7.x | N/A                                     | ServiceComb-Service-Center<br/>Nacos |
|            [FlowControl Plugin](./flowcontrol.md)            | SpringBoot 1.2.x - 2.6.x <br> SpringWebMvc 4.1.3.RELEASE - 5.3.x<br>Dubbo 2.6.x-2.7.x | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|      [Graceful Startup/Shutdown Plugin](./graceful.md)       | SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0 | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|           [Outlier Instance Removal](./removal.md)           | SpringBoot 1.5.10.Release+<br>Dubbo 2.6.x-2.7.x              | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|           [Loadbalancer Plugin](./loadbalancer.md)           | SpringBoot 1.5.x - 2.6.2 <br/> SpringCloud Edgware.SR2 - 2021.0.0 | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|               [Tag Router Plugin](./router.md)               | SpringBoot 1.5.x - 2.6.2 <br/>SpringCloud Edgware.SR2 - 2021.0.0<br/>Dubbo 2.6.x-2.7.x | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | ServiceComb-Service-Center           |
|      [Traffic Tag Transmission](./tag-transmission.md)       | Servlet 3.0+<br>Jetty 8.x+<br>Tomcat 7.x+<br>Spring Framework 4.x+<br>Apache HttpClient 3.x, 4.x<br>OKHttp2 2.x<br/>HttpURLConnection 1.7.x+<br/>Dubbo 2.6.x, 2.7.x, 3.x<br/>Grpc 1.13+<br/>SofaRpc 5.x<br/>ServiceComb Java Chassis 2.x<br/>RocketMQ 4.8.x+, 5.x<br/>Kafka 1.x, 2.x, 3.x | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|                [Monitor Plugin](./monitor.md)                | ALL                                                          | N/A                                     | N/A                                  |
|         [Service visibility Plugin](./visibility.md)         | SpringBoot 1.5.10.Release+<br>Dubbo 2.6.x-2.7.x              | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
|    [MQ Consume Prohibition](./mq-consume-prohibition.md)     | Kafka 1.x, 2.x<br>RocketMQ 4.8.x-5.1.x                       | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |
| [Database Write Prohibition Plugin](./database-write-prohibition.md) | mongodb-driver-sync 2.6.2-2.7.x, 3.0.x-3.3.x<br>mariadb-java-client 3.7.x-3.11.x, 4.0.x-4.11.x<br/>opengauss-jdbc 3.0.x, 3.1.x<br/>postgresql 9.4.x, 42.0.x-42.7.x | ServiceComb Kie<br/>ZooKeeper<br/>Nacos | N/A                                  |