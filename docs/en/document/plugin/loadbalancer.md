# Load balancing

This document introduces load [balance plug-in](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-loadbalancer) method of use.

## Function Description

Dynamically modify the load balancing policies of host applications without incursion according to the configuration center.

## Parameter Settings

Load balancing can be dynamically configured based on the configuration center. To use this capability, you need to configure load balancing policies in the configuration center. The load balancing plug-in uses the traffic flag and **load balancing rules**. That is, to configure one rule, you need to configure both rules. The following describes the two configurations:

### Traffic tag

The traffic flag is used to mark the services that are currently valid. If the service is empty, all micro-services are applied. The configuration example is as follows:

**Configuration is the key:** ` servicecomb. MatchGroup. TestLb `

> Description of configuration keys:
>
> `servicecomb.matchGroup.` : indicates the fixed prefix of the traffic tag. All keys must be configured with the traffic tag for the prefix
>
> `testLb` : indicates the service scenario name. The corresponding load balancing rules must be configured with the same service scenario name

**Configuration content:**

```yaml
alias: loadbalancer-rule
matches:
- serviceName: zk-rest-provider # Target service name
```

Example rule description: 'serviceName' is the name of the downstream service, that is, the micro service `zk-rest-provider` will apply the matching load balancing rule to the request. If serviceName is not configured, it applies to all micro-services. Note that this configuration only requires the `serviceName` configuration item. The other formats must remain the same.

> Priority Description: If multiple load balancing rules are configured, the plug-in preferentially matches the load balancing rule with the configured service name. Otherwise, the load balancing rule with the unconfigured service name is used.

### Load balancing rule

