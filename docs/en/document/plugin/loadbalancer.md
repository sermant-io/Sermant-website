# Load balancing

This article describes how to use [Load balancing plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-loadbalancer).

## Function introduction

The load balancing plug-in is mainly used to dynamically modify the load balancing policy of the host application without invasion.

## Parameter configuration

### Plug-in configuration

The load balancing plug-in needs to configure the default load balancing policy, whether to force the use of plug-in load balancing and other information. The configuration file of the plug-in can be found in the `${path}/sermant-agent-x.x.x/agent/pluginPackage/loadbalancer/config/config.yaml`. The configuration is as follows:

```yml
loadbalancer.plugin:
    defaultRule:          # Default load balancing policy. When no load balancing policy is configured, the default load balancing policy is used.
    forceUseSermantLb:    # Whether to force the use of plug-in load balancing. The load balancing plug-in determines whether to force the modification of the user's load balancing policy through this configuration. The current configuration is only valid for Ribon. Ribon may have its own load balancing configuration. If you do not want to affect your own load balancing configuration, you can set it to false.
    useCseRule:           # Whether to use CSE rules. The load balancing plugin subscribes to different dynamic configuration paths based on whether to use CSE rules.
```

| Parameter key                         | Description                                        | Default value | Required |
|---------------------------------------|----------------------------------------------------|---------------|----------|
| Loadbalancer.plugin.defaultRule       | Default load balancing policy                      | Empty         | No       |
| Loadbalancer.plugin.forceUseServantLb | Whether to force the use of plug-in load balancing | true          | No       |
| Loadbalancer.plugin.useCseRule        | Whether to use cse rule                            | true          | No       |

## Detailed governance rules

