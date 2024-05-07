# Service visibility

This article describes how to use [Service Visibility Plugin](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-service-visibility)。

## Terminology

| Term                           | Description                                                                                                                                              |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Contract information           | External interface information provided by the service, including the class of the interface, request path, method name, parameter list, and return type |
| Blood relationship information | Call relationship information between services, including IP and port information of service providers and service consumers                             |


## Function introduction

The service visibility plug-in can collect the contract information and blood relationship of Spring Cloud and Dubbo applications. Without modifying the code, you can view the interface information provided by all services and the call relationship information between services through backend.

This plug-in completes the collection of interface information of service registration and provider information during service subscription based on the service registration, service subscription and other functions of Spring Cloud and Dubbo applications, so as to facilitate the unified management of users.

## Parameter configuration

### Sermant agent configuration
The service visibility plugin needs to configure the heartbeat switch (`agent.service.heartbeat.enable`), gateway switch (`agent.service.gateway.enable`), notification switch (`notification.enable`), and service metadata (`service.meta.*`) in the configuration file `${path}/sermant-agent-x.x.x/agent/config/config.properties` of the Service Agent.

```properties
agent.service.heartbeat.enable=false # Heartbeat switch, controls whether the heartbeat function is enabled. The visibility plugin relies on the heartbeat function to monitor whether the service is offline, and does not display the visibility information of the service when it is offline. It is disabled by default and needs to be set to true when used.
agent.service.gateway.enable=false   # Gateway switch to control whether the message sending function is enabled. The visibility plugin relies on the message sending function. The plugin sends the collected information to Backend for display through the message sending function. It is disabled by default and needs to be set to true when used.
notification.enable=false            # Notification switch, controls the switch for notifications such as Netty links. The visibility plugin relies on the notification of Netty links to listen for Netty reconnection. When Netty reconnects, the visibility plugin will resend the collected visibility data to Backend to prevent data loss caused by Backend restart. It is disabled by default and needs to be set to true when used.
service.meta.application=default     # Specify the application name. The service visibility plugin collects this information for data display.
service.meta.version=1.0.0           # Specify the service version. The service visibility plugin collects this information for data display.
service.meta.project=default         # Specify the service namespace. The service visibility plugin collects this information for data display.
service.meta.environment=            # Specify the environment where the service is located. The service visibility plugin collects this information for data display.
service.meta.zone=                   # Specify the az (availability zone) where the service is located. The service visibility plugin collects this information for data display.
```

### Plug-in configuration

The service visibility plug-in needs to enable the collection switch. The configuration file of the plug-in can be found in the `${path}/sermant-agent-x.x.x/agent/pluginPackage/service-visibility/config/config.yaml`. The configuration is as follows:

```yaml
visibility.config:
  startFlag: true         # Service visibility collection switch. Control whether to collect and report indicators. If it is true, the plug-in will report data collection. If it is false, the plug-in will not report data collection.
```

|        Parameter key        |             Description              | Default value | Required |
|:---------------------------:|:------------------------------------:|:-------------:|:--------:|
| visibility.config.startFlag | Service visibility collection switch |     false     |   Yes    |

## Supported versions and restrictions

Framework support:

- SpringBoot 1.5.10. Release and above
- Dubbo 2.6.x-2.7.x

## Operation and result verification

The following will demonstrate how to use the service visibility plug-in.

### Preparations

- [Download](https://github.com/sermant-io/Sermant/releases)compile Sermant package
- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v1.2.1/sermant-examples-visibility-demo-1.2.1.tar.gz) Demo binary product compressed package
- [Download](https://zookeeper.apache.org/releases.html#download) Zookeeper (Dynamic Configuration Center&Registration Center) and launch

### Step 1: Modify the configuration

- Modify the Sermant-agent configuration

Find the configuration file in the `${path}/sermant-agent-x.x.x/agent/config/config.properties`. The modified configuration items are as follows:

```properties
agent.service.heartbeat.enable=true # Heartbeat service switch
agent.service.gateway.enable=true   # Unified Gateway Service Switch
notification.enable=true            # Internal event notification switch
```

- Modify service visibility plug-in configuration

Find the configuration file of the plugin in the `${path}/sermant-agent-x.x.x/agent/pluginPackage/service-visibility/config/config. yaml`. The modified configuration items are as follows:

```yaml
visibility.config:
  startFlag: true           # Service visibility collection switch. If it is true, data collection and reporting will be performed.
```

### Step 2: compile and package the dubbo-test application

Execute the following command to package the subprojects dubbo-2-6-integration-consumer and dubbo-2-6-integration-provider in the dubbo-test project:

```shell
mvn clean package
```

You can get the dubbo-integration-consumer.jar package in the `target` folder in the dubbo-2-6-integration-consumer project and the dubbo-integration-provider.jar package in the dubbo-2-6-integration-provider project .

### Step 3: Start the application

- Refer to the following command to start the backend application.

```shell
# Run under Linux
java -jar ${path}/sermant-agent-x.x.x/server/sermant/sermant-backend-x.x.x.jar
```

```shell
# Run under Windows
java -jar ${path}\sermant-agent-x.x.x\server\sermant\sermant-backend-x.x.x.jar
```

- Refer to the following command to start the dubbo-2-6-integration-consumer application.

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

- Refer to the following command to start the dubbo-2-6-integration-provider application.

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

> **illustrate**:
> Where path needs to be replaced with the actual installation path of Sermant.
> x.x.x represents a Sermant version number.

### Verification

Accessing the visibility information query interface`http://127.0.0.1:8900/visibility/getcollectorinfo`If the collected information can be seen, it indicates that the plugin is effective.

The display effect is shown below:

- Rendering of contract information display

```json
{
 "contractList ": [{
  "serviceType": "dubbo",
  "interfaceName": "io.sermant.integration.service.BarService",
  "serviceKey": "io.sermant.integration.service.BarService",
  "url": "io.sermant.integration.service.BarService",
  "methodInfoList": [{
   "name": "bar",
   "paramInfoList": [{
    "paramType": "java.lang.String",
    "paramName": "str"
   }],
   "returnInfo": {
    "paramType": "java.lang.String",
   }
  }]
 }]
}
```

- Rendering of blood relationship information display

```json
{
 "consanguinityList": [{
  "serviceType": "dubbo",
  "interfaceName": "io.sermant.integration.service.BarService",
  "url": "io.sermant.integration.service.BarService",
  "serviceKey": "io.sermant.integration.service.BarService",
  "providers": [{
   "ip": "x.x.x.x",
   "port": "28821",
   "serviceType": "dubbo",
   "serviceKey": "io.sermant.integration.service.BarService",
   "url": "io.sermant.integration.service.BarService"
  }]
 }]
}
```