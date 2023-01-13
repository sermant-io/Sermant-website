# Service visibility

This document is mainly used for [Visibility module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-visibility) Instructions for use of

## Function introduction

This plug-in provides Spring Cloud and Dubbo applications with the function of collecting and displaying contract information and blood relationship, so that users can view the interface information provided by all services and the call relationship information between services through backend without modifying the code.

The plug-in completes the collection of interface information of service registration and provider information during service subscription based on the service registration, service subscription and other functions of Spring Cloud and Dubbo services, so as to facilitate the unified management of users.

## Parameter configuration

### AgentCore configuration (required)

The service visibility plug-in needs to use the agentCore configuration, including the service visibility reconnection switch, service metadata configuration, and blacklist configuration. Refer to the [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

### Service visibility plug-in configuration (required)

You can find the configuration file of the plug-in in the path `${agent path}/agent/pluginPackage/service-visibility/config/config.yaml`. The configuration is as follows:
```yaml
visibility.config:
  StartFlag: true       # Service visibility collection switch. The plug-in takes effect when it is true
```

### Backend configuration (required)

You can find the configuration file in the path `${Sermant path}/sermant-backend/src/main/resources/application.properties`,Where `Sermant path` is the path of the Sermant project. The configuration is as follows:

```yaml
Visibility. effectiveTimes=60000    # heartbeat effective time (ms), after which the next heartbeat is not received, the service is considered offline. Delete the contract and blood relationship information of the corresponding service.
```

For the above configuration, **Please ensure that the `startFlag`, `visibility.service.flag` and `serviceBlackList` are correctly configured**, otherwise the plug-in will not take effect!

In addition to the above configurations that users need to pay attention to, the following are optional configurations. Users can use environment variables to configure

|Parameter key | Description | Default value|
| ------------------------------- |--| ----------------- |
|AppName | App name | -|

## Supported versions and restrictions

Framework support:
- SpringBoot 1.5.10. Release and above
- Dubbo 2.6.x-2.7.x

## Operation and result verification
Take the dubbo-test project as an example to demonstrate how to use plug-ins
### Environmental preparation

- JDK1.8 and above
- Maven
- Download the [dubbo-test source code](https://github.com/huaweicloud/Sermant/tree/develop/sermant-integration-tests/dubbo-test)
- Finish compiling and packaging the sermant.

### Modify service visibility configuration

- Modify the agentCore configuration.
You can find the configuration file in the path `${agent path}/agent/config/config.properties`. The modified configuration items are as follows:
```yaml
agent.config.serviceBlackList=      # Blacklist configuration. The HeartbeatServiceImpl and NettyGatewayClient need to be deleted when the plug-in takes effect. Turn on heartbeat and message sending
service.meta.application=default    # Application grouping information. Modify to actual application grouping information.
service.meta.version=1.0.0          # Application version number. Modify to the actual application version number
service.meta.project=default        # Application namespace. Modify to the actual application namespace
service.meta.environment=           # Application environment information. Modify to actual application environment information
service.meta.zone=                  # Application area information. The formula is changed to the actual application area information
visibility.service.flag=true        # Service visibility reconnection switch (used to send all information to backend when backend reconnects). Open when modified to true
```

- Modify the service visibility plug-in configuration.
You can find the configuration file of the plug-in in the path `${agent path}/agent/pluginPackage/service-visibility/config/config.yaml`. The modified configuration items are as follows:

```yaml
visibility.config:
  StartFlag: true # Service visibility collection switch. Change to tue
```

### Compile and package dubbo-test application

Execute the following command to package the subprojects dubbo-2-6-integration-consumer and dubbo-2-6-integration-provider of the dubbo-test project:

```shell
mvn clean package
```

You can get the Jar package of dubbo-2-6-integration-consumer project dubbo-integration-consumer.jar and the Jar package of dubbo-2-6-integration-provider project dubbo-integration-provider.jar

### Start application
Refer to the following command to start the dubbo-2-6-integration-consumer application
```shell
java --javaagent:${agent path}\agent\sermant-agent.jar=appName=consumer -jar dubbo-integration-consumer.jar
```

Refer to the following command to start the dubbo-2-6-integration-provider application

```shell
java --javaagent:${agent path}\agent\sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

Start the backend application with the following command

```shell
java -jar ${agent path}\server\sermant\sermant-backend-1.0.0.jar
```

### Verification
Visit the blood relationship information display page <http://127.0.0.1:8900/#/consanguinity> Or contract information display page <http://127.0.0.1:8900/#/contract>, if the page successfully displays the collection information, the plug-in will take effect.