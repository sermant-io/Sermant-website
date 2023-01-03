# 监控

本文档主要用于[monitor模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-monitor)的使用说明

## 功能介绍

资源监控模块用于监控宿主应用所在服务器的CPU、内存、磁盘IO和网络IO等硬件资源的使用情况，宿主应用Java虚拟机已经微服务的使用情况、微服务公共指标采集。

监控模块依赖于prometheus进行指标收集,prometheus定期调用java agent的httpServer服务，获取插件注册的指标信息，并进行存储展示。


## 参数配置

```yaml
monitor.config:                       # 监控服务配置
  enable-start-service: false         # 监控服务启动开关
  address: 127.0.0.1                  # 宿主服务的地址（建议使用HTTPS）
  port: 12345                         # 宿主服务的端口信息
  reportType: PROMETHEUS              # 监控指标上报方式  目前只支持HTTPS
  userName:                           # 授权信息--授权用户名
  password:                           # 授权信息--授权用户密码--AES加密--参见AESUtil
  key:                                # 授权用户密码加密使用的KEY
```

### monitor模块说明

*使用背景*

本服务包含三个采集子服务，分别为Linux资源监控采集、JVM资源监控、微服务监控采集

- Linux资源监控采集功能需要宿主应用部署在Linux环境。
- JVM内存监控采集功能需要宿主应用使用OpenJDK或者基于OpenJDK的JDK版本
- 微服务监控主要采集Dubbo服务以及Spring Cloud服务的指标信息

*功能说明*

- **Linux资源监控采集**：通过执行linux命令获取系统CPU、内存、磁盘IO、网络IO资源使用情况数据，并注册到prometheus的默认注册器。
```shell
  #CPU
  cat /proc/stat
  #MEMORY
  cat /proc/meminfo
  #DISK
  cat /proc/diskstats
  #NETWORK
  cat /proc/net/dev
  #CPU CORE
  lscpu
  ```
- **采集内容**
```shell
  #CPU
  double cpu_user;  // 用户态时间占比
  double cpu_sys;   // 系统时间占比
  double cpu_wait;  // 等待时间百分占比
  double cpu_idle;  // 空闲时间占比
  double cpu_cores; // CPU物理核心数
```

```shell
  内存使用情况  
  double memory_total;  // 总内存大小
  double memory_swap;   // 对应cat /proc/meminfo指令的SwapCached
  double memory_cached; // 对应cat /proc/meminfo指令的Cached
  double memory_buffer; // 对应cat /proc/meminfo指令的Buffers
  double memory_used;   // 已使用的内存大小
```

```shell
  内存使用情况  
  double memory_total;  // 总内存大小
  double memory_swap;   // 对应cat /proc/meminfo指令的SwapCached
  double memory_cached; // 对应cat /proc/meminfo指令的Cached
  double memory_buffer; // 对应cat /proc/meminfo指令的Buffers
  double memory_used;   // 已使用的内存大小
```

```shell
  磁盘IO
  double disk_readBytesPerSec;   // 采集周期内的每秒读字节数
  double disk_writeBytesPerSec;  // 采集周期内的每秒写字节数
  double disk_ioSpentPercentage; // 采集周期内，IO花费的时间百分占比
```

```shell
  网络
  double network_readBytesPerSec;    // 采集周期内的每秒读字节数
  double network_writeBytesPerSec;   // 采集周期内的每秒写字节数
  double network_readPackagePerSec;  // 采集周期内的每秒读包数
  double network_writePackagePerSec; // 采集周期内的每秒写包数
```

- **JVM监控采集**：定时从java.lang.management.ManagementFactory获取JVM的指标情况

```shell
    JVM内存
    double heap_memory_init;      // 堆内存初始化值
    double heap_memory_max;       // 堆内存最大值
    double heap_memory_used       // 堆内存已使用
    double heap_memory_committed  // 堆内存已提交
    
    double non_heap_memory_init;      // 非堆内存初始化值
    double non_heap_memory_max;       // 非堆内存最大值
    double non_heap_memory_used       // 非堆内存已使用
    double non_heap_memory_committed  // 非堆内存已提交
    
    double code_cache_init;      // 代码缓存区初始化值
    double code_cache_max;       // 代码缓存区最大值
    double code_cache_used       // 代码缓存区已使用
    double code_cache_committed  // 代码缓存区已提交
    
    double meta_sapce_init;      // 元空间初始化值
    double meta_sapce_max;       // 元空间最大值
    double meta_sapce_used       // 元空间已使用
    double meta_sapce_committed  // 元空间已提交
    
    double compressed_class_space_init;      // 压缩类空间初始化值
    double compressed_class_space_max;       // 压缩类空间最大值
    double compressed_class_space_used       // 压缩类空间已使用
    double compressed_class_space_committed  // 压缩类空间已提交
    
    double eden_init;      // eden区内存初始化值
    double eden_max;       // eden区内存最大值
    double eden_used       // eden区内存已使用
    double eden_committed  // eden区内存已提交
    
    double survivor_init;      // survivor区内存初始化值
    double survivor_max;       // survivor区内存最大值
    double survivor_used       // survivor区内存已使用
    double survivor_committed  // survivor区内存已提交
    
    double old_gen_init;      // 老年代内存初始化值
    double old_gen_max;       // 老年代内存最大值
    double old_gen_used       // 老年代内存已使用
    double old_gen_committed  // 老年代内存已提交
```

```shell
    线程
    double thread_live;   // 活动线程
    double thread_peak;   // 线程峰值
    double thread_daemon; // 守护线程
```

```shell
    GC
    double new_gen_count;  // 年轻代GC次数
    double new_gen_spend;  // 年轻代GC耗时
    double old_gen_count;  // 老年代GC次数
    double old_gen_spend;  // 老年代GC耗时
```

```shell
    JVM其他指标
    double cpu_used;       // JVM占用CPU情况
    double start_time;     // JVM已经启动时间，毫秒数
```

- **微服务监控采集**：拦截宿主服务的服务请求，计算宿主服务的公共请求指标
```shell
    微服务
    double qps;                 // 每秒请求数
    double tps;                 // 每秒请求处理数
    double avg_response_time    // 平均响应时间
```

## 操作和结果验证

1. 修改插件config目前下的监控配置--config.yaml。修改对外提供服务的IP 端口 以及开关
```yaml
monitor.config:                       # 监控服务配置
  enable-start-service: false         # 对外服务开关 -- 开关true时prometheus可以调用服务端口获取指标信息
  address: 127.0.0.1                  # 修改为宿主服务IP（建议使用HTTPS地址）
  port: 12345                         # 修改为对外提供服务端口
```

2. 修改prometheus的配置文件. 在scrape_configs下增加对应的job信息（根据第一步配置的内容）

3. 宿主应用挂载java agent进行启动。

4. 启动prometheus。即可在prometheus页面上查看指标信息







