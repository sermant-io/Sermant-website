# SpringBoot Registry

This article describes how to use the [SpringBoot registry plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-springboot-registry).

## Function

This plugin provides service registration and discovery abilities for pure SpringBoot applications. Users can quickly access the registration center(Currently only Zookeeper is supported) without modifying code. In addition, the plugin also provides the service timeout retry ability, achieving high availability of service invocation.

The plug-in will resolve the downstream service according to the Url called by the originating client, select the preferred instance according to the load balance, dynamically replace the Url, and complete the service call.

Currently, URL formats are supported.：http://${domainName}/${serviceName}/${apiPath}

Just like the URL above, `domainName` indicates the domain name, `serviceName` indicates the downstream service name, and `apiPath` indicates the downstream request interface path.


## Plugin configuration

SpringBoot Registry plugin requires modification of the plugin configuration file on demand, which can be found in the path `${path}/agent/pluginPackage/springboot-registry/config/config.yaml`. The configuration file for the plugin is shown below:

```yaml
sermant.springboot.registry:
  enableRegistry: false                 # Whether to enable the boot registration capability
  realmName: www.domain.com             # Match the domain name, the current version only takes effect for the scene where the url is http://${realmName}/serviceName/api/xx
  enableRequestCount: false             # Whether to enable traffic statistics. After enabling, the traffic entering the plug-in will be counted every time
     
sermant.springboot.registry.lb:     
  lbType: RoundRobin                    # Load balancing type, currently supports round robin (RoundRobin), random (Random), response time weight (WeightedResponseTime), minimum concurrency (BestAvailable)
  registryAddress: 127.0.0.1:2181       # Registration center address
  instanceCacheExpireTime: 0            # Instance expiration time, in seconds, if <=0, it will never expire
  instanceRefreshInterval: 0            # Instance refresh time, in seconds, must be less than instanceCacheExpireTime
  refreshTimerInterval: 5               # Instance timing check interval to determine whether the instance is expired, if it is greater than instanceRefreshInterval, then the value is set to instanceRefreshInterval
  enableSocketReadTimeoutRetry: true    # Whether to retry for {@link java.net.SocketTimeoutException}: read timed out, enabled by default
  enableSocketConnectTimeoutRetry: true # Same as above, mainly for connect timed out, usually thrown when the connection is not upstream or downstream
  enableTimeoutExRetry: true            # Retry scenario, for {@link java.util.concurrent.TimeoutException}, whether retry is required, enabled by default, this timeout is mostly used in asynchronous scenarios, such as Future, MinimalHttpAsyncClient
```

The configuration items are described as follows:

|Parameter Key|Description|Default Value|Required|
|---|---|---|---|---|
|sermant.springboot.registry.enableRegistry|Whether to enable springboot registration capability (true/false)|false|Yes|
|sermant.springboot.registry.realmName|Matching domain name, current version only works for **http://${realmName}/serviceName/api/xx** scenario|www.domain.com|Yes|
|sermant.springboot.registry.enableRequestCount|Whether to enable traffic statistics. After enabling, the traffic entering the plug-in will be counted every time (true/false)|false|Yes|
|sermant.springboot.registry.lb.lbType|Load balancing type, currently supports RoundRobin, Random, WeightedResponseTime, BestAvailable|RoundRobin|Yes|
|sermant.springboot.registry.lb.registryAddress|Registration Center Address|127.0.0.1:2181|Yes|
|sermant.springboot.registry.lb.instanceCacheExpireTime|Instance expiration time, in seconds, if <= 0 then never expires|0|Yes|
|sermant.springboot.registry.lb.instanceRefreshInterval|Instance refresh time, in seconds, must be less than instanceCacheExpireTime|0|Yes|
|sermant.springboot.registry.lb.refreshTimerInterval|Instance timing check interval, determine whether the instance is expired, if it is greater than instanceRefreshInterval, then the value is set to instanceRefreshInterval|5|Yes|
|sermant.springboot.registry.lb.enableSocketReadTimeoutRetry|For **java.net.SocketTimeoutException: read timed out** whether to retry (true/false)|true|Yes|
|sermant.springboot.registry.lb.enableSocketConnectTimeoutRetry|For **java.net.SocketTimeoutException: connect timed out** whether to retry (true/false)|true|Yes|
|sermant.springboot.registry.lb.enableTimeoutExRetry|For **java.util.concurrent.TimeoutException** whether to retry (true/false)|true|Yes|

