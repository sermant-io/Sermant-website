# 简介
## Sermant是什么

**Sermant**是基于Java字节码增强技术的无代理的服务网格技术。其利用JavaAgent为宿主应用程序提供增强的服务治理功能，以解决大规模微服务场景中的服务治理问题。

## 架构
Sermant的愿景还包括构建插件开发生态系统，以帮助开发人员更容易地开发服务治理功能，同时不干扰业务代码。Sermant架构描述如下。

<MyImage src="/docs-img/sermant-product-arch.png"></MyImage>

根据上图，Sermant中JavaAgent包含两层功能。

- 框架核心层。核心层提供Sermant的基本框架功能，以简化插件开发。该层的功能包括心跳、数据传输、动态配置等。
- 插件服务层。插件为宿主应用提供实际的治理服务。开发者可以直接利用框架核心服务开发简单插件，也可以开发插件自身的复杂服务治理功能来开发复杂插件。

Sermant中的JavaAgent广泛采用类隔离技术，以消除框架代码、插件代码和宿主应用程序代码之间的类加载冲突。

使用Sermant的微服务架构具有以下三个组件，如下图所示。

<MyImage src="/docs-img/sermant-rt-arch.png"></MyImage>

- Sermant JavaAgent：动态地为宿主应用程序提供服务治理能力。
- Sermant Backend：为JavaAgent的上传数据提供连接和预处理服务。
- Dynamic configuration center：通过动态更新监听的JavaAgent的配置来提供指令。Sermant项目不直接提供动态配置中心。这些项目目前支持servicecomb-kie等。