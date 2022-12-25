# Sermant使用介绍

Sermant 是基于Java Agent的字节码增强技术，通过 Java Agent 对宿主应用进行非侵入式增强，以解决Java应用的微服务治理问题。Sermant的初衷是建立一个面向微服务治理的对开发态无侵入的解决方案生态，降低服务治理开发和使用的难度，通过抽象接口、功能整合、插件隔离等手段，达到简化开发、功能即插即用的效果。

## 架构简介

**Sermant**包含两层功能。
- 框架核心层：提供Sermant的基本框架功能，以简化插件开发。
- 插件服务层：插件为宿主应用提供实际的治理服务。

**Sermant**包含以下模块：

- [sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore): *Java Agent*相关内容
    - [sermant-agentcore-core](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core): 核心框架模块
    - [sermant-agentcore-premain](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-premain): *Java Agent*入口模块
    - [sermant-agentcore-implement](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-implement): 核心功能实现模块
    - [sermant-agentcore-config](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-config): 配置模块
- [sermant-backend](https://github.com/huaweicloud/Sermant/tree/develop/sermant-backend): 消息发送模块服务端
- [sermant-package](https://github.com/huaweicloud/Sermant/tree/develop/sermant-package): 打包模块
- [sermant-plugins](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins): 插件根模块，内含各种功能的插件及相关附加件
- [sermant-injector](https://github.com/huaweicloud/Sermant/tree/develop/sermant-injector): sermant-agent容器化部署Admission Webhook组件

## 版本支持介绍

### JavaAgent 支持的版本

JavaAgent支持Linux、Windows、Aix操作系统,支持JDK 1.6及以上版本，建议使用JDK 1.8版本。

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

### 配置中心支持的版本

目前Sermant支持的配置中心:
- [ZooKeeper](https://zookeeper.apache.org/releases.html)，使用版本为3.6.3。
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/)，使用的版本为0.2.0.

### injector支持的版本

injector是sermant-agent容器化部署Admission Webhook组件，支持在k8s **1.15**版本及以上环境部署。

