# Plugin 

This article mainly introduces the plugins currently supported by Sermant.


[FlowControl Plugin](./flowcontrol.md) is based on the [resilience4j]((https://github.com/resilience4j)) framework and implements non-intrusive flow control based on the "traffic" entry point. Currently, **Traffic Limiting, Circuit Breaker, Bulkhead, Error Injection, and Retry** are supported. In addition, rules can be dynamically configured in the configuration center and take effect in real time.

[Loadbalancer Plugin](./loadbalancer.md) is based on the configuration in the configuration center, the loadbalance rules of the host application can be dynamically modified without intrusion.

[Dynamic Configuration Plugin](./dynamic-config.md) is based on the Sermant configuration center capability. During running, the configuration can be updated to the host application. The priority of the plugin is higher than that of the environment variable configuration.

[Registry Plugin](./registry/README.md) allows microservices that have been registered with popular registration centers, such as Eureka, Nacos, ZooKeeper, and Consul, to be registered with Service Center (opens new window)in a non-intrusive manner. It also supports Dubbo and SpringCloud frameworks.

[Graceful Online/Offline Plugin](./graceful.md) provides **warm-up** and **graceful offline** capabilities to solve the problem that instances that have just been launched are accessed by a large amount of traffic during initialization, resulting in request blocking, and even downtime and instance offline, due to registration discovery delays Refresh problem, unable to notify upstream in time, resulting in two problems of traffic loss or error.

[Tag Router Plugin](./router.md) can manage the routing between services by configuring routing rules when there are multiple versions and instances of microservices, so as to achieve business purposes such as non-destructive upgrades and application dialing tests.

[Monitor Plugin](./server-monitor.md) can monitor the usage of hardware resources such as CPU, memory, disk IO and network IO of the server where the host application is located, as well as the usage of the host application Java virtual machine and the Druid database connection pool used by it.