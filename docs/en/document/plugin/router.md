# Tag Router

This document is used to introduce the usage of [tag router](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-router).

## Function

In the case of multiple versions and instances of microservices, the routing between services is managed by configuring routing rules to achieve business purposes such as lossless upgrade and application dial test.

## Parameter Configuration

### Sermant-agent Configuration

The routing plugin requires service metadata (version number, other metadata) to be configured in the Sermant-agent, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

- service.meta.version: version, used to identify the current version of the microservice.

- service.meta.parameters: other metadata, used to tag the current microservice, like k1:v1,k2:v2.

## Detailed Routing Rules

Router plugin based on dynamic configuration center for configuration release, configuration release can refer to [Configuration Center User's Manual](../user-guide/configuration-center.md#sermant-dynamic-configuration-center-model).

The key value needs to be **servicecomb.routeRule.${yourServiceName}**, ${yourServiceName} is the microservice name (i.e. the value of spring.application.name/dubbo.application.name configuration) of the target application.

The group needs to be configured to application level, i.e. **app=${service.meta.application}&environment=${service.meta.environment}**, for the configuration of service.meta.application and service.meta.environment, please refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

The content is the specific routing rule.

### Examples of tag routing rules and descriptions are as follows:

```yaml
---
- precedence: 2 # Priority, the higher the number, the higher the priority.
  match: # Request match rule. 0..N, not configured to indicate a match. Only one attachments/headers/args are allowed per match rule.
    attachments: # dubbo attachment matches. If it is an http header match, you need to configure it as headers.
      id: # If multiple keys are configured, then all key rules must match the request.
        exact: '1' # Configuration policy, equal to 1, detailed configuration policy refer to the configuration policy table.
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

**Note: When adding a new configuration, please remove the comment, otherwise it will cause the addition to fail.**

### Configuration Policy Table

|Strategy Name|Strategy Value|Matching Rules|
|---|---|---|
|Exact Match|exact|The parameter value is equal to the configured value|
|Regex Match|regex|Parameter values match regex expressions, Since some regex expressions (such as \w and \W, etc.) are case-sensitive, please choose caseInsensitive (case-sensitive or not) carefully when using regex match|
|Not Equal Match|noEqu|The parameter value is not equal to the configuration value|
|Not Less Match|noLess|The parameter value is not less than the configured value|
|Not Greater Match|noGreater|The parameter value is not greater than the configured value|
|Greater Match|greater|The parameter value is greater than the configured value|
|Less Match|less|The parameter value is less than the configured value|

## Supported Versions and Limitations

Framework Supported: 

- SpringCloud Edgware.SR2 - 2021.0.0

- Dubbo 2.6.x - 2.7.x

Limitations:

- Asynchronous invocation is not supported

## Operation and Result Verification

The following is an example of the spring-cloud-router-demo project to demonstrate how to use the tag route plugin.

### Preparations

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/router-demo/spring-cloud-router-demo) spring-cloud-router-demo source code

- [Download](https://github.com/apache/servicecomb-service-center) ServiceComb, and start

- [Download](https://zookeeper.apache.org/releases.html#download) zookeeper, and start

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

### Step 3: Publish Configuration

Configuring Routing Rules, please refer to [Detailed Routing Rules](#detailed-routing-rules).

The key value is **servicecomb.routeRule.spring-cloud-router-provider**, the group is **app=default&&environment=**, and the content is the specific routing rule, as follows.

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

### Verification

<MyImage src="/docs-img/router-result.png"/>

After starting the above 4 applications and configuring the routing rules correctly, when accessing `http://127.0.0.1:8170/consumer/hello/rest` through the http client tool, we can find that when the request header is id: 1 or id: 2, it will be routed to the provider of version 1.0.1, and when the above conditions are not met When the above condition is not met, it will visit the provider with version 1.0.0.