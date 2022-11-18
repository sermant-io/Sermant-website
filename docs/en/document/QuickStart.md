# Quick Start

## Download or Compile

Click [here](https://github.com/huaweicloud/Sermant/releases) to download **Sermant** binary package. If you will to compile the project yourself, please follow the following steps.

Execute *maven* command to package the **Sermant** project's [demo module](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template).

```shell
mvn clean package -Dmaven.test.skip
```

## Start Sermant

Start **Sermant** backend, **Prepare zookeeper**.

```shell
# Run under Linux
java -jar sermant-agent-x.x.x/server/sermant/sermant-backend-x.x.x.jar
```

```shell
# Run under Windows
java -jar sermant-agent-x.x.x\server\sermant\sermant-backend-x.x.x.jar
```

Start **Sermant** demo project: 

```shell
# Run under Linux
java -cp sermant-template/demo-application/target/demo-application.jar \
  -javaagent:sermant-template/agent/sermant-agent.jar=appName=test \
  com.huawei.example.demo.DemoApplication
```

```shell
# Run under Windows
java -cp sermant-template\demo-application\target\demo-application.jar ^
  -javaagent:sermant-template\agent\sermant-agent.jar=appName=test ^
  com.huawei.example.demo.DemoApplication
```
Check running status of Sermant. In this example, open the browser and navigate to the URL "http://localhost:8900".

<MyImage src="/docs-img/backend_sermant_info.png"></MyImage>