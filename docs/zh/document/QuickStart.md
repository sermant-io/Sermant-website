# 快速开始
下面是一个简单的演示，新用户只需4个步骤即可使用Sermant

## 准备工作

- [下载](https://github.com/huaweicloud/Sermant/releases/download/v1.2.1/sermant-1.2.1.tar.gz) Sermant包（当前版本推荐1.2.1）
- [下载](https://github.com/huaweicloud/Sermant-examples/tree/main/flowcontrol-demo/spring-cloud-demo/spring-provider) demo应用
- [下载](https://zookeeper.apache.org/releases#download) 并启动zookeeper

## 编译打包demo应用

在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/`目录执行以下命令：

```shell
# windows linux mac
mvn clean package
```

打包成功后，在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target`得到`spring-provider.jar`

> 说明：path为demo应用下载所在路径

## 修改Sermant配置

修改`${path}/sermant-agent-x.x.x/agent/config/config.properties`文件中`agent.service.heartbeat.enable`和`agent.service.gateway.enable`配置为true，以此来开启Sermant的心跳服务和网关服务，如下所示：

```properties
agent.service.heartbeat.enable=true
agent.service.gateway.enable=true
```

> 说明：path为Sermant包下载所在路径

## 启动backend

在`${path}/sermant-agent-x.x.x/server/sermant`目录执行以下命令：

```shell
java -jar sermant-backend-x.x.x.jar
```

> 说明：path为Sermant包下载所在路径

## 启动demo应用

在`${path}/Sermant-examples/flowcontrol-demo/spring-cloud-demo/spring-provider/target`目录执行以下命令：

```shell
# linux mac
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar spring-provider.jar

# windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar -jar spring-provider.jar
```

> 说明：path为Sermant包下载所在路径

## 验证

打开浏览器并导航到URL`http://localhost:8900`，如下图所示：

<MyImage src="/docs-img/backend_sermant_info.jpg"></MyImage>