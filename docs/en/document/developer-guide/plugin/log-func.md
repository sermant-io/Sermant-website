# Log

This document describes how the Sermant plugin uses the log function.

Considering dependency isolation, [**Sermant** core module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core) provides the `plugin` and `service` to use **jul** log. Get the **jul** log instance by:

```java
import com.huaweicloud.sermant.core.common.LoggerFactory;
Logger logger=LoggerFactory.getLogger();
```
To print logs of different levels:
```java
LOGGER.severe("severe");
LOGGER.warning("warning");
LOGGER.info("info");
LOGGER.fine("fine");
```