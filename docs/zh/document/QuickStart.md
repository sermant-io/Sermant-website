# 快速开始

## 下载或编译

点击[此处](https://github.com/huaweicloud/Sermant/releases)下载**Sermant**二进制包。如果您想自己编译项目，请遵循以下步骤。

执行*maven*命令来打包**Sermant**项目的 [demo module](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template)。

```shell
mvn clean package -Dmaven.test.skip
```

## 启动Sermant

**提前准备和启动zookeeper**，再启动 **Sermant** demo 应用：

```shell
# Run under Linux
java -cp sermant-template/demo-application/target/demo-application.jar \
  -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar=appName=test \
  com.huawei.example.demo.DemoApplication
```

```shell
# Run under Windows
java -cp sermant-template\demo-application\target\demo-application.jar ^
  -javaagent:sermant-agent-x.x.x\agent\sermant-agent.jar=appName=test ^
  com.huawei.example.demo.DemoApplication
```

查看demo-application的日志文件开头是否包含以下内容：

```
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
```

若日志如上正常输出，则说明sermant挂载成功。