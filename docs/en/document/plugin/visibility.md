# Service visibility

This article describes how to use [Service Visibility Plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-visibility)。

## Terminology

| Term                           | Description                                                                                                                                              |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Contract information           | External interface information provided by the service, including the class of the interface, request path, method name, parameter list, and return type |
| Blood relationship information | Call relationship information between services, including IP and port information of service providers and service consumers                             |


## Function introduction

The service visibility plug-in can collect the contract information and blood relationship of Spring Cloud and Dubbo applications. Without modifying the code, you can view the interface information provided by all services and the call relationship information between services through backend.

This plug-in completes the collection of interface information of service registration and provider information during service subscription based on the service registration, service subscription and other functions of Spring Cloud and Dubbo applications, so as to facilitate the unified management of users.

## Parameter configuration

### Sermant-agent configuration

The service visibility plug-in needs to configure the blacklist (`agent.config.serviceBlackList`), configure the service metadata (`service.meta.*`) and turn on the service visibility reconnection switch (`visibility.service.flag`) in the Sermant-agent. For details, refer to the [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration)

- agent.config.serviceBlackList: blacklist configuration, which controls whether basic functions are enabled. The visibility plug-in depends on the message sending function (the plug-in sends the collected information to the backend for display through the message sending function) and the heartbeat function (monitors whether the service is offline, and does not display the information of the service when the service is offline). Therefore, it is necessary to delete HeartbeatServiceImpl and NettyGatewayClient to ensure that the plug-in takes effect normally.
- service.meta.*: service metadata information. For example: group name, version number, region, etc. The service visibility plug-in collects metadata information for page display.
- visibility.service.flag: service visibility reconnection switch configuration. Prevent data loss after backend restart. When the switch is true, if backend reconnects, it will resend the current service information to backend to ensure data integrity.

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

- [Download](https://github.com/huaweicloud/Sermant/releases)/compile Sermant package
- [Download](https://github.com/huaweicloud/Sermant/tree/develop/sermant-integration-tests/dubbo-test) dubbo-test source code
- [Download](https://zookeeper.apache.org/releases.html) zookeeper and start the application

### Step 1: Modify the configuration

- Modify the Sermant-agent configuration

Find the configuration file in the `${path}/sermant-agent-x.x.x/agent/config/config.properties`. The modified configuration items are as follows:

```properties
agent.config.serviceBlackList=    # Blacklist configuration, delete the configured HeartbeatServiceImpl and NettyGatewayClient.
visibility.service.flag=true      # Service visibility reconnection switch (used to send all information to backend when backend reconnects to prevent data loss after backend restarts).
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
Visit the blood relationship information display page `http://127.0.0.1:8900/#/consanguinity` Or contract information display page `http://127.0.0.1:8900/#/contract`, if the page successfully displays the collection information, the plug-in will take effect.

The display effect is shown below:

- Rendering of contract information display

<MyImage src="/docs-img/visibility-contarct.png"/>

- Rendering of blood relationship information display

<MyImage src="/docs-img/visibility-consanguinity.png"/>