Load balancing policies must be configured for applications. Currently, load balancing policies depend on the load balancing policies existing in the host, that is, they can be configured only when supported by the host. For the supported list, see [Supported Versions and Restrictions](#support-versions-and-restrictions).

**Configuration is the key:** ` servicecomb. Loadbalance. TestLb `

> Description of configuration keys:
>
> `servicecomb.loadbalance.` : indicates the fixed prefix of load balancing rules. All keys must be configured with the prefix of load balancing rules
>
> `testLb` : indicates the service scenario name. The value takes effect only when it is the same as the service scenario marked with traffic

**Configuration content:**

```yaml
rule: Random
```

Example configuration items are described as follows: **Random load balancing rules**. For the configuration values, see **Configuration values** in [Supported Versions and Restrictions](#support-versions-and-restrictions)

> Check the framework version of the host application to determine the current load balancing policy.

### Publish the configuration

For details about how to release load balancing configurations, see the [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#publish-configuration)

By default, the load balancing plugin will have three types of subscription label publications:

- Custom tags: The default tag `public=default` is subscribed. You can also modify the custom tags by setting environment variables. Add the following parameters to the startup parameter: `-Dservice.meta.customLabel=public -Dservice.meta.customLabelValue=default`
- Micro-service tags: The default is to subscribe to the `app=default&service=${yourServiceName}&environment=` tag, where `${yourServiceName}` is the name of the micro-service and `environment` is empty by default. Of course, you can also use environment variables to change the startup parameter, add the following parameters: ` - Dservice.Meta.Application=default -Dservice.Meta.Environment=${yourEnvironment}`, corresponding `app` and `envrionment`, called dynamic access and service.
- Application tags: By default, the subscription tag `app=default&&environment=`, `environment` is empty by default, and the configuration of environment variables is the same as **micro service tags**.

### Version description

- Before spring cloud 2020.0.x, The default core component of spring cloud load balancing is Spring-cloud-netflix-Ribbon (Host applications can use spring-cloud-loadbalancer by excluding ribbon-related components). Starting from spring cloud 2020.0.x, the core component of load balancing is Spring-cloud-loadbalancer.

- Before spring cloud Hoxton.SR10, the only load balancing policy for spring-cloud-loadbalancer is ROUND_ROBIN. Therefore, the plug-in does not support modifying the load balancing policy of the spring-cloud-loadbalancer component before Hoxton. Earlier versions of spring cloud Hoxton.SR10 recommend the Spring-cloud-Netflix-ribbon component for load balancing.

## Support versions and restrictions

| | frame type policy name | | version support configuration values/load balancing strategy                                  |
| --------------------------- | ---------------------------- | ---------------------------------------------- |  ------------------------------------------------------------ |
| dubbo Random dubbo (default) | | the Random/Random | 2.6 x. 2.7 x |
| dubbo | polling | RoundRobin/RoundRobin | 2.6 x. 2.7 x |
| dubbo | | the least active leastActive/leastActive | 2.6 x. 2.7 x |
| dubbo | consistency HASH | consistentHash/consistentHash | 2.6 x. 2.7 x |
| | dubbo | the shortest response time shortestResponse/shortestResponse | 2.7.7 +                                                |
| spring - the cloud - netflix - ribbon (ribbon default) | | area weight zoneAvoidance/ZONE_AVOIDANCE | ZONE_AVOIDANCEspring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon Random | | the Random/Random | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon | polling | RoundRobin/ROUND_ROBIN | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon try again | | retry/retry | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon lowest concurrent | | bestAvailable/BEST_AVAILABLE | spring cloud  Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon | filtered polling | availabilityFiltering/AVAILABILITY_FILTERING | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon weighted weight (Deprecated) | | response time ResponseTimeWeighted/RESPONSE_TIME_WEIGHTED | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - the cloud - netflix - ribbon weighted heavy | | response time weightedResponseTime/WEIGHTED_RESPONSE_TIME | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| spring - cloud - loadbalancer | polling (loadbalancer default) | RoundRobin/ROUND_ROBIN | spring cloud Hoxton SR10 +, spring cloud 2020.0 x, spring cloud 2021.0 x |
| spring - cloud - loadbalancer Random | | the Random/Random | spring Cloud Hoxton SR10 +, spring cloud 2020.0 x, spring cloud 2021.0 x |

## Operation and result verification

### Environmental preparation

- JDK1.8 or higher
- Maven
- The download is complete [demo source code](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-register)
- Compiled and packaged a sermant
- [download](https://zookeeper.apache.org/releases.html#download) and start the zookeeper
- Enable backend. For details, see [Introduction to Backend Modules](../user-guide/backend.md)

### Compile and package the demo application
```shell
mvn clean package
```

### Publish traffic flag
Refer to the grayscale strategy used in [Publish Configuration](#publish-the-configuration) to deliver the following configuration

```json
{
"content": "alias: loadbalancer-rule\nmatches:\n- serviceName: zk-rest-provider",
"group": {
"app": "default",
"environment": "",
"service": "zk-rest-consumer"
},
"key": "servicecomb.matchGroup.testLb"
}
```

### Publish matching load balancing rules (take Random as an example)
Refer to the grayscale strategy used in [Publish Configuration](#publish-the-configuration) to deliver the following configuration

```json
{
"content": "rule: Random",
"group": {
"app": "default",
"environment": "",
"service": "zk-rest-consumer"
},
"key": "servicecomb.loadbalance.testLb"
}
```

### Start demo application
Refer to the following command to start the producer

```shell
java -javaagent:${agent path}\agent\sermant-agent.jar=appName=default -Dserver.port=${port} -jar  zk-rest-provider.jar
```
Where, `path` needs to be replaced with Sermant actual packaging path, and `port` is producer port. Here, two instances need to be started. Please configure different ports respectively, which is conducive to the observation of results

Start the consumer with the following command (an instance is fine)

```shell
java -javaagent:${agent path}\agent\sermant-agent.jar=appName=default -Dserver.port=8005 -jar  zk-rest-consumer.jar
```

### Verify

After all the preceding steps are complete, access the interface `localhost:8005/hello` and check whether the random load balancing rule (polling by default) takes effect based on the returned port.