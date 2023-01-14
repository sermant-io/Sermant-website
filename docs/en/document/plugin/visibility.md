# Service visibility

This article describes how to use the [Service Visibility Plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-visibility).

## Function introduction

The service visibility plugin can collect the contract information and blood relationship of Spring Cloud and Dubbo applications, and can view the interface information provided by all services and the call relationship information between services through Backend without modifying the code.

This plugin is based on the service registration, service subscription and other functions of Spring Cloud and Dubbo applications to complete the collection of interface information for service registration and provider information during service subscription, so as to facilitate unified management by users.

## Parameter configuration

### Sermant-agent configuration

The service visibility plug-in needs to configure the blacklist (`agent.config.serviceBlackList`) in Sermant-agent, enable the service visibility reconnection switch (`visibility.service.flag`), and configure the service metadata (`service.meta.*`), for details, refer to [Sermant-agent User Manual](../user-guide/sermant-agent.md#sermant-agent-parameter-configuration).

### Plugin configuration

The service visibility plugin needs to enable the collection switch, and the configuration file of the plug-in can be found in the path, and the configuration is as follows:

You can find the configuration file of the plug-in in the path `${sermant-agent-x.x.x}/agent/pluginPackage/service-visibility/config/config.yaml`. The configuration is as follows:
```yaml
visibility.config:
  StartFlag: true       # Service visibility collection switch. The plug-in takes effect when it is true
```

| Key in Input Parameters                         | Description | Default Value            | Required |
| ------------------------------- | ---------------- | ------ | ------ |
| visibility.config.startFlag     | 服务可见性采集开关 | false | true |


## Supported versions and restrictions

Framework support:
- SpringBoot 1.5.10. Release and above
- Dubbo 2.6.x-2.7.x

## Operation and result verification

The following takes the dubbo-test project as an example to demonstrate how to use the service visibility plugin.

### Preparation

- Download/Compile the Sermant package
- Download [dubbo-test source code](https://github.com/huaweicloud/Sermant/tree/develop/sermant-integration-tests/dubbo-test)
- Download zookeeper and start the application

### Step 1: Modify the configuration

- Modify Sermant-agent configuration

Find the configuration file in the path`${sermant-agent-x.x.x}/agent/config/config.properties`, and the modified configuration items are as follows:

```yaml
agent.config.serviceBlackList=              # Blacklist configuration, HeartbeatServiceImpl and NettyGatewayClient need to be deleted when the plugin takes effect
visibility.service.flag=true                # Service visibility reconnection switch (used to send all information to backend when backend reconnects)
```

- Modify service visibility plugin configuration

Find the configuration file of the plugin in the path`${sermant-agent-x.x.x}/agent/pluginPackage/service-visibility/config/config.yaml`, and the modified configuration items are as follows:

```yaml
visibility.config:
  startFlag: true        # Service visibility collection switch
```

### Step 2: Compile and package the dubbo-test application

Execute the following command to package the sub-projects dubbo-2-6-integration-consumer and dubbo-2-6-integration-provider in the dubbo-test project:

```shell
mvn clean package
```

You can get the dubbo-integration-consumer.jar package in the dubbo-2-6-integration-consumer project and the dubbo-integration-provider.jar package in the dubbo-2-6-integration-provider project.

### Step 3: Start the application

Refer to the following command to start the dubbo-2-6-integration-consumer application.

```shell
java -javaagent:${sermant-agent-x.x.x}\agent\sermant-agent.jar=appName=consumer -jar  dubbo-integration-consumer.jar
```

Refer to the following command to start the dubbo-2-6-integration-provider application.

```shell
java -javaagent:${sermant-agent-x.x.x}\agent\sermant-agent.jar=appName=provider -jar dubbo-integration-provider.jar
```

Refer to the following command to start the backend application.

```shell
java -jar ${sermant-agent-x.x.x}\server\sermant\sermant-backend-x.x.x.jar
```

### Verification

Visit the blood relationship information display page <http://127.0.0.1:8900/#/consanguinity> or the contract information display page <http://127.0.0.1:8900/#/contract>, if the page successfully displays the collection information, it means the plugin take effect.