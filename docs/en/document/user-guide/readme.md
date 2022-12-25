# Introduction to the use of Sermant

Sermant is a bytecode enhancement technology based on Java Agent. It uses Java Agent to enhance the host application in a non-intrusive way to solve the microservice governance problem of Java applications. The original intention of Sermant is to establish a solution ecosystem for micro-service governance that is non-intrusive to the development state, reduce the difficulty of service governance development and use, and achieve the effect of simplified development and plug-and-play by means of abstract interface, function integration and plugin isolation.

## Architecture Introduction

**Sermant** contains two layers of functions.
- Framework core layer: Provides basic framework functions of Sermant to simplify plug-in development.
- Plugin service layer: The plug-in provides the actual governance service for the host application.

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

## Version Support Introduction

### Versions supported by JavaAgent

JavaAgent supports Linux, Windows, and Aix operating systems, supports JDK 1.6 and above, and recommends using JDK 1.8.

- [HuaweiJDK 1.8](https://gitee.com/openeuler/bishengjdk-8) / [OpenJDK 1.8](https://github.com/openjdk/jdk) / [OracleJDK 1.8](https://www.oracle.com/java/technologies/downloads/)

### Versions supported by the configuration center

Configuration centers currently supported by Sermant:
- [ZooKeeper](https://zookeeper.apache.org/releases.html)，使用版本为3.6.3。
- [ServiceComb Kie](https://servicecomb.apache.org/cn/release/kie-downloads/)，使用的版本为0.2.0.

### Versions supported by injector

injector is a sermant-agent containerized deployment Admission Webhook component, which supports deployment in k8s **1.15** version and above.

