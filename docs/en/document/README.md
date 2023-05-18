# Introduction
## What is Sermant?

**Sermant** is a proxyless service mesh technology based on JavaAgent. It uses JavaAgent to provide enhanced service governance functions for host applications to solve the problem of service governance in large-scale microservice scenarios.

## Architecture

Sermant's purpose also includes building a plugin-development ecosystem to help developers develop the service governance function more easily while not interfering the business code. The Sermant architecture is depicted as follows.

<MyImage src="/docs-img/sermant-product-arch.png"></MyImage>

As described above, Sermant's JavaAgent has two layers of functions.

- Framework core layer. The core layer provides Sermant's basic framework capability, in order to ease the plugin development. The function of this layer includes heart beat, data transmit, dynamic configuration, etc.
- Plugin service layer. The plugin provides actual governance service for the application. The developer can either develop simple plugin by directly leveraging framework core service, or can develop complex plugin by developing plugin's own complex service-governance function.

Sermant's JavaAgent widely adopts class isolation technology in order to eliminate the class load conflicts between framework code, plugin code, and application code.

A microservice architecture using Sermant has the following three components, which is depicted in the following diagram.

<MyImage src="/docs-img/sermant-rt-arch.png"></MyImage>

- Sermant JavaAgent: dynamically instrument the application for the service governance capability.
- Sermant Backend: provide the connection and the pre-processing service for the JavaAgents' all uploaded-data.
- Dynamic configuration center: Providing the instructions by dynamically update the config to the listening JavaAgent. Dynamic configuration center is not directly provided by Sermant project. The projects currently support servicecomb-kie, etc.