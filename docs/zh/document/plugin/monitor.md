# 监控

本文介绍如何使用[监控插件](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-monitor)。

## 功能介绍

监控插件用于监控宿主应用所在服务器的CPU、内存、磁盘IO和网络IO等硬件资源的使用情况，JVM资源使用情况比如堆内存使用、非堆内存使用、缓存区使用，吞吐量（QPS、TPS、平均响应时间）。监控插件依赖Prometheus进行指标收集，Prometheus会定期拉取监控插件采集的指标数据。

## 参数配置

### 插件配置

监控插件需要开启监控启用开关（`monitor.config.enable-start-service`）、宿主应用使用的IP/域名（`monitor.config.address`）、宿主服务的端口（`monitor.config.port`）和上报方式（`monitor.config.reportType`）,可在路径`${sermant-agent-x.x.x}/agent/pluginPackage/monitor/config/config.yaml`找到该插件的配置文件， 配置如下所示：

```yaml
monitor.config:                       # 监控插件配置
  enable-start-service: false         # 监控插件启动开关
  address: 127.0.0.1                  # 宿主应用的IP地址/域名（建议使用HTTPS）
  port: 12345                         # 宿主应用的端口
  reportType: PROMETHEUS              # 监控指标上报方式  目前只支持PROMETHEUS
  userName:                           # 授权信息--授权用户名
  password:                           # 授权信息--授权用户密码--AES加密
  key:                                # 授权用户密码加密使用的KEY
```

| 参数键 | 说明 | 默认值 | 是否必须 |
| ----- | ---- | ------- | ------- |
| monitor.config.enable-start-service | 监控插件启动开关 | false | 是 |
| monitor.config.address | 宿主应用的IP地址/域名（建议使用HTTPS） | 127.0.0.1 | 是 |
| monitor.config.port | 宿主应用的端口 | 12345 | 是 |
| monitor.config.reportType | 监控指标上报方式  目前只支持PROMETHEUS | PROMETHEUS | 是 |
| monitor.config.userName | 授权信息--授权用户名 | 空 | 否 |
| monitor.config.password | 授权信息--授权用户密码--AES加密 | 空 | 否 |
| monitor.config.key | 授权用户密码加密使用的KEY | 空 | 否 |

## 支持版本和限制

框架支持：
- SpringBoot 1.5.10.Release及以上
- Dubbo 2.6.x-2.7.x

限制：
- 依赖Prometheus

## 详细治理规则

监控插件目前能采集的指标数据如下表所示：

