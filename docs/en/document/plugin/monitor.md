# Monitor

This document is mainly used for [monitoring plug-in](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-monitor) Instructions for use of

## Function Description

The monitoring plug-in is used to monitor the usage of hardware resources such as CPU, memory, disk I/O, and network I/O on the server where the host application resides. The Java virtual machine of the host application uses microservices and collects microservice public indicators.

The monitoring plug-in relies on prometheus for indicator collection. prometheus periodically invokes the httpServer service of the java agent to obtain and display the indicator information registered with the plug-in.


## monitor Monitors plug-in configurations
You can be in the path ` ${agent path}/agent/pluginPackage/monitor/config/config.yaml ` find the plug-in configuration file, the configuration is as follows:

```yaml
monitor.config:                 # Monitors the service configuration
enable-start-service: false     # Enables or disables the monitoring service
address: 127.0.0.1              # Address of the host service (HTTPS is recommended)
port: 12345                     # Port information of the host service
reportType: PROMETHEUS          # Only PROMETHEUS is supported for reporting monitoring indicators
userName:                       # Authorization information -- Authorization user name
password:                       # Authorization information -- authorized user password --AES encryption -- see AESUtil
key:                            # Specifies the KEY used for password encryption
```

**Please make sure that the configurations of `enable-start-service` and `reportType` are filled in correctly**, otherwise the plugin will not take effect!

## Support versions and restrictions

Framework support:
- SpringBoot 1.5.10.Release or later
- Dubbo 2.6.x-2.7.x

## Operation and result verification

### Environmental preparation

- JDK1.8 or higher
- Maven
- Complete download [demo application](https://start.spring.io/#!type=maven-project&language=java&platformVersion=2.7.7&packaging=jar&jvmVersion=1.8&groupId=com.example&artifactId=demo&name=demo&description=Demo%20project%20for%20Spring%20Boot&packageName=com.example.demo&dependencies=web)
- Compiled and packaged a sermant.

### Modify the monitor plug-in configuration.
```yaml
monitor.config:             # Monitors the service configuration
enable-start-service: true  # External service switch -- prometheus calls service ports to obtain metrics when true is enabled
address: 127.0.0.1          # Changed to the IP address of the host service.
port: 12345                 # Changes to the external service port.
```

### Compile and package the demo application
Run the following command to package the demo application:

```shell
mvn clean package
```
You can get the Jar package demo-0.0.1-SNAPSHOT.jar.

### Start demo application

Refer to the following command to start application a

```shell
java --javaagent:${agent path}\agent\sermant-agent.jar=appName= default-jar demo-0.0.1-SNAPSHOT.jar
```

### Verify

Call interface <http://127.0.1:12345> and check whether the interface is returned successfully. If it is returned successfully, it indicates that the plug-in has taken effect successfully.
The IP address and port in the interface address are the IP port information configured in the configuration of the monitor monitoring plug-in. If the default value is not used, the authentication address is adjusted.