The load balancing plug-in publishes the configuration based on the dynamic configuration center. For configuration publishing, please refer to the [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#publish-configuration).

The dynamic configuration information to be configured for the load balancing plug-in is as follows:

- servicecomb.matchGroup.xxx: traffic token (dynamically configured key value). It is used to mark the services for which the current business scenario is effective. Its corresponding content is

```yaml
alias: loadbalancer-rule
matches:
  -serviceName: zk-rest-provider  # Target service name
```
`serviceName`is the downstream service name. If the configuration item `serviceName` is not configured, it will be applied to all microservices. It should be noted that only the `serviceName` configuration item needs to be configured for this configuration, and other formats need to remain unchanged.

- servicecomb.loadbalance. xxx: Load balancing rule (dynamically configured key value). It is used to configure the load balancing rules that take effect in specific business scenarios. Its corresponding content is

```yaml
rule: Random
```

> Note: **xxx is the name of the specific business scenario, and the load balancing policy takes effect when the traffic marking and load balancing policy scenarios are consistent**.

For the range of configuration values, see **Configuration Values** in Table [Supported Versions and Restrictions](#supported-versions-and-restrictions).

The load balancing plug-in supports two levels of group configuration by default:

- Microservice level: that is, the value of group is `app=default&environment=&service=${yourServiceName}`, where `${yourServiceName}` is the microservice name obtained dynamically, and `environment` is empty by default. You can refer to [Parameter Configuration Method](../user-guide/sermant-agent.md#parameter-configuration-options) to change `app` and `envrionment`.

- Application level: that is, the value of group is `app=default&environment=`, and `environment` is empty by default. The environment variable configuration method is the same as **microservice level**.

## Supported versions and restrictions

| Framework type              | policy name                    | configuration value/load balancing policy      | version support                                                                                                 |
|-----------------------------|--------------------------------|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Dubbo                       | Random (dubbo default)         | Random/RANDOM                                  | 2.6. x, 2.7. x                                                                                                  |
| Dubbo                       | Polling                        | RoundRobin/ROUNDROBIN                          | 2.6. x, 2.7. x                                                                                                  |
| Dubbo                       | least active                   | leastActive/LEASTACTIVE                        | 2.6. x, 2.7. x                                                                                                  |
| Dubbo                       | Consistency HASH               | consistentHash/CONSISTENTHASH                  | 2.6. x, 2.7. x                                                                                                  |
| Dubbo                       | shortest response time         | shortestResponse/SHORTESTRESPONSE              | 2.7.7+                                                                                                          |
| Spring-cloud-netflix-ribbon | region weight (ribbon default) | zoneAvoidance/ZONE_ AVOIDANCE                  | ZONE_ AVOIDANCEspring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x |
| Spring-cloud-netflix-ribbon | Random                         | Random/RANDOM                                  | spring cloud Edgware. x, spring cloud Finchley. x, spring cloud Greenwich. x, spring cloud Hoxton. x            |
| Spring-cloud-netflix-ribbon | Polling                        | RoundRobin/ROUND_ ROBIN                        | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x                |
| Spring-cloud-netflix-ribbon | Retry                          | retry/RETRY                                    | spring cloud Edgware. x, spring cloud Finchley. x, spring cloud Greenwich. x, spring cloud Hoxton. x            |
| Spring-cloud-netflix-ribbon | Minimum concurrency            | bestAvailable/BEST_ AVAILABLE                  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x                |
| Spring cloud netflix rib    | filter polling                 | availability filtering/AVAILABILITY_ FILTERING | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x                |
| Spring-cloud-netflix-ribbon | Response time weighted         | ResponseTimeWeighted/RESPONSE_ TIME_ WEIGHTED  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x                |
| Spring-cloud-netflix-ribbon | weighted response time         | weightedResponseTime/WEIGHTED_ RESPONSE_ TIME  | spring cloud Edgware.x, spring cloud Finchley.x, spring cloud Greenwich.x, spring cloud Hoxton.x                |
| Spring-cloud-loadbalancer   | Polling (loadbalancer default) | RoundRobin/ROUND_ ROBIN                        | spring cloud Hoxton.SR10+, spring cloud 2020.0.x, spring cloud 2021.0.x                                         |
| Spring cloud loader         | random                         | Random/RANDOM                                  | spring cloud Hoxton. SR10+, spring cloud 2020.0. x, spring cloud 2021.0. x                                      |

## Operation and result verification

The following will demonstrate how to use the load balancing plug-in.

### Preparations

- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template/demo-register) demo source code

- [Download](https://github.com/huaweicloud/Sermant/releases)/compile the sermant package

- [Download](https://zookeeper.apache.org/releases.html#download) And start zookeeper

### Step 1: Compile and package the demo application

Execute the following command in the `${path}/Sermant-examples/sermant-template/demo-register` directory:

```shell
mvn clean package
```

After successful packaging, you can get the `resttemplate-consumer.jar` package in `${path}/Sermant-examples/sermant-template/demo-register/resttemplate-consumer/target`, in `${path}/Sermant-examples/ sermant-template/demo-register/resttemplate-provider/target` gets `resttemplate-provider.jar`.

> Note: path is the path where the demo application is downloaded.

### Step 2: Publish traffic tags

Refer to the [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#publish-configuration) for configuration publishing, and publish the following configuration

```json
{
    "content": "alias: loadbalancer-rule\n matches:\n- serviceName: zk-rest-provider", 
    "group": "app=default&environment=&service=zk-rest-consumer", 
    "key": "servicecomb.matchGroup.testLb"
}
```
Take Zookeeper as an example, and use the command line tools provided by Zookeeper for configuration publishing.

1. Execute the following command in the `${path}/bin/` directory to create the node `/app=default&environment=&service=zk-rest-consumer`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=&service=zk-rest-consumer

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=&service=zk-rest-consumer
```

> Note: `${path}` is the installation directory of zookeeper

2. Execute the following command in the `${path}/bin/` directory to create nodes `/app=default&environment=&service=zk-rest-consumer/servicecomb.matchGroup.testLb` and data `alias: loadbalancer-rule\n matches:\n- serviceName: zk-rest-provider`.

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=/servicecomb.routeRule.spring-cloud-router-provider "alias: loadbalancer-rule
matches:
- serviceName: zk-rest-provider"

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=/servicecomb.routeRule.spring-cloud-router-provider "alias: loadbalancer-rule
matches:
- serviceName: zk-rest-provider"
```

### Step 3: Publish matching load balancing rules (take Random as an example)

Refer to the [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#publish-configuration) for configuration publishing, and publish the following configuration

```json
{
    "content": "rule: Random", 
    "group": "app=default&environment=&service=zk-rest-consumer", 
    "key": "servicecomb.loadbalance.testLb"
}
```

Taking zookeeper as an example, use the PrettyZoo tool to publish the load balancing strategy:

Take Zookeeper as an example, and use the command line tools provided by Zookeeper for configuration publishing.

1. Execute the following command in the `${path}/bin/` directory to create nodes `/app=default&environment=&service=zk-rest-consumer/servicecomb.loadbalance.testLb` and data `rule: Random`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=&service=zk-rest-consumer/servicecomb.loadbalance.testLb "rule: Random"

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=&service=zk-rest-consumer/servicecomb.loadbalance.testLb "rule: Random"
```

### Step 4: Start the demo application

Refer to the following command to start two producers

- Refer to the following command to start the service provider, the port is 8006
```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dserver.port=8006 -jar resttemplate-provider.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dserver.port=8006 -jar resttemplate-provider.jar
```

- Refer to the following command to start the service provider, the port is 8007

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dserver.port=8007 -jar resttemplate-provider.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dserver.port=8007 -jar resttemplate-provider.jar
```

- Refer to the following command to start the consumer (one instance is enough), the port is 8005

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dserver.port=8005 -jar resttemplate-consumer.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dserver.port=8005 -jar resttemplate-consumer.jar
```

> **illustrate**:
> Where path needs to be replaced with the actual installation path of Sermant.
> x.x.x represents a Sermant version number.

### Verification
After all the above steps are completed, access the interface <http://localhost:8005/hello>, multiple calls. If 8006 and 8007 are randomly displayed in the returned port information, it means that the random load balancing rule (polling by default) has taken effect.

The renderings are as follows:

<MyImage src="/docs-img/loadbanlance1.png"/>
<MyImage src="/docs-img/loadbanlance2.png"/>