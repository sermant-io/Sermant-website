# 零代码修改，教你Spring Cloud应用轻松接入CSE
## 一、 Sermant Agent介绍
Sermant Agent是一种基于JavaAgent的无代理服务网格技术。它利用JavaAgent来检测主机应用程序，并具有增强的服务治理功能，以解决海量微服务架构中的服务治理问题。

Sermant Agent处于快速发展阶段，当前已支持多种服务治理能力，包含流量治理、注册、优雅上下线及动态配置能力。

## 二、 为何使用Sermant Agent接入

### 代码零侵入，配置很简单
相较于SDK方式接入，基于Sermant Agent的接入会更加快捷高效，配置简单，且应用无需做任何代码改造，仅需在服务启动时附带Sermant Agent即可动态接入到CSE。

### 支持多种治理能力
Sermant Agent默认集成流量治理能力，当前支持熔断、限流、隔离仓以及重试治理能力，该能力可基于CSE配置中心进行配置与发布。

### 支持多种注册中心
Sermant Agent目前支持业内主流的注册中心，已经支持了ServiceComb ServiceCenter、Naocs，Eureka、Zookeeper等正在开发中。

### 支持应用不停机迁移
Sermant Agent支持服务的双注册，可根据配置中心下发的服务订阅策略，动态修改当前服务的订阅策略，并基于该能力帮助线上应用在业务不中断的前提下完成服务迁移。

不仅如此，Sermant Agent提供优雅上下线能力，在服务重启、上下线时提供保障，在保护服务的同时，规避服务下线时可能存在的流量丢失问题。

## 三、 接入原理
当然，在说明原理之前，我们首先需要了解什么是Java Agent。

Java Agent是在JDK1.5之后引入的新特性，它支持JVM将字节码文件读入内存之后，JVM使用对应的字节流在Java堆中生成一个Class对象之前，用户可以对其字节码进行修改的能力，JVM使用修改之后的字节码进行Class对象的创建，从而实现Java应用的非代码侵入的业务逻辑修改和替换。

Sermant Agent正是基于动态修改字节码的技术，在服务启动时，动态增强原服务的注册逻辑。那Sermant Agent是如何在不修改代码的前提下接入CSE呢？主要流程如下：

<MyImage src="/docs-img/sermant-cse-diagram.png"></MyImage>

包含以下6个步骤：

首先服务携带Sermant Agent启动；
服务启动时，针对服务执行字节码增强操作（基于Java Agent的字节码增强），主要针对注册与配置两块，在步骤3-5体现；
通过字节码增强，动态识别原应用的注册中心；
注入启动配置，动态关闭原应用的注册中心自动配置逻辑；
随后通过Spring的SpringFactory机制注入基于Spring Cloud实现的注册CSE的自动配置类，由Spring接管；
当应用发起注册时，会通过步骤5注入的注册逻辑向CSE发起注册，最终完成接入。

## 四、 简单零代码修改，轻松接入CSE
接入场景分为虚机接入和容器接入，大家可以根据自身需求选择合适的接入方式。

### 虚机场景接入CSE
虚机部署的应用可通过Sermant Agent接入到CSE。

接入流程

基于ECS将应用接入CSE流程如下：

<MyImage src="/docs-img/virtual-machine-cse.png"></MyImage>

### 容器场景接入CSE
容器部署的应用可通过Sermant Injector自动挂载Sermant Agent，从而通过Sermant Agent接入到CSE。

接入流程

基于CCE将应用接入CSE流程如下：

<MyImage src="/docs-img/container-to-cse.png"></MyImage>

## 五、 更多
### 支持版本
当前Sermant已支持大部分业内主流版本，相关Spring及注册中心版本如下：

<MyImage src="/docs-img/support-version.png"></MyImage>