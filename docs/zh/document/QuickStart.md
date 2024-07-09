# 快速开始
下面是一个简单的演示，新用户只需4个步骤即可使用Sermant

## 准备工作

- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-flowcontrol-demo-2.0.0.tar.gz) Demo二进制产物压缩包
- [下载](https://zookeeper.apache.org/releases#download) 并启动ZooKeeper

## 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`spring-provider.jar`。

## 修改Sermant配置

修改`${sermant-path}/sermant-agent-x.x.x/agent/config/config.properties`文件中`agent.service.heartbeat.enable`和`agent.
service.gateway.enable`配置为true，以此来开启Sermant的心跳服务和网关服务，如下所示：

```properties
agent.service.heartbeat.enable=true
agent.service.gateway.enable=true
```

> 说明：${sermant-path}为Sermant Release包下载所在路径

## 启动Backend

在`${sermant-path}/sermant-agent-x.x.x/server/sermant`目录执行以下命令：

```shell
java -jar sermant-backend-x.x.x.jar
```

> 说明：${sermant-path}为Sermant Release包下载所在路径

## 启动Demo微服务

参考如下命令启动Demo微服务

```shell
# linux mac
java -javaagent:${sermant-path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar spring-provider.jar

# windows
java -javaagent:${sermant-path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar spring-provider.jar
```

> 说明：${sermant-path}为Sermant Release包下载所在路径

## 验证

打开浏览器并导航到URL`http://localhost:8900`，如下图所示：

<MyImage src="/docs-img/backend_sermant_info.jpg"></MyImage>