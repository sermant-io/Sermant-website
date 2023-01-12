# Quick Start

## Download or Compile

Click [here](https://github.com/huaweicloud/Sermant/releases) to download **Sermant** binary package. If you will to compile the project yourself, please follow the following steps.

Execute *maven* command to package the **Sermant** project's [demo module](https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template).

```shell
mvn clean package -Dmaven.test.skip
```

## Start Sermant

**Prepare and start zookeeper in advance**, start **Sermant** demo project: 

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

Check whether the beginning of the demo-application log file contains the following content:

```
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
```

If the log is normally output as above, it means that the sermant is mounted successfully.