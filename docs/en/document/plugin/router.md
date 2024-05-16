# Tag Router

This document is used to introduce the usage of [tag router](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-router).

## Function

The tag routing plug-in implements the configuration and management of routing rules between microservices in a non-intrusive way. In the case of multiple versions and instances of microservices, the label routing plug-in can manage the routing between services by configuring routing rules to achieve lossless upgrade, application dial test and other business purposes.

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

| Parameter key |                                                         Description                                                         | Default value | Required |
|:-------------:|:---------------------------------------------------------------------------------------------------------------------------:|:-------------:|:--------:|
|   priority    |                                  priority, the higher the number, the higher the priority.                                  |     Empty     |   yes    |
|     match     |        Matching rules, support attachments (attachments parameter of the dubbo application)/headers (request header)        |     Empty     |    no    |
|     exact     | Configuration policy. For detailed configuration policy, refer to [Configuration Policy Table](#configuration-policy-table) |     Empty     |    no    |
|     route     |                      routing rule, Including weight configuration and label information configuration                       |     Empty     |   yes    |
|    weight     |                                                        weight value                                                         |     Empty     |   yes    |
|     tags      |                    Tag information. The instances that meet the tag conditions are placed in this group                     |     Empty     |   yes    |

**Label routing rule interpretation**

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

## Supported Versions and Limitations

Framework Supported: 

- SpringCloud Edgware.SR2 - 2021.0.0

- Dubbo 2.6.x-2.7.x，3.0.x-3.2.x

Limitations:

- Asynchronous invocation is not supported

## Operation and Result Verification

Take the Spring Cloud scenario as an example to demonstrate the use of label routing plug-ins.

### Preparations

- [Download](https://github.com/sermant-io/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/sermant-io/Sermant-examples/tree/main/router-demo/spring-cloud-router-demo) spring-cloud-router-demo source code

- [Download](https://github.com/apache/servicecomb-service-center) ServiceComb, and start

- [Download](https://zookeeper.apache.org/releases.html#download) Zookeeper, and start

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

**Label routing rule interpretation**

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