# Proxyless Service Mesh Based on Sermant and Istio

## Service Governance of Sermant in Istio Environment

A service mesh is an infrastructure layer that handles service-to-service communication. It reliably delivers requests through the complex service topology that constitutes modern cloud-native applications. In practice, service mesh is usually implemented as a lightweight array of network proxies, which are deployed alongside application code, without the application being aware of the presence of these proxies.

Istio is currently the most widely used Service Mesh product, consisting of a control plane and a data plane. The data plane in Istio typically deploys separate sidecar containers to proxy microservices, resulting in additional performance overhead, including increased CPU usage and significant growth in service call latency. Additionally, this setup increases system complexity and the difficulty of operations and maintenance.

The Sermant xDS service allows microservices to integrate with Istio in a Kubernetes environment. Sermant communicates directly with Istio's control plane based on the xDS protocol to obtain configuration information such as service discovery and routing, thereby replacing Envoy as Istio's data plane for service governance.

Sermant is a cloud-native, proxyless service mesh based on a Java Agent. Microservices run Sermant in the same process, eliminating the need to start additional sidecar containers for network proxying. This significantly reduces application performance overhead and call latency between services.

### Istio+Sermant Sidecar Proxyless Mode Deployment

<MyImage src="/docs-img/xds-deploy-en.jpg" />

1. Mixed Deployment Mode: Coexistence of Sidecar Proxy Mode and Sidecar Proxyless Mode. Microservices connect to Istio and achieve service governance through a mixed deployment mode. This mode avoids modifying the existing deployment architecture, allowing only new services to use the Sidecar Proxyless Mode.
2. Proxyless Deployment Mode: All microservices use Sermant as Istio's data plane to achieve capabilities such as service discovery、routing and load balancing. Sermant can replace the capabilities provided by Envoy, currently supporting service discovery, with more features to be developed in the future.

### Advantages of using Sermant in Istio Environment

1. Sermant runs in the same process as microservices, eliminating the need to start additional sidecar containers, significantly reducing network call latency and CPU overhead.
1. Developing plugins based on the Sermant framework can achieve richer governance capabilities than Envoy, offering greater extensibility.
1. Lower architectural complexity leads to reduced deployment costs.

## Service Discovery based on xDS Service

The Sermant framework implements service discovery capabilities based on the xDS protocol. Plugins can call the xDS service discovery interface to obtain Kubernetes service instances. For detailed development guidance, please refer to [Service Discovery Development Guide Based on xDS Services](../developer-guide/sermant-xds-service.md#service-discovery-based-on-xds-protocol).

### Sermant Plugins Planned to Support xDS Service Discovery

- [Router Plugin](../plugin/router.md)
- [SpringBoot Registry Plugin](../plugin/springboot-registry.md)

## Routing based on xDS Service

In the future, the Sermant framework will implement routing configuration retrieval capabilities based on the xDS protocol, which will be used for service governance at the plugin layer.

## Load balancing based on xDS Service

In the future, the Sermant framework will implement load balancing configuration retrieval capabilities based on the xDS protocol, which will be used for service governance at the plugin layer.

## Startup and Result Verification

This tutorial demonstrates the xDS service discovery capabilities of Sermant using the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-service-discovery-demo) repository's xds-service-discovery-demo. 

This demo includes a spring-client microservice, a spring-server microservice, and a Sermant example plugin. The plugin intercepts the `hello` method of the spring-client and uses Sermant's xDS service discovery capabilities to get specific instance information of the spring-server service before executing the `hello` method, replacing the input parameter with the correct spring-server address.

### Preparations

- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-xds-service-discovery-demo-2.0.0.tar.gz) the binary package of the demo.
- Prepare the Kubernetes environment.
- Install Istio and start it.

### Obtaining the Demo Binary Package

Extract the binary package to get the `product/` directory files.

### Starting the spring-server

Enter the product/spring-server directory:

1. Execute the following command to package the spring-server image:

   ```
   sh build-server.sh
   ```

2. Execute the following command to run the spring-server pod and service:

   ```
   kubectl apply -f spring-server.yaml
   ```

### Starting the spring-client

Enter the product/spring-client directory:

1. Execute the following command to package the spring-client image:

   ```
   sh build-client.sh
   ```

2. Execute the following command to run the spring-client instance and service:

   ```
   kubectl apply -f spring-client.yaml
   ```

### Verification

Access the spring-client microservice via a web page, set the input parameter `address` to empty, and verify whether Sermant can successfully call the upstream service spring-server:

```
http://127.0.0.1:30110/hello?address=
```

The webpage shows the following message, indicating that Sermant successfully discovered the instance of spring-server and modified the `address` parameter to the correct spring-server instance address:

```
Greetings from http://xxx.xxx.xxx.xxx:8080 : hello, the current time is 2050-01-01T02:08:08.369
```

