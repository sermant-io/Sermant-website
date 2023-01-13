# 监控

本文档主要用于[监控插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-monitor)的使用说明

## 功能介绍

资源监控模块用于监控宿主应用所在服务器的CPU、内存、磁盘IO和网络IO等硬件资源的使用情况，宿主应用Java虚拟机已经微服务的使用情况、微服务公共指标采集。

监控模块依赖于prometheus进行指标收集,prometheus定期调用java agent的httpServer服务，获取插件注册的指标信息，并进行存储展示。


## monitor监控插件配置
您可在路径`${agent path}/agent/pluginPackage/monitor/config/config.yaml`找到该插件的配置文件， 配置如下所示：

```yaml
monitor.config:                       # 监控服务配置
  enable-start-service: false         # 监控服务启动开关
  address: 127.0.0.1                  # 宿主服务的地址（建议使用HTTPS）
  port: 12345                         # 宿主服务的端口信息
  reportType: PROMETHEUS              # 监控指标上报方式  目前只支持PROMETHEUS
  userName:                           # 授权信息--授权用户名
  password:                           # 授权信息--授权用户密码--AES加密--参见AESUtil
  key:                                # 授权用户密码加密使用的KEY
```

如上配置， **请注意务必确保配置`enable-start-service`与`reportType`填写正确**， 否则插件不会生效！

## 支持版本和限制

框架支持：
- SpringBoot 1.5.10.Release及以上
- Dubbo 2.6.x-2.7.x

## 操作和结果验证

### 环境准备

- JDK1.8及以上
- Maven
- 完成下载[demo应用](https://start.spring.io/#!type=maven-project&language=java&platformVersion=2.7.7&packaging=jar&jvmVersion=1.8&groupId=com.example&artifactId=demo&name=demo&description=Demo%20project%20for%20Spring%20Boot&packageName=com.example.demo&dependencies=web)
- 完成编译打包sermant。

### 修改monitor监控插件配置。
```yaml
monitor.config:                       # 监控服务配置
  enable-start-service: true          # 对外服务开关 -- 开关true时prometheus可以调用服务端口获取指标信息
  address: 127.0.0.1                  # 修改为宿主服务IP。
  port: 12345                         # 修改为对外提供服务端口。
```

### 编译打包demo应用
执行如下命令对demo应用进行打包:

```shell
mvn clean package
```
你可以得到Jar包demo-0.0.1-SNAPSHOT.jar。

### 启动demo应用

参考如下命令启动a应用

```shell
java --javaagent:${agent path}\agent\sermant-agent.jar=appName=default -jar demo-0.0.1-SNAPSHOT.jar
```

### 验证

调用接口<http://127.0.1:12345>, 判断接口是否成功返回， 若成功返回则说明插件已成功生效。
接口地址中IP、端口为monitor监控插件配置中配置的IP端口信息。若未使用默认值，则同步调整验证地址。
