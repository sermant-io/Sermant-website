# Tag Router

This document is used to introduce the usage of [tag router](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-router)

## Function

In the case of multiple versions and instances of microservices, the routing between services is managed by configuring routing rules to achieve business purposes such as lossless upgrade and application dial test.

## Parameter configuration

### Configure Routing Rules

Please refer to [Configuration Center User's Manual](../user-guide/configuration-center.md#Sermant-Dynamic-Configuration-Center-Model).

The key value needs to be servicecomb.routeRule.${yourServiceName}, ${yourServiceName} is the microservice name of the target application.

The group needs to be configured to application level, i.e. app=${yourApp}&&environment=${yourEnvironment}, app defaults to default, environment defaults to empty.

The content is the specific routing rule.

#### Examples of tag routing rules and descriptions are as follows

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
- precedence: 1
  route:
    - weight: 20
      tags:
        group: red
    - weight: 80
      tags:
        group: green
```

**Note: When adding a new configuration, please remove the comment, otherwise it will cause the addition to fail.**

#### Configuration Policy Table

|Strategy Name|Strategy Value|Matching Rules|
|---|---|---|
|Exact Match|exact|The parameter value is equal to the configured value|
|Regex Match|regex|Parameter values match regex expressions, Since some regex expressions (such as \w and \W, etc.) are case-sensitive, please choose caseInsensitive (case-sensitive or not) carefully when using regex match|
|Not Equal Match|noEqu|The parameter value is not equal to the configuration value|
|Not Less Match|noLess|The parameter value is not less than the configured value|
|Not Greater Match|noGreater|The parameter value is not greater than the configured value|
|Greater Match|greater|The parameter value is greater than the configured value|
|Less Match|less|The parameter value is less than the configured value|

### Configuring tags for applications

Add the following parameters as required at the start of the attached agent: 

```
-Dservice_meta_version=${VERSION} -Dservice_meta_parameters=${PARAMETERS}
```

The parameters are described as follows: 

- ${VERSION} needs to be replaced with the version number at the time of service registration (The format of a.b.c, where a,b,c are numbers and the default is 1.0.0). The tag application needs to be modified to a different version number than the normal application.
- ${PARAMETERS} needs to be replaced with the custom tag from the service registration (Such as tag1:value1, tag2:value2). That is, tag keys and tag values are separated by colons, and multiple tags are separated by commas.
- In general, only service_meta_version needs to be configured if routing by version number, or service_meta_parameters if routing by custom tag.

## Supported Versions and Limitations

|Microservice Framework Supported|Registration Center Supported|Notice|
|:-----|:--|:--|
|SpringCloud Edgware.SR2 - 2021.0.0|servicecomb-service-center<br/>Zookeeper<br/>Nacos|Asynchronous invocation is not supported.|
|Dubbo 2.6.x-2.7.x|servicecomb-service-center<br/>Zookeeper<br/>Nacos|Asynchronous invocation is not supported.|

## Operation Steps and Result Verification

### Deploying Applications

1.Compile [demo application](https://github.com/huaweicloud/Sermant-examples/tree/main/router-demo/spring-cloud-router-demo)

```shell
mvn clean package
```

2.Start the zuul gateway

```shell
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-zuul.jar
```

3.Start the consumer

```shell
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-consumer.jar
```

4.Start the provider

```shell
java -Dservicecomb_service_enableSpringRegister=true -javaagent:${path}\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar
```

5.Start the provider with tag (version is 1.0.1, tag is group:gray.)

```shell
java -Dservicecomb_service_enableSpringRegister=true -Dservice_meta_version=1.0.1 -Dservice_meta_parameters=group:gray -Dserver.port=8163 -javaagent:${path}\agent\sermant-agent.jar=appName=default -jar spring-cloud-router-provider.jar
```

${path} needs to be replaced with the actual Sermant installation path.

### Publish Configuration

Registration center using Huawei CSE, download [Local-CSE](https://support.huaweicloud.com/devg-cse/cse_devg_0036.html), unzip and follow the documentation to start.

Configuring Routing Rules, please refer to [Configure Routing Rules](#Configure Routing Rules).

The key value is **servicecomb.routeRule.spring-cloud-router-provider**, the group is **app=default&&environment=**, and the configuration value is the specific routing rule, as follows.

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

### Result Verification

After starting the above 4 applications and configuring the routing rules correctly, when accessing <http://127.0.0.1:8170/consumer/hello/rest> through the http client tool, we can find that when the request header is id: 1 or id: 2, it will be routed to the provider of version 1.0.1, and when the above conditions are not met When the above condition is not met, it will visit the provider with version 1.0.0.

[return **Sermant** Documentation](../document/UserGuide/README.md)