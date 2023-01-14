# 日志功能

本文档介绍Sermant插件如何使用日志功能。

考虑到依赖隔离的问题，[**Sermant**核心功能模块](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core)提供给`插件主模块(plugin)`和`插件服务模块(service)`使用的日志是**jul**日志，通过以下方法获取**jul**日志实例：

```java
import com.huaweicloud.sermant.core.common.LoggerFactory;
Logger logger=LoggerFactory.getLogger();
```
打印不同级别的日志：
```java
LOGGER.severe("severe");
LOGGER.warning("warning");
LOGGER.info("info");
LOGGER.fine("fine");
```