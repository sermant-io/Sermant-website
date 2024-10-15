# Quick Start

Below is a simple demo that guides new users to use Sermant in just 4 steps.

## Preparation

- [Download](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant package 
  (The current version recommended is 2.0.0)
- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-flowcontrol-demo-2.0.0.tar.gz) demo application
- [Download](https://zookeeper.apache.org/releases#download) and start zookeeper

### Get the Demo binary product.

Extract the Demo binary product archive to obtain the spring-provider.jar file.

## Modify the Sermant configuration

Modify the `${sermant-path}/sermant-agent-x.x.x/agent/config/config.properties` file by setting `agent.service.heartbeat.enable` and `agent.service.gateway.enable` to true to enable Sermant's heartbeat service and gateway service, as shown below:

```properties
agent.service.heartbeat.enable=true
agent.service.gateway.enable=true
```

> Note: ${sermant-path} refers to the directory where the Sermant Release package was downloaded.

## Start Backend

Execute the following command in the `${path}/sermant-agent-x.x.x/server/sermant` directory:

```shell
java -jar sermant-backend-x.x.x.jar
```

> Note: path is the path where the Sermant package is downloaded

## Start demo application

Refer to the following command to start the Demo microservice.

```shell
# linux mac
java -javaagent:${sermant-path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar spring-provider.jar

# windows
java -javaagent:${sermant-path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar spring-provider.jar
```

> Note: ${sermant-path} refers to the directory where the Sermant Release package was downloaded

## Verification

Open your browser and navigate to the URL `http://localhost:8900`, as shown in the image below:

<MyImage src="/docs-img/backend_sermant_info_en.png"></MyImage>