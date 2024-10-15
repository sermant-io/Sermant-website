# Introduction to the use of Sermant

Sermant is a bytecode enhancement technology based on JavaAgent. It uses JavaAgent to enhance the host application in a non-intrusive way to solve the microservice governance problem of Java applications. The original intention of Sermant is to establish a solution ecosystem for micro-service governance that is non-intrusive to the development state, reduce the difficulty of service governance development and use, and achieve the effect of simplified development and plug-and-play by means of abstract interface, function integration and plugin isolation. This article introduces the components currently included in Sermant and the compilation and packaging of Sermant.

## Architecture Introduction

The overall architecture of Sermant includes sermant-agent, Backend, Dynamic Configuration Center, sermant-injector and other components. Among them, sermant-agent is the implementation component of the core bytecode enhancement, and the rest are the supporting components of the Sermant architecture.

<MyImage src="/docs-img/sermant-arch.png"/>

### sermant-agent

Sermant-agent is the essential core component of Sermant, which contains bytecode enhancements of [sermant-agentcore](https://github.com/sermant-io/Sermant/tree/develop/sermant-agentcore), [sermant-plugins](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins), [sermant-common](https://github.com/sermant-io/Sermant/tree/develop/sermant-common). Sermant-agent takes effect when the host application is launched by specifying the `sermant-agent.jar'` package via the `-javaagent` argument. 

Sermant-agent is based on JavaAgent technology and supports JDK 1.6 and above.  

Please refer to the [Sermant-agent User Manual](sermant-agent.md) for more instructions on how to use sermant-agent.

### Backend

The Backend is the Sermant data processing back-end module and the front-end information display module, which mainly includes the reception and display of Sermant heartbeat information. 

The Backend is not a required component of the Sermant, but it is highly recommended deploying the Backend for the observability of the Sermant. 

Please refer to the [Sermant Backend User Manual](sermant-backend.md) for more instructions on how to use the Backend.

### Dynamic Configuration Center

Dynamic configuration center is a necessary component for Sermant when dynamic config function is enabled. This function allows Sermant to dynamically pull config from config center to achieve a variety of service governance capabilities, such as label routing, flow control, etc. If the Sermant dynamic configuration capability is not enabled, the dynamic configuration center does not need to be deployed.

Sermant dynamic configuration center currently supports two types: the [Zookeeper](https://github.com/apache/zookeeper) and [ServiceComb Kie](https://github.com/apache/servicecomb-kie).

Please refer to the [Sermant Dynamic Configuration Center User Manual](configuration-center.md) for more instructions on how to use the dynamic configuration center.

### **Sermant Injector**

Sermant provides a quick way to automatically mount Sermant from the host application in a container environment via the Sermant Injector component. Simply add `sermant-injection:enabled ` to the labels in the yaml of the application deployment to enable this functionality.

The Sermant Injector component is not required for Sermant, but it is highly recommended deploying it in a container environment for quick deployment. Currently Sermant Injector supports k8s **1.15** and above.

Please refer to [Sermant-injector User Manual](sermant-injector.md) for more instructions on how to use sermant-injector.

## Package

### How to package

The packaging process of **Sermant** is roughly divided into the following steps:

- *agent*: Compile or package core function and stable plugins
- *release*: Publish built artifacts to Maven Central Repository
- *test*: Compile or package all the modules in Sermant

Execute the following *maven* command which packages the **Sermant** project with *agent*：

```shell
mvn clean package -DskipTests -Pagent
```

After the command is executed, a folder such as `sermant-agent-x.x.x` and a compressed file such as `sermant-agent-x.x.x.tar.gz` will be generated in the project directory. The latter is the product package of **sermant** and the former is the decompressed content of the product package.

### Product Directory

`sermant-agent-x.x.x` directory contains the following content:

- *agent*: sermant-agent related product
  - *config*: contains **Sermant** configuration files
  - *core*: contains **Sermant** core framework jars
  - *implement*: contains **Sermant** core implementation jars
  - *common*: contains **Sermant** common dependencies
  - *pluginPackage*: contains the extension function plugin package and configuration files
  - *sermant-agent.jar*:  the entrance of **Sermant** via `-javaagent`
- *server*: contains servers of **Sermant**, such as Backend.

