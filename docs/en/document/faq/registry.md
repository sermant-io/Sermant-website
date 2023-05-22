# Service Registration FAQs

This document describes frequently asked questions (FAQs) about using the [service registration plugin](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-service-registry).

## Exception：No Such Extension org.apache.dubbo.registry.RegistryFactory by name sc

As shown in the following figure:

<MyImage src="/docs-img/registry-faq-1.png"/>

The possible causes are as follows:

1.1 The application is not started with the agent. The native dubbo does not support registration with the SC. Therefore, if the application started without agent and the protocol of the registration address is SC, the preceding error is reported.

1.2 The core configuration file (${agent_package_path}/agent/config/config.properties) is incorrectly configured. Check the startup log carefully and you will find an error similar to the following:

<MyImage src="/docs-img/registry-faq-2.png"/>

- The value of the configuration center type (dynamic.config.dynamic_config_type) in the core configuration file is incorrect. As a result, the host application cannot load the agent and the No such extension org.apache.dubbo.registry.RegistryFactory by name sc reports an error.

1.3 The core configuration file (${agent_package_path}/agent/config/config.properties) is incorrectly configured. Check the startup log carefully. The error information similar to the following is displayed:

<MyImage src="/docs-img/registry-faq-3.png"/>

- The configuration center address (dynamic.config.server_address) is incorrectly configured in the core configuration file, the configuration center is not started, or the network is disconnected. As a result, the host application fails to load the agent, and the No such extension org.apache.dubbo.registry.RegistryFactory by name sc reports an error.

## Exception：/sermant/master/v1/register error

As shown in the following figure:

<MyImage src="/docs-img/registry-faq-4.png"/>

The cause is that the backend is not started or the configured address is incorrect. Start the backend or configure the address correctly. For details about the backend, see the [backend document](..//user-guide/backend.md).

Note: This error does not affect the plugin registration process, but related errors may be reported.

## Exception：Connection reset

As shown in the following figure:

<MyImage src="/docs-img/registry-faq-5.png"/>

Check whether the registration center address (servicecomb.service.address) and protocol (HTTP/HTTPS) in the plugin configuration (${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml) are correct.

## Exception：https protocol is not supported

As shown in the following figure:

<MyImage src="/docs-img/registry-faq-6.png"/>

You need to enable ssl (servicecomb.service.sslEnabled) in the plugin configuration (${agent_package_path}/agent/pluginPackage/service-registry/config/config.yaml).

## Exception：No such extension org.apache.dubbo.metadata.report.MetadataReportFactory by name sc

As shown in the following figure:

<MyImage src="/docs-img/registry-faq-7.png"/>

Check the registration configuration of the dubbo application. Check whether protocol exists and is not sc.

- Example for dubbo/provider.xml

```xml
<dubbo:registry address="sc://127.0.0.1:30100" protocol="nacos"/>
```

- For example, application.yml (or application.properties). The following uses application.yml as an example.
```yml
dubbo:
  registry:
    protocol: nacos
    address: sc://127.0.0.1:30100
```

If protocol exists and is not set to sc, set protocol to sc or delete the protocol configuration.

## Exception：No registry config found or it's not a valid config

As shown in the following figure:

<MyImage src="/docs-img/registry-faq-8.png"/>

Please refer to the description of **newly developed** dubbo application in [Service Registration Plug-in Document](../plugin/service-registry.md#supported-versions-and-limitations) for the configuration of dubbo's own registry address.

## What Is The Relationship Between Plugin Configuration, enableSpringRegister/enableDubboRegister, And openMigration?

The following table describes the relationship between enableSpringRegister/enableDubboRegister and openMigration.

|enableSpringRegister/enableDubboRegister|openMigration|effect|
|---|---|---|
|true|true|Enabling the Spring Cloud/Dubbo Migration Function|
|true|false|Enable Spring cloud/Dubbo With SC Registration|
|false|true|Disabling the Registration Plugin|
|false|false|Disabling the Registration Plugin|