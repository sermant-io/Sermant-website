# Quick Start

Below is a simple demo that guides new users to use Sermant in just 4 steps.

## Preparation

- [Download](https://github.com/huaweicloud/Sermant/releases/download/v1.2.1/sermant-1.2.1.tar.gz) Sermant package 
  (The current version recommended is 1.2.1)
- [Download](https://github.com/huaweicloud/Sermant-examples/tree/main/flowcontrol-demo/spring-cloud-demo/spring-provider) demo application
- [Download](https://zookeeper.apache.org/releases#download) and start zookeeper

### Compile demo application

Execute the following command in the `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/` directory:

```shell
# windows linux mac
mvn clean package
```

After successful packaging，GET `spring-provider.jar` in `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target`

> Note: path is the path where the demo application is downloaded

## Modify the Sermant configuration

Modify the `agent.service.heartbeat.enable` and `agent.service.gateway.enable` configuration in the `${path}/sermant-agent-x.x.x/agent/config/config.properties` file to be true, which is to open the heartbeat service and the gateway service of Sermant, as shown below:

```properties
agent.service.heartbeat.enable=true
agent.service.gateway.enable=true
```
> Note: path is the path where the Sermant package is downloaded

## Start Backend

Execute the following command in the `${path}/sermant-agent-x.x.x/server/sermant` directory:

```shell
java -jar sermant-backend-x.x.x.jar
```

> Note: path is the path where the Sermant package is downloaded

## Start demo application

Execute the following command in the `${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target`directory：

```shell
# linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar spring-provider.jar

# windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar spring-provider.jar
```

> Note: path is the path where the Sermant package is downloaded

## Verification

Check running status of Sermant. In this example, open the browser and navigate to the URL `http://localhost:8900`.

<MyImage src="/docs-img/backend_sermant_info.jpg"></MyImage>