Ensure that the values of` realName` and `registryAddress` are correct. Otherwise, the plugin does not take effect.

## Detailed Governance Rules

The SpringBoot registration plug-in needs to judge whether it needs to proxy the request according to the specified service name, and replace the url address. Effective service need to publish whitelist based on dynamic configuration center, publishing configuration can refer to [Configuration Center User's Manual](../user-guide/configuration-center.md#sermant-dynamic-configuration-center-model).

The key value is **sermant.plugin.registry**.

It is recommended to configure the group to microservice level, i.e. **app=${service.meta.application}&environment=${service.meta.environment}&service={spring.application.name}**, for the configuration of service.meta.application and service.meta.environment, please refer to the [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration), spring.application.name is the microservice name (i.e. the name of the service configured in the spring application).

Content is the specific configuration content of the whitelist, which is detailed as follows:

```yaml
strategy: all # whitelist type , all (all effective)/none (all not effective)/white (only those configured in the value value take effect)
value: service-b,service-c # Whitelist service collection, only effective when strategy is configured as white, multiple service names separated by English commas
```

> Note: When adding a new configuration, please remove the comment, otherwise it will cause the addition to fail.

## Supported Versions and Limitations

Framework Supported:

- SpringBoot 1.5.10.Release and above

Registry Center Supported:

- Zookeeper 3.4.x and above

Client Supported：

- HttpClient: 4.x

- HttpAsyncClient: 4.1.4

- OkhttpClient: 2.x, 3.x, 4.x

- Feign(springcloud-openfeign-core): 2.1.x, 3.0.x

- RestTemplate(Spring-web): 5.1.x, 5.3.x

## Operation and Result Verification

The following SpringBoot scenario is an example to demonstrate how the SpringBoot project is connected to Zookeeper.

#### Preparations

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/registry-demo/springboot-registry-demo) springboot-registry-demo source code

- [Download](https://zookeeper.apache.org/releases.html#download) Zookeeper, and start

### Step 1: Compile and package the springboot-registry-demo application

Execute the following command in the `${path}/Sermant-examples/registry-demo/springboot-registry-demo` directory:

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

After successful packaging, you can get `service-a.jar` in `${path}/Sermant-examples/registry-demo/springboot-registry-demo/service-a/target` , get `service-b.jar` in `${path}/Sermant-examples/registry-demo/springboot-registry-demo/service-b/target`.

> Note: path is the path where the springboot-registry-demo application is downloaded.

### Step 2: Deploy the applications

(1) Start application service-a:

```shell
# windows
java -Dserver.port=8989 -Dsermant.springboot.registry.enableRegistry=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar service-a.jar

# mac, linux
java -Dserver.port=8989 -Dsermant.springboot.registry.enableRegistry=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar service-a.jar
```

(2) start application service-b:

```shell
# windows
java -Dserver.port=9999 -Dsermant.springboot.registry.enableRegistry=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar service-b.jar

# mac, linux
java -Dserver.port=9999 -Dsermant.springboot.registry.enableRegistry=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar service-b.jar
```

> Description:
> - where path needs to be replaced with the actual installation path of Sermant.
> - x.x.x represents a Sermant version number.

> Note: At this time, the configured domain name (www.domain.com) is not a real domain name. It can be called normally only after the white list is configured.

### Step 3: Configure white list

Configure white list, please refer to [Detailed governance rules](#detailed-governance-rules).

The key is **sermant.plugin.registry**, group is **app=default&environment=&service=service-a**，content is **strategy: all**.

Take Zookeeper as an example, and use the command line tools provided by Zookeeper for configuration publishing.

1. Execute the following command in the `${path}/bin/` directory to create the node `/app=default&environment=`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=&service=service-a

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=&service=service-a
```

> Note: `${path}` is the installation directory of zookeeper

2. Execute the following command in the `${path}/bin/` directory to create nodes `/app=default&environment=&service=service-a/server.plugin.registry` and data `strategy: all`.

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=&service=service-a/sermant.plugin.registry "strategy: all"

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=&service=service-a/sermant.plugin.registry "strategy: all"
```

### Validation

Invoke the` localhost:8989/httpClientGet` interface to check whether the interface is successfully returned. If yes, the plugin has taken effect.

Success Rendering:

<MyImage src="/docs-img/springboot-registry.png"/>

Failure rendering:

<MyImage src="/docs-img/springboot-registry-error.png"/>