# Tag Router

This document is used to introduce the usage of [tag router](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-router).

## Function

The tag routing plugin implements the configuration and management of routing rules between microservices in a non-intrusive way. In the case of multiple versions and instances of microservices, the tag routing plugin can manage the routing between services by configuring routing rules to achieve lossless upgrade, application dial test and other business purposes.

## Supported Versions and Limitations

**Supported Frameworks:**

- SpringCloud Edgware.SR2 - 2021.0.0
- Dubbo 2.6.x - 2.7.x, 3.0.x - 3.2.x

**Limitations:**

- For routing based on Sermant dynamic configuration service, the HTTP client currently only supports Feign and RestTemplate. For routing based on the xDS protocol, the HTTP client currently supports Feign, RestTemplate, HttpClient, HttpAsyncClient, HttpURLConnection, and OkHttp.

## Dependent Core Services of Sermant

The routing plugin's functionality depends on Sermant's core services. The specific core services it depends on are as follows:

- **Dynamic Configuration Service**: The routing plugin uses Sermant framework's [Dynamic Configuration Service](../user-guide/configuration-center.md) to distribute routing rule configurations. For detailed rule configuration, refer to [Detailed Routing Rules](#detailed-routing-rules).

- **xDS Service**: The routing plugin uses Sermant framework's xDS service to obtain the service's [routing configuration](../user-guide/sermant-xds.md#routing-based-on-xds-service), [service instances](../user-guide/sermant-xds.md#service-discovery-based-on-xds-servicee), and [load balancing configuration](../user-guide/sermant-xds.md#load-balancing-based-on-xds-service) to implement routing based on the xDS protocol. For detailed information on xDS routing, refer to [Routing Based on xDS Protocol](#routing-based-on-the-xds-protocol).

- **Metric Service**: The routing plugin collects routing-related metric information based on the [Metric Service](../user-guide/sermant-agent.md#metric-service) from the Sermant framework layer. For routing metrics, refer to [Routing Metric Collection](#route-metric-collection).

## Parameter Configuration

### Sermant-agent Configuration

The routing plugin requires service metadata (version number, other metadata) to be configured in the Sermant-agent, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

- service.meta.version: version, used to identify the current version of the microservice.

- service.meta.parameters: other metadata, used to tag the current microservice, like k1:v1,k2:v2.

## Detailed Routing Rules

Router plugin based on dynamic configuration center for configuration release, configuration release can refer to [Configuration Center User's Manual](../user-guide/configuration-center.md#publish-configuration).

The key value needs to be **servicecomb.routeRule.${yourServiceName}**, ${yourServiceName} is the microservice name (i.e. the value of spring.application.name/dubbo.application.name configuration) of the target application.

The group needs to be configured to application level, i.e. **app=${service.meta.application}&environment=${service.meta.environment}**, for the configuration of service.meta.application and service.meta.environment, please refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

The content is the specific routing rule.

### Examples of tag routing rules and descriptions are as follows:

```yaml
---
- precedence: 2 # Priority, the higher the number, the higher the priority.
  match: # Request match rule. 0..N, not configured to indicate a match. Only one attachments/headers/args are allowed per match rule.
    attachments: # dubbo attachment matches. If it is an http header match, you need to configure it as headers.
      id: # The attribute name is modified to a specific key when used. If multiple keys are configured, all key rules must match the request.
        exact: '1' # Configuration policy, The attribute value of key is equal to 1, detailed configuration policy refer to the configuration policy table.
        caseInsensitive: false # false: case-insensitive (default), true: case-sensitive. When configured to false, it will be converted to uppercase uniformly for comparison.
  route: # Routing Rules
    - weight: 20 # Weight
      tags:
        version: 1.0.0 # Instance tagging. Instances that meet the tagging criteria are placed in this group.
    - weight: 80 # Weight
      tags:
        version: 1.0.1 # Instance tagging. Instances that meet the tagging criteria are placed in this group.
- precedence: 1 2 # Priority, the higher the number, the higher the priority.
  route:
    - weight: 20 # Weight
      tags:
        group: red # Instance tagging. Instances that meet the tagging criteria are placed in this group.
    - weight: 80 # Weight
      tags:
        group: green # Instance tagging. Instances that meet the tagging criteria are placed in this group.
```

| Parameter key |                         Description                          | Default value | Required |
| :-----------: | :----------------------------------------------------------: | :-----------: | :------: |
|   priority    |  priority, the higher the number, the higher the priority.   |     Empty     |   yes    |
|     match     | Matching rules, support attachments (attachments parameter of the dubbo application)/headers (request header) |     Empty     |    no    |
|     exact     | Configuration policy. For detailed configuration policy, refer to [Configuration Policy Table](#configuration-policy-table) |     Empty     |    no    |
|     route     | routing rule, Including weight configuration and tag information configuration |     Empty     |   yes    |
|    weight     |                         weight value                         |     Empty     |   yes    |
|     tags      | Tag information. The instances that meet the tag conditions are placed in this group |     Empty     |   yes    |

**Tag routing rule interpretation**

- 80% of the requests with the id attribute value of 1 in the attachments information will be routed to the service instance with the version number of 1.0.1, and 20% will be routed to the service instance with the version number of 1.0.0. 80% of other requests will be routed to the service instance with the group name green, and 20% will be routed to the service instance with the group name red.

> Note: When adding a new configuration, please remove the comment, otherwise it will cause the addition to fail.

### Configuration Policy Table

|   Strategy Name    | Strategy Value  |                                                                                                Matching Rules                                                                                                |
|:------------------:|:---------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
|    Exact Match     |      exact      |                                                                             The parameter value is equal to the configured value                                                                             |
|    Regex Match     |      regex      | Parameter values match regex expressions, Since some regex expressions (such as \w and \W, etc.) are case-sensitive, please choose caseInsensitive (case-sensitive or not) carefully when using regex match  |
|  Not Equal Match   |      noEqu      |                                                                         The parameter value is not equal to the configuration value                                                                          |
|   Not Less Match   |     noLess      |                                                                          The parameter value is not less than the configured value                                                                           |
| Not Greater Match  |    noGreater    |                                                                         The parameter value is not greater than the configured value                                                                         |
|   Greater Match    |     greater     |                                                                           The parameter value is greater than the configured value                                                                           |
|     Less Match     |      less       |                                                                            The parameter value is less than the configured value                                                                             |

## Routing based on the xDS protocol

The routing plugin obtains service [routing configurations](../user-guide/sermant-xds.md#routing-based-on-xds-service), [service instances](../user-guide/sermant-xds.md#service-discovery-based-on-xds=service), and [load balancing configurations](../user-guide/sermant-xds.md#load-balancing-based-on-xds=service) from the xDS service at the Sermant framework layer to implement routing based on the xDS protocol (hereinafter referred to as xDS routing). Users can configure routing rules via Istio's [DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/) and [VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/). Currently, traffic can be routed based on request headers and paths, and it supports frameworks like HttpClient, HttpAsyncClient, OkHttp, HttpURLConnection, and Spring Cloud.

### Using xDS Routing

To use xDS routing, you need to deploy [Istio](https://istio.io/v1.23/docs/setup/getting-started/) in a Kubernetes environment，and activate the xDS routing option in the routing plugin's `config/config.yaml` file:

```
enabled-xds-route: true
```

> Microservices using xDS routing capabilities do not need to mount the Envoy sidecar when creating Pods.

The format for upstream service calls through HTTP clients should be `http://${serviceName}.${hostSuffix}/{path}`, where `${serviceName}` is the name of the upstream service being called, and `${hostSuffix}` is the domain suffix for Kubernetes. For a template on configuring Istio-based routing rules, please refer to the section on [xDS-based routing](../user-guide/sermant-xds.md#routing-based-on-xds-service). For [an example of xDS routing](../user-guide/sermant-xds.md#routing-example-based-on-xds-service), please refer to the section Routing Example Based on xDS Service

### Supported Versions and Limitations for xDS Routing

| Framework         | Supported Versions     |
| ----------------- | ---------------------- |
| SpringCloud       | Edgware.SR2 - 2021.0.0 |
| HttpClient        | 4.x                    |
| HttpAsyncClient   | 4.x                    |
| OkHttp            | 2.2.x - 4.x                 |
| HttpURLConnection | 1.8                    |

## Route Metric Collection

The route metric collection feature is based on the Sermant framework's metrics service, enabling the collection of metric data during routing processes.

### Using the Route Metric Collection Feature

To enable the route metric collection feature, you need to set it in the `config/config.yaml` configuration file of the routing plugin:

```yaml
enable-metric: true
```

> **Note**: To collect metrics from the routing plugin, the Sermant metrics core service must be enabled. Please refer to the [Metrics Service](../user-guide/sermant-agent.md#metric-service) for specific configuration details.

### Route Metrics

The following metrics can be collected by the route metric collection feature:

| Metric Name                     | Description                               | Tags |
|----------------------------------|-------------------------------------------|------|
| router_request_count             | Number of requests                                                          | protocol: protocol, http/dubbo <br> client_service_name: Name of the service sending the request <br> server_address: Address of the service receiving the request <br> scope: Source of the metric, service-router: from the routing plugin               |
| router_destination_tag_count     | Number of times routed to the target service based on routing rules          | protocol: protocol, http/dubbo <br> client_service_name: Name of the service sending the request <br> service_meta_service: Service label information matched based on the service label <br> service_meta_version: Service version label information matched based on version label <br> service_meta_application: Service application label information matched based on application label <br> service_meta_zone: Service zone label information matched based on zone label <br> service_meta_project: Service project label information matched based on project label <br> service_meta_environment: Service environment label information matched based on environment label <br> service_meta_parameters: Custom label information matched based on user-defined labels <br> scope: Source of the metric, service-router: from the routing plugin |
| router_unmatched_request_count   | Number of requests not matching any routing rule                            | protocol: protocol, http/dubbo <br> client_service_name: Name of the service sending the request <br> scope: Source of the metric, service-router: from the routing plugin                                                                                                 |
| lane_tag_count                   | Number of times the request is tagged based on coloring rules              | protocol: protocol, http/dubbo <br> client_service_name: Name of the service sending the request <br> scope: Source of the metric, service-router: from the routing plugin <br> lane_tag: Coloring mark added to the request after successful rule matching |

### Route Metrics Example

Refer to the [Metrics Service](../user-guide/sermant-agent.md#metric-service) to enable the relevant configurations for metrics collection. The routing plugin can collect the metrics as shown above. This document uses the `router_request_count` metric as an example:

<MyImage src="/docs-img/router_metric.jpg"/>

## Operation and Result Verification

Take the Spring Cloud scenario as an example to demonstrate the use of tag routing plugins.

### Preparations

- [Download](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz) Sermant Release package (current recommended version is 2.3.0)
- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.3.0/sermant-examples-router-demo-2.3.0.tar.gz) Demo binary artifact package
- [Download](https://github.com/apache/servicecomb-service-center) ServiceComb (registry center), and start it
- [Download](https://zookeeper.apache.org/releases.html#download) ZooKeeper (dynamic configuration center), and start it

### Step 1: Compile and package the spring-cloud-router-demo application

Execute the following command in the `${path}/Sermant-examples/router-demo/spring-cloud-router-demo` directory:

```shell
# windows
mvn clean package

# mac, linux
mvn clean package
```

After successful packaging, you can get `spring-cloud-router-consumer.jar` in `${path}/Sermant-examples/router-demo/spring-cloud-router-demo/spring-cloud-router-consumer/target` , get `spring-cloud-router-provider.jar` in `${path}/Sermant-examples/router-demo/spring-cloud-router-demo/spring-cloud-router-provider/target` , get `spring-cloud-router-zuul.jar` in `${path}/Sermant-examples/router-demo/spring-cloud-router-demo/spring-cloud-router-zuul/target`.

> Note: path is the path where the spring-cloud-router-demo application is downloaded.

### Step 2: Deploying the applications

(1) Start the zuul gateway

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-zuul.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-zuul.jar
```

(2) Start the consumer

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-consumer.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-consumer.jar
```

(3) Start the provider

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar
```

(4) Start the provider with tag (version is 1.0.1, tag is group:gray.)

```shell
# windows
java -Dservicecomb_service_enableSpringRegister=true -Dservice_meta_version=1.0.1 -Dservice_meta_parameters=group:gray -Dserver.port=8163 -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar

# mac, linux
java -Dservicecomb_service_enableSpringRegister=true -Dservice_meta_version=1.0.1 -Dservice_meta_parameters=group:gray -Dserver.port=8163 -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar
```

> **Description**:
> where path needs to be replaced with the actual installation path of Sermant.
> x.x.x represents a Sermant version number.

### Step 3: View service registration
Login [ServiceComb](http://127.0.0.1:30103/) In the background, check whether the service is registered successfully.

<MyImage src="/docs-img/router-registry.png"/>

### Step 4: Publish configuration

Configure routing rules. Refer to the [Dynamic Configuration Center User Manual](../user-guide/configuration-center.md#publish-configuration) for configuration publishing.

The key value is **servicecomb.routeRule.spring-cloud-router-provider**, the group is **app=default&environment=**, and the content is the specific routing rule, as follows.

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

**Tag routing rule interpretation**

- The request with the id attribute value of 1 in the request header information will be routed to the service instance with the group name of gray, and the request with the id attribute value of 2 will be routed to the service instance with the version number of 1.0.1.

Take Zookeeper as an example, and use the command line tools provided by Zookeeper for configuration publishing.
1. Execute the following command in the `${path}/bin/` directory to create the node `/app=default&environment=`

```shell
# linux mac
./zkCli.sh -server localhost:2181 create /app=default&environment=

# windows
zkCli.cmd -server localhost:2181 create /app=default&environment=
```

> Note: `${path}` is the installation directory of zookeeper

2. Execute the following command in the `${path}/bin/` directory to create the node `/app=default&environment=/servicecomb.routeRule.spring-cloud-router-provider` and set the data.

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

### Verification

<MyImage src="/docs-img/router-result.png"/>

After starting the above 4 applications and configuring the routing rules correctly, when accessing `http://127.0.0.1:8170/consumer/hello/rest` through the http client tool, we can find that when the request header is id: 1 or id: 2, it will be routed to the provider of version 1.0.1, and when the above conditions are not met When the above condition is not met, it will visit the provider with version 1.0.0.