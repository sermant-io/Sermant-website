# 离群实例摘除

本文介绍如何使用[离群实例摘除插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-service-removal)。

## 功能介绍

离群实例摘除插件通过无侵入的方式检测应用实例的可用性，并对异常的应用实例进行摘除操作，以保证服务的稳定性。离群实例摘除插件会在一段时间过后重新检测被摘除实例的可用性，若实例恢复正常则取消对其的摘除操作。

## 参数配置

### 插件配置

离群实例摘除插件需要配置离群实例摘除插件开关（`removal.config.enableRemoval`）、实例调用信息过期时间（`removal.config.expireTime`）、插件支持的服务调用异常情况（`removal.config..exceptions`）、实例摘除后的恢复时间（`removal.config.recoveryTime`）和离群实例摘除规则（`removal.config.rules`）,可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-removal/config/config.yaml`找到该插件的配置文件， 配置如下所示：

```yaml
# 离群实例摘除插件配置
removal.config:
  expireTime: 60000       # 实例调用信息过期时间。单位：毫秒
  exceptions:             # 插件支持的服务调用异常情况
    - com.alibaba.dubbo.remoting.TimeoutException
    - org.apache.dubbo.remoting.TimeoutException
    - java.util.concurrent.TimeoutException
    - java.net.SocketTimeoutException
  enableRemoval: false    # 离群实例摘除开关
  recoveryTime: 30000     # 实例摘除之后的恢复时间
  rules:                  # 离群实例摘除规则，key：服务名称（为default-rule时针对所有服务都生效），scaleUpLimit：离群实例摘除比例上限。minInstanceNum：最小实例数。
    - { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }
```

| 参数键                               | 说明                        | 默认值        | 是否必须 |
| :----------------------------------- | :------------------------- | :------------| :------- |
| removal.config.expireTime         | 实例调用信息过期时间            | 60000      | 是    |
| removal.config.exceptions         | 插件支持的服务调用异常情况       | com.alibaba.dubbo.remoting.TimeoutException <br>org.apache.dubbo.remoting.TimeoutException <br>java.util.concurrent.TimeoutException <br>java.net.SocketTimeoutException | 是    |
| removal.config.enableRemoval      | 实例摘除插件的开关      | false      | 是    |
| removal.config.recoveryTime       | 实例摘除之后的恢复时间 | 30000 | 是    |
| removal.config.rules           | 离群实例摘除规则：<br>key：服务名称（为default-rule时针对所有服务都生效）<br>scaleUpLimit：离群实例摘除比例上限 <br>minInstanceNum：最小实例数               | { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }          | 是    |

## 详细摘除规则

离群实例摘除插件也支持基于动态配置中心进行配置发布，配置发布可以参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)。

其中key值为**sermant.removal.config**。group值为**app=${service.meta.application}&environment=${service.meta.environment}**，即应用配置。service.meta.application、service.meta.environment的配置请参考[Sermant-agent使用手册](../user-guide/sermant-agent.md#sermant-agent使用参数配置)。

> **说明：** 应用配置说明参考[CSE配置中心概述](https://support.huaweicloud.com/devg-cse/cse_devg_0020.html)。

content值为具体的离群实例摘除规则配置。配置内容如下：

```yaml
expireTime: 60000       # 实例调用信息过期时间。单位：毫秒
exceptions:             # 插件支持的服务调用异常情况
  - com.alibaba.dubbo.remoting.TimeoutException
  - org.apache.dubbo.remoting.TimeoutException
  - java.util.concurrent.TimeoutException
  - java.net.SocketTimeoutException
enableRemoval: false    # 离群实例摘除开关
recoveryTime: 30000     # 实例摘除之后的恢复时间
rules:                  # 离群实例摘除规则，key：服务名称（为default-rule时针对所有服务都生效），scaleUpLimit：离群实例摘除比例上限。minInstanceNum：最小实例数。
  - { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }
```

> **注意：** 新增配置时，请去掉注释，否则会导致新增失败。

## 支持版本与限制

框架支持：
- SpringBoot 1.5.10.Release及以上
- Dubbo 2.6.x-2.7.x

## 操作和结果验证

下面将演示如何使用离群实例摘除插件，验证采用ZooKeeper配置中心为SpringCloud应用配置离群摘除规则场景。

### 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v1.4.0/sermant-examples-removal-demo-1.4.0.tar.gz) Demo二进制产物压缩包
- [下载](https://github.com/sermant-io/Sermant/releases/download/v1.4.0/sermant-1.4.0.tar.gz) Sermant
  Release包（当前版本推荐1.4.0版本）
- [下载](https://zookeeper.apache.org/releases#download) 并启动ZooKeeper

> **注意：** [动态配置中心](../user-guide/configuration-center.md)会在本场景中默认使用，由于非本场景的核心组件，因此在本文中不额外赘述。

### 步骤一：获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`rest-consumer.jar`和`rest-provider.jar`。

### 步骤二：修改配置

- 修改离群摘除插件配置，可在`${path}/sermant-agent-x.x.x/agent/pluginPackage/service-removal/config/config.yaml`找到该配置文件。

```yaml
removal.config:
  expireTime: 60000       # 实例调用信息过期时间。单位：毫秒
  exceptions:             # 插件支持的服务调用异常情况
    - com.alibaba.dubbo.remoting.TimeoutException
    - org.apache.dubbo.remoting.TimeoutException
    - java.util.concurrent.TimeoutException
    - java.net.SocketTimeoutException
  enableRemoval: true     # 离群实例摘除开关
  recoveryTime: 30000     # 实例摘除之后的恢复时间
  rules:                  # 离群实例摘除规则，key：服务名称（为default-rule时针对所有服务都生效），scaleUpLimit：离群实例摘除比例上限。minInstanceNum：最小实例数。
    - { key: default-rule, scaleUpLimit: 0.6, minInstanceNum: 1, errorRate: 0.6 }
```

### 步骤三：启动应用

- 参考如下命令启动Demo应用

（1）启动消费者

```shell
# Run under Linux
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar=appName=default -Dniws.loadbalancer.availabilityFilteringRule.filterCircuitTripped=false -jar rest-consumer.jar
```

```shell
# Run under Windows
java -javaagent:${path}\sermant-agent-x.x.x\agent\sermant-agent.jar=appName=default -Dniws.loadbalancer.availabilityFilteringRule.filterCircuitTripped=false -jar rest-consumer.jar
```

（2）启动生产者
```shell
# windows,Linux,mac
java -jar rest-provider.jar
```

（3）启动第二个生产者

```shell
# windows,Linux,mac
java -Dtimeout=2000 -Dserver.port=8006 -jar rest-provider.jar
```


> **注意：** ${path}为sermant实际安装路径，x.x.x代表sermant某个版本号。

### 验证

通过浏览器一直访问`http://localhost:8005/hello`，刚开始会出现服务请求成功和请求异常两种情况。30秒后异常实例会被摘除，摘除后会一直请求成功。30秒后摘除的异常实例会恢复，会重新出现请求异常。

查询效果图如下所示：

- 请求成功效果图
<MyImage src="/docs-img/removal-req-success.png"/>

- 请求失败效果图
<MyImage src="/docs-img/removal-req-fail.png"/>