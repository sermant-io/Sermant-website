# Introduction to Sermant Development and Usage

Sermant is a bytecode enhancement technology based on Java Agent. It uses Java Agent to enhance the host application in a non-intrusive way to solve the microservice governance problem of Java applications. The original intention of Sermant is to establish a solution ecosystem for micro-service governance that is non-intrusive to the development state, reduce the difficulty of service governance development and use, and achieve the effect of simplified development and plug-and-play by means of abstract interface, function integration and plugin isolation.

This document describes how to develop and use Sermant in detail.

## Runtime Environment

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)
- [Apache Maven 3](https://maven.apache.org/download.cgi)

## Project Modules

**Sermant** contains the following modules:

- [sermant-agentcore](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore): *Java Agent* related content
  - [sermant-agentcore-core](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core): Core framework of **Sermant**
  - [sermant-agentcore-premain](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-premain): *Java Agent* entry module
  - [sermant-agentcore-implement](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-implement): Implemention of core function of **Sermant**
  - [sermant-agentcore-config](https://github.com/huaweicloud/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-config): Configuration module of the framework
- [sermant-backend](https://github.com/huaweicloud/Sermant/tree/develop/sermant-backend): Server side of message sending module 
- [sermant-package](https://github.com/huaweicloud/Sermant/tree/develop/sermant-package): Packaging module
- [sermant-plugins](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins):  Root module of plugins, contains a variety of functional plugins and related add-ons
- [sermant-injector](https://github.com/huaweicloud/Sermant/tree/develop/sermant-injector): Admission webhook module for deployment of sermant-agent via containers 

## Packaging Steps

The packaging process of **Sermant** is roughly divided into the following steps:

- *agent*: Compile or package core function and stable plugins
- *package*: Archive packaging results as a product package
- *release*: Publish built artifacts to Maven Central Repository
- *test*: Compile or package all the modules in Sermant

Execute the following *maven* command which packages the **Sermant** project by default with *agent*：

```shell
mvn clean package -Dmaven.test.skip
```

After the command is executed, a folder such as `sermant-agent-x.x.x` and a compressed file such as `sermant-agent-x.x.x.tar.gz` will be generated in the project directory. The latter is the product package of **sermant** and the former is the decompressed content of the product package.

## Product Directory

- *agent*: Java Agent related product
  - *config*: Configuration file directory
    - *bootstrap.properties*: Startup configuration
    - *config.properties*: Core function configuration
    - *plugins.yaml*: Plugin configuration, which config the plugin functionality that needs to be loaded
  - *core/sermant-agentcore-core-x.x.x.jar*: Core framework of **Sermant**
  - implement/sermant-agentcore-implement-x.x.x.jar: Implemention of core function of **Sermant**
  - *pluginPackage*: Plugin package directory, where plugins are classified by feature name
    - *xxx*: Any plugin functionality
      - *config/config.yaml*: Plugin configuration file
      - *plugin*: Plugin package directory
      - *service*: plugin service's package directory
  - *sermant-agent.jar*: Java Agent entry package
- *server*: Server directory, which contains server with **Sermant**, plugin server and client

## Containerized Deployment
In K8S environment, Sermant supports quickly deployment by using Sermant-Injector module to automatically mount Sermant-Agent package for host application. To know more about deploying Sermant-Injector and host applications, you can refer to [Containerized Deployment Guide](https://github.com/huaweicloud/Sermant/tree/develop/docs/user-guide/injector.md).

## Plugin Development

How to develop a new plugin module？You can refer to the [Plugin Module Development Guide](https://github.com/huaweicloud/Sermant/tree/develop/docs/dev-guide/dev_plugin_module.md) for details on adding plugins, plugin services, and add-ons.

How to write a plugin can be found in the [Plugin Code Development Guide](https://github.com/huaweicloud/Sermant/tree/develop/docs/dev-guide/dev_plugin_code.md), which covers most of the possible scenarios in developing a plugin.