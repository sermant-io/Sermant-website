# Introduction
## What is Sermant?

**Sermant** (also known as Java-mesh) is a proxyless **ser**vice **m**esh technology based on J**a**va Age**nt** . It leverages the [Java Agent](https://docs.oracle.com/javase/8/docs/api/java/lang/instrument/package-summary.html) to instrument the host application with enhanced service governance function, in order to solve the service governance problem, in the massive micro-service architecture.

## Architecture

Sermant's purpose also includes building a plugin-development ecosystem to help developers develop the service governance function more easily while not interfering the business code. The Sermant architecture is depicted as follows.

<MyImage src="/docs-img/sermant-product-arch.png"></MyImage>

As described above, Sermant's Java Agent has two layers of functions.

- Framework core layer. The core layer provides Sermant's basic framework capability, in order to ease the plugin development. The function of this layer includes heart beat, data transmit, dynamic configuration, etc.
- Plugin service layer. The plugin provides actual governance service for the application. The developer can either develop simple plugin by directly leveraging framework core service, or can develop complex plugin by developing plugin's own complex service-governance function.

Sermant's Java Agent widely adopts class isolation technology in order to eliminate the class load conflicts between framework code, plugin code, and application code.

A microservice architecture using Sermant has the following three components, which is depicted in the following diagram.

<MyImage src="/docs-img/sermant-rt-arch.png"></MyImage>

- Sermant Java Agent: dynamically instrument the application for the service governance capability.
- Sermant Backend: provide the connection and the pre-processing service for the Java Agents' all uploaded-data.
- Dynamic configuration center: Providing the instructions by dynamically update the config to the listening Java Agent. Dynamic configuration center is not directly provided by Sermant project. The projects currently support servicecomb-kie, etc.