| 指标名 | 说明 | 指标类型 |
| :----- | :---- | :------- |
| cpu_user | 用户态时间占比 | CPU |
| cpu_sys | 系统时间占比 | CPU |
| cpu_wait | 等待时间百分占比 | CPU |
| cpu_idle | 空闲时间占比 | CPU |
| cpu_cores | CPU物理核心数 | CPU |
| memory_total | 总内存大小 | memory |
| memory_swap | 缓存内存用的交换空间的大小 | memory |
| memory_cached | 缓存内存的物理内存总量 | memory |
| memory_buffer | 给文件做缓冲大小 | memory |
| memory_used | 已使用的内存大小 | memory |
| disk_readBytesPerSec | 采集周期内的磁盘每秒读字节数 | 磁盘IO |
| disk_writeBytesPerSec | 采集周期内的磁盘每秒写字节数 | 磁盘IO |
| disk_ioSpentPercentage | 采集周期内，磁盘IO花费的时间百分占比 | 磁盘IO |
| network_readBytesPerSec | 采集周期内的网络每秒读字节数 | 网络 |
| network_writeBytesPerSec | 采集周期内的网络每秒读字节数 | 网络 |
| network_readPackagePerSec | 采集周期内的网络每秒写字节数 | 网络 |
| network_writePackagePerSec | 采集周期内，网络IO花费的时间百分占比 | 网络 |
| heap_memory_init | 堆内存初始化值 | JVM |
| heap_memory_max | 堆内存最大值 | JVM |
| heap_memory_used | 堆内存已使用 | JVM |
| heap_memory_committed | 堆内存已提交 | JVM |
| non_heap_memory_init | 非堆内存初始化值 | JVM |
| non_heap_memory_max | 非堆内存最大值 | JVM |
| non_heap_memory_used | 非堆内存已使用值 | JVM |
| non_heap_memory_committed | 非堆内存已提交 | JVM |
| code_cache_init | 代码缓存区初始化值 | JVM |
| code_cache_max | 代码缓存区最大值 | JVM |
| code_cache_used | 代码缓存区已使用 | JVM |
| code_cache_committed | 代码缓存区已提交 | JVM |
| meta_sapce_init | 元空间初始化值 | JVM |
| meta_sapce_max | 元空间最大值 | JVM |
| meta_sapce_used | 元空间已使用值 | JVM |
| meta_sapce_committed | 元空间已提交值 | JVM |
| compressed_class_space_init | 压缩类空间初始化值 | JVM |
| compressed_class_space_max | 压缩类空间最大值 | JVM |
| compressed_class_space_used | 压缩类空间已使用值 | JVM |
| compressed_class_space_committed | 压缩类空间已提交值 | JVM |
| eden_init | eden区内存初始化值 | JVM |
| eden_max | eden区内存最大值 | JVM |
| eden_used | eden区内存已使用值 | JVM |
| eden_committed | eden区内存已提交值 | JVM |
| survivor_init | survivor区内存初始化值 | JVM |
| survivor_max | survivor区内存最大值 | JVM |
| survivor_used | survivor区内存已使用值 | JVM |
| survivor_committed | survivor区内存已提交值 | JVM |
| old_gen_init | 老年代内存初始化值 | JVM |
| old_gen_max | 老年代内存最大值 | JVM |
| old_gen_used | 老年代内存已使用值 | JVM |
| old_gen_committed | 老年代内存已提交值 | JVM |
| thread_live | 活动线程 | JVM |
| thread_peak | 线程峰值 | JVM |
| thread_daemon | 守护线程 | JVM |
| new_gen_count | 年轻代GC次数 | JVM |
| new_gen_spend | 年轻代GC耗时 | JVM |
| old_gen_count | 老年代GC次数 | JVM |
| old_gen_spend | 老年代GC耗时 | JVM |
| cpu_used | JVM占用CPU情况 | JVM |
| start_time | JVM已经启动时间，毫秒数 | JVM |
| qps | 每秒请求数 | 吞吐量 |
| tps | 每秒请求处理数 | 吞吐量 |
| avg_response_time | 平均响应时间 | 吞吐量 |

## 操作和结果验证

下面将演示如何使用监控插件。

### 准备工作

- 下载[demo应用](https://start.spring.io/#!type=maven-project&language=java&platformVersion=2.7.7&packaging=jar&jvmVersion=1.8&groupId=com.example&artifactId=demo&name=demo&description=Demo%20project%20for%20Spring%20Boot&packageName=com.example.demo&dependencies=web)
- 下载/编译sermant包

### 步骤一：编译打包demo应用
执行如下命令对demo应用进行打包:

```shell
mvn clean package
```
可以得到demo-0.0.1-SNAPSHOT.jar包。


### 步骤二：修改monitor监控插件配置
```yaml
monitor.config:                       # 监控服务配置
  enable-start-service: true          # 对外服务开关 -- 开关true时prometheus可以调用服务端口获取指标信息
  address: 127.0.0.1                  # 修改为宿主服务IP。
  port: 12345                         # 修改为对外提供服务端口。
```

### 步骤三：启动应用

参考如下命令启动demo应用

```shell
java --javaagent:${sermant-agent-x.x.x}\agent\sermant-agent.jar=appName=default -jar demo-0.0.1-SNAPSHOT.jar
```

### 验证

调用接口<http://127.0.0.1:12345>, 判断接口是否成功返回， 若成功返回则说明插件已成功生效。
接口地址中IP、端口为monitor监控插件配置中配置的IP端口信息。若未使用默认值，则同步调整验证地址。
