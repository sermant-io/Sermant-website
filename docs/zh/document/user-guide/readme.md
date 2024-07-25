# Sermant使用介绍

Sermant 是基于Java字节码增强技术的云原生无代理服务网格，通过 JavaAgent 
对宿主应用进行非侵入式增强，以解决Java应用的微服务治理问题。Sermant的初衷是建立一个面向微服务治理的对开发态非侵入的解决方案生态，降低服务治理开发和使用的难度，通过抽象接口、功能整合、插件隔离等手段，达到简化开发、功能即插即用的效果。本文介绍Sermant目前包含的组件以及Sermant的编译打包。

## 架构简介

Sermant整体架构包括[Sermant Agent](sermant-agent.md)、[Sermant Backend](sermant-backend.md)、[Sermant Injector](sermant-injector.md)、[动态配置中心](configuration-center.md)等组件。其中Sermant Agent是提供字节码增强基础能力及各类服务治理能力的核心组件，Sermant Backend、Sermant Injector、动态配置中心为Sermant提供其他能力的配套组件。

<MyImage src="/docs-img/sermant-arch.png"/>

### Sermant Agent

Sermant Agent为Sermant的核心组件，其中包含字节码增强基础能力框架及各类服务治理能力插件，Sermant Agent基于JavaAgent技术，支持Java 8及以上版本，当前已支持`premain`和`agentmain`两种方式启动。

更多Sermant Agent使用指南请参考[Sermant Agent使用手册](sermant-agent.md)。

### Sermant Backend

Sermant Backend为Sermant数据处理后端模块和前端信息展示模块，当前主要包括Sermant心跳信息的接收和展示等功能。Sermant Backend为Sermant的非必要组件，但是非常推荐用户部署Sermant Backend以获得Sermant的可观测性。

更多Sermant Backend使用指南请参考[Sermant Backend使用手册](sermant-backend.md)。

### Sermant Injector

Sermant支持在容器环境下通过Sermant Injector实现宿主应用自动挂载Sermant的快速部署方式，只需在应用部署的`yaml`中的`labels`添加`sermant-injection: enabled`即可实现该功能。Sermant Injector为Sermant非必要组件，推荐用户在容器环境中部署该组件以获得快速部署能力。当前Sermant Injector支持在k8s **1.15+** 版本部署。

更多Sermant Injector使用指南请参考[Sermant Injector使用手册](sermant-injector.md)。

### 动态配置中心

动态配置作为Sermant提供的基础功能，该功能允许Sermant动态地从配置中心拉取配置以实现丰富多样的服务治理能力，例如标签路由、流控等。在开启该功能时，需要依赖动态配置中心，Sermant目前支持三种动态配置中心：[Zookeeper](https://github.com/apache/zookeeper)、[ServiceComb Kie](https://github.com/apache/servicecomb-kie)、[Nacos](https://nacos.io/zh-cn/index.html)。如不开启Sermant动态配置能力，动态配置中心可无需部署。

更多动态配置中心使用指南请参考[动态配置中心使用手册](configuration-center.md)。

## 编译构建

### 编译打包Sermant Agent

**Sermant**项目基于Maven进行编译构建，其中包含以下几种profile，对应不同使用场景：

- *agent*: 编译打包核心功能和稳定插件
- *release*: 发布构建产物到中央仓库
- *test*: 编译打包所有项目模块

在Sermant项目根目录下执行以下*maven*命令，对**Sermant**工程使用*agent*进行打包：

```shell
mvn clean package -DskipTests -Pagent
```

命令执行完毕后，工程目录下将生成一个形如`sermant-agent-x.x.x`的文件夹和形如`sermant-agent-x.x.x.tar.gz`的压缩文件，后者为**Sermant**的产品包，前者则为产品包解压后的内容。

### Sermant Agent产品目录说明

`sermant-agent-x.x.x`目录下包含以下内容

- *agent*: 包含sermant-agent相关内容
    - *config*: 包含**Sermant**配置文件
    - *god*：包含**Sermant**的核心接口包
    - *core*: 包含**Sermant**的核心框架包
    - *implement*: 包含**Sermant**核心功能实现包
    - *common*: 包含**Sermant**公共依赖包
    - *pluginPackage*: 包含各服务治理功能插件包以及配置文件等
    - *sermant-agent.jar*: **Sermant**入口包，`premain`和`agentmain`方式启动的入口
- *server*: 包含**Sermant**的服务端Sermant Backend。
