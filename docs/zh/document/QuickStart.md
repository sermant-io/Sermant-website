# 快速开始

## 下载或编译

点击[此处](https://github.com/huaweicloud/Sermant/releases)下载**Sermant**二进制包。如果您想自己编译项目，请遵循以下步骤。

执行*maven*命令来打包**Sermant**项目的 [demo module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-example)。

```shell
mvn clean package -Dmaven.test.skip -Pexample
```

## 启动Sermant

启动 **Sermant** backend, **准备zookeeper**。

```shell
# Run under Linux
java -jar sermant-agent-x.x.x/server/sermant/sermant-backend-x.x.x.jar
```

```shell
# Run under Windows
java -jar sermant-agent-x.x.x\server\sermant\sermant-backend-x.x.x.jar
```

启动 **Sermant** demo 应用：

```shell
# Run under Linux
java -cp sermant-example/demo-application/target/demo-application.jar \
  -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test \
  com.huawei.example.demo.DemoApplication
```

```shell
# Run under Windows
java -cp sermant-example\demo-application\target\demo-application.jar ^
  -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test ^
  com.huawei.example.demo.DemoApplication
```

检查**Sermant**的运行状态。在本例中，打开浏览器并导航到URL“http://localhost:8900".

<MyImage src="/docs-img/backend_sermant_info.png"></MyImage>