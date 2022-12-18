# 快速开始

## 下载或编译

点击[此处](https://github.com/huaweicloud/Sermant/releases)下载**Sermant**二进制包。如果您想自己编译项目，请遵循以下步骤。

执行*maven*命令来打包**Sermant**项目的 [demo module](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template)。

```shell
mvn clean package -Dmaven.test.skip
```

## 启动Sermant

**准备和启动zookeeper**，启动 **Sermant** demo 应用：

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

检查**Sermant**的运行状态。在本例中，打开浏览器并导航到URL“http://localhost:8900".

<MyImage src="/docs-img/backend_sermant_info.png"></MyImage>