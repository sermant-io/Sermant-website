# Sermant使用介绍

Sermant 是基于Java Agent的字节码增强技术，通过 Java Agent 对宿主应用进行非侵入式增强，以解决Java应用的微服务治理问题。Sermant的初衷是建立一个面向微服务治理的对开发态无侵入的解决方案生态，降低服务治理开发和使用的难度，通过抽象接口、功能整合、插件隔离等手段，达到简化开发、功能即插即用的效果。本文介绍Sermant目前包含的组件以及Sermant的编译打包。

## 架构简介

Sermant整体架构包括sermant-agent、Backend、动态配置中心、sermant-injector等组件。其中sermant-agent为核心字节码增强的实现组件，其余为Sermant架构的配套组件。

### sermant-agent

sermant-agent为Sermant必要核心组件，其包含[sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore)、[sermant-plugins](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins)、[sermant-common](https://github.com/huaweicloud/Sermant/tree/develop/sermant-common)等字节码增强逻辑的实现主体，在宿主应用启动时通过`-javaagent`参数指定`sermant-agent.jar`包来挂载生效。

sermant-agent基于Java Agent技术，支持JDK 1.6及以上版本。

更多sermant-agent使用指南请参考[sermant-agent使用手册](sermant-agent.md)。

### Backend

Backend为Sermant数据处理后端模块和前端信息展示模块，当前主要包括Sermant心跳信息的接收和展示等功能。

Backend为Sermant的非必要组件，但是非常推荐用户部署Backend以获得Sermant的可观测性。

更多Backend使用指南请参考[Backend使用手册](backend.md)。

### 动态配置中心

动态配置中心为Sermant动态配置功能启用后必要配套组件，该功能允许Sermant动态从配置中心拉取配置以实现丰富多样的服务治理能力，例如标签路由、流控等。如不开启Sermant动态配置能力，动态配置中心可无需部署。

Sermant动态配置中心目前支持两种类型：[Zookeeper](https://github.com/apache/zookeeper)和[ServiceComb Kie](https://github.com/apache/servicecomb-kie)。

更多动态配置中心使用指南请参考[Sermant动态配置中心使用手册](configuration-center.md)。

### **sermant-injector**

Sermant支持在容器环境下通过sermant-injector组件实现宿主应用自动挂载Sermant的快速部署方式，只需在应用部署的`yaml`中的`labels`添加`sermant-injection: enabled`即可实现该功能。

sermant-injector为Sermant非必要组件，但是非常推荐用户在容器环境中部署该组件以获得快速部署能力。当前sermant-injector支持在k8s **1.15**版本及以上环境部署。

更多sermant-injector使用指南请参考[sermant-injector使用手册](injector.md)。

## 编译打包

### 打包方式

**Sermant**项目中包含以下几种profile，对应不同使用场景：

- *agent*: 编译打包核心功能和发布的稳定版本插件。
- *release*: 发布构建产物到中央仓库
- *test*: 编译打包所有项目模块

执行以下*maven*命令，对**Sermant**工程使用*agent*进行打包：

```shell
mvn clean package -DskipTests -Pagent
```

命令执行完毕后，工程目录下将生成一个形如`sermant-agent-x.x.x`的文件夹和形如`sermant-agent-x.x.x.tar.gz`的压缩文件，后者为**Sermant**的产品包，前者则为产品包解压后的内容。

### 产品目录说明

`sermant-agent-x.x.x`目录下包含以下内容

- *agent*: 包含sermant-agent相关内容
    - *config*: 包含**Sermant**配置文件
    - *core*: 包含**Sermant**的核心框架包
    - implement: 包含**Sermant**核心功能实现包
    - *common*: 包含**Sermant**公共依赖包
    - *pluginPackage*: 包含各扩展功能插件包以及配置文件等
    - *sermant-agent.jar*: **Sermant**入口包，`-javaagent`参数的指定入口
- *server*: 包含**Sermant**的服务端，例如Backend等。
