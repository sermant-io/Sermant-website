# Proxyless Service Mesh Based on Sermant and Istio

This article primarily introduces the concepts, deployment patterns, and specific capabilities of the Sermant + Istio proxyless service mesh. These capabilities are implemented based on the [xDS Core Service](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/XdsCoreService.java) of the Sermant framework layer.

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

In a Kubernetes environment, users can create Pods and Services through custom resource files using [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) and [Service](https://kubernetes.io/docs/concepts/services-networking/service/). The Sermant framework implements service discovery capabilities based on the xDS protocol. Plugins can call the xDS service discovery interface to obtain instances of Kubernetes Service . For detailed development guidance, please refer to [Service Discovery Development Guide Based on xDS Services](../developer-guide/sermant-xds-service.md#service-discovery-based-on-xds-protocol).

### Template for Creating Pod and Service in Kubernetes

**Deployment**:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-test
  labels:
    app: spring-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: spring-test
  template:
    metadata:
      labels:
        app: spring-test
    spec:
      containers:
      - name: spring-test
        image: spring-test:1.0.0
        ports:
        - containerPort: 8003
```

**Service**:

```
apiVersion: v1
kind: Service
metadata:
  name: spring-test
spec:
  type: ClusterIP
  ports:
  - name: test
    port: 8003
    targetPort: 8003
    protocol: TCP
  selector:
    app: spring-test
```

> Note: Sermant uses the `metadata.name` of the Service resource file as the service name for service discovery.

### Sermant Plugins Supportting xDS Service Discovery

- [Router Plugin](../plugin/router.md#routing-based-on-the-xds-protocol)

## Routing based on xDS Service

The Sermant framework implements the ability to retrieve routing configurations based on the xDS protocol. Plugins can call the xDS routing configuration service interface to obtain routing configurations for Kubernetes Services. For specific development guidance, please refer to [Development Guide for Routing Configuration Service Based on xDS](../developer-guide/sermant-xds-service.md#route-configuration-service-based-on-xds-protocol).

### Supported Istio Routing Configuration Fields

Istio delivers routing configurations via custom resource files such as DestinationRule and VirtualService. Sermant communicates with Istio's control plane via the xDS protocol to obtain routing configurations. The following are the supported routing configuration fields:

**VirtualService**:

| Supported Fields                              | Description                                                  |
| --------------------------------------------- | ------------------------------------------------------------ |
| spec.hosts                                    | The service domain of the route                              |
| spec.hosts.http                               | HTTP route configuration                                     |
| spec.hosts.http.match                         | HTTP route matching rules                                    |
| spec.hosts.http.match.headers                 | HTTP header matching rules, supporting exact, prefix, and regex matches |
| spec.hosts.http.match.uri                     | HTTP URI matching rules, supporting exact, prefix, and regex matches |
| spec.hosts.http.match.ignoreUriCase           | HTTP URI case-insensitive matching                           |
| spec.hosts.http.route                         | HTTP route                                                   |
| spec.hosts.http.route.destination             | HTTP route destination service                               |
| spec.hosts.http.route.destination.host        | Domain name of the destination service                       |
| spec.hosts.http.route.destination.subset      | Subset of the destination service                            |
| spec.hosts.http.route.destination.port.number | Port of the destination service                              |
| spec.hosts.http.route.weight                  | Weight of the destination service                            |

**DestinationRule**:

| Supported Fields                                          | Description                   |
| --------------------------------------------------------- | ----------------------------- |
| spec.trafficPolicy                                        | Traffic policy                |
| spec.trafficPolicy.loadBalancer                           | Load balancing policy         |
| spec.trafficPolicy.loadBalancer.localityLbSetting.enabled | Same AZ routing configuration |

### Istio Routing Configuration Template

**VirtualService**:

```
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: spring-test-virtualservice
spec:
  hosts:
  - spring-test
  http:
  - name: "v1-routes"
    match:
    - headers:
        version:
          exact: v1
      uri:
        exact: /test
      ignoreUriCase: false
    route:
    - destination:
        host: spring-test
        subset: v1
        port:
          number: 8003
      weight: 100
  - name: "base-route"
    route:
    - destination:
        host: spring-test
        subset: base
        port:
          number: 8003
```

> Description: For the upstream service with the name `spring-test`, the following routing rules apply:
>
> 1. HTTP requests with the `version:v1` header and the path `/test` will be routed to the `v1 subset` of `spring-test` on port 8003.
> 2. Other HTTP requests will be routed to the `base subset` of `spring-test` on port 8003.

**DestinationRule**:

```
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: spring-test-destinationrule
spec:
  host: spring-test.default.svc.cluster.local
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      loadBalancer:
        localityLbSetting:
          enabled: true
  subsets:
  - name: base
    labels:
      version: base
    trafficPolicy:
      loadBalancer:
        localityLbSetting:
          enabled: false
```

> Description: The `spring-test` service is divided into two subsets based on the `version` label, representing two service clusters. The v1 cluster uses a same AZ routing strategy, while the base cluster does not.

In the future, the Sermant framework will implement routing configuration retrieval capabilities based on the xDS protocol, which will be used for service governance at the plugin layer.

### Sermant Plugins Supportting xDS Routing Service

- [Router Plugin](../plugin/router.md#routing-based-on-the-xds-protocol)

## Load Balancing based on xDS Service

The Sermant framework implements the ability to retrieve load balancing configurations based on the xDS protocol. Plugins can call the xDS load balancing configuration service interface to obtain load balancing configurations for Kubernetes Services. For specific development guidance, please refer to [Development Guide for Load Balancing Configuration Service Basedon xDS](../developer-guide/sermant-xds-service.md#load-balancing-configuration-service-based-on-xds-protocol).

### Supported Istio Load Balancing Configuration Fields

Istio delivers load balancing configurations via custom resource files such as DestinationRule. Sermant communicates with Istio's control plane using the xDS protocol to retrieve load balancing configurations. The following table lists the supported load balancing configuration fields and rules:

| Supported Fields                       | Description                                                  |
| -------------------------------------- | ------------------------------------------------------------ |
| spec.trafficPolicy                     | Traffic policy                                               |
| spec.trafficPolicy.loadBalancer        | Load balancing strategy                                      |
| spec.trafficPolicy.loadBalancer.simple | Simple load balancing strategies: supports ROUND_ROBIN, RANDOM, LEAST_REQUEST |

### Istio Load Balancing Configuration Template

**DestinationRule**:

```
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: spring-test-destinationrule
spec:
  host: spring-test.default.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      loadBalancer:
        simple: RANDOM
  subsets:
  - name: base
    labels:
      version: base
```

> Description: The `spring-test` service is divided into two subsets based on the `version` label, representing two service clusters. The v1 cluster uses a RANDOM load balancing strategy, while the base cluster uses a ROUND-ROBIN load balancing strategy.

### Sermant Plugins Supporting xDS Load Balancing Service

- [Routing Plugin](../plugin/router.md#routing-based-on-the-xds-protocol)

## Startup and Result Verification

### Service Discovery Example Based on xDS Service

This tutorial demonstrates the xDS service discovery capabilities of Sermant using the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-service-discovery-demo) repository's xds-service-discovery-demo. 

This demo includes a spring-client microservice, a spring-server microservice, and a Sermant example plugin. The plugin intercepts the `hello` method of the spring-client and uses Sermant's xDS service discovery capabilities to get specific instance information of the spring-server service before executing the `hello` method, replacing the input parameter with the correct spring-server address.

#### 1 Preparations

- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.1.0/sermant-examples-xds-service-discovery-demo-2.1.0.tar.gz) the binary package of the demo.
- Prepare the Kubernetes environment.
- Install Istio and start it.

#### 2 Obtaining the Demo Binary Package

Extract the binary package to get the `product/` directory files.

#### 3 Starting the spring-server

Enter the product/spring-server directory:

1. Execute the following command to package the spring-server image:

   ```
   sh build-server.sh
   ```

2. Execute the following command to run the spring-server pod and service:

   ```
   kubectl apply -f spring-server.yaml
   ```

#### 4 Starting the spring-client

Enter the product/spring-client directory:

1. Execute the following command to package the spring-client image:

   ```
   sh build-client.sh
   ```

2. Execute the following command to run the spring-client instance and service:

   ```
   kubectl apply -f spring-client.yaml
   ```

#### 5 Verification

Access the spring-client microservice via a web page, set the input parameter `address` to empty, and verify whether Sermant can successfully call the upstream service spring-server:

```
http://127.0.0.1:30110/hello?address=
```

The webpage shows the following message, indicating that Sermant successfully discovered the instance of spring-server and modified the `address` parameter to the correct spring-server instance address:

```
Greetings from http://xxx.xxx.xxx.xxx:8080 : hello, the current time is 2050-01-01T02:08:08.369
```

### Routing Example Based on xDS Service

This tutorial demonstrates Sermant's routing capabilities based on xDS service using the `xds-router-demo` from the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-router-demo) repository. The demo includes two microservices: `spring-client` and `spring-server`. The `spring-client` microservice starts with the Sermant routing plugin and enables xDS-based routing capabilities. When the `spring-client` calls upstream services, the Sermant routing plugin routes the requests based on the upstream service’s routing rules, selecting the appropriate service instance that meets the rules.

#### 1. Preparation

- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.1.0/sermant-examples-xds-router-demo-2.1.0.tar.gz) the demo binary artifact package.
- [Download](https://github.com/sermant-io/Sermant/releases/download/v2.1.0/sermant-2.1.0.tar.gz) the Sermant binary artifact package.
- Prepare a Kubernetes environment.
- Install and start [Istio](https://istio.io/latest/docs/setup/getting-started/).

#### 2. Obtain the Demo Binary Artifacts

Unzip the demo binary artifact package to get the `router-product/` directory.

#### 3. Obtain and Move the Sermant Binary Artifacts

Unzip the Sermant binary artifact package to get the `sermant-agent/` directory.

Run the following command to move the Sermant binary artifacts to the `spring-client` directory for packaging the `spring-client` image:

```
cp -r ${sermant-path}/sermant-agent/agent ${demo-path}/router-product/spring-client
```

> Note: `${sermant-path}` is the path to the Sermant binary artifacts, and `${demo-path}` is the path to the demo binary artifacts.

#### 4. Start `spring-server`

Navigate to the `router-product/spring-server` directory:

1. Run the following command to package the `spring-server` image:

   ```
   sh build-server.sh
   ```

2. Run the following command to deploy the `spring-server` Pod and Service:

   ```
   kubectl apply -f ../script/spring-server.yaml
   ```

#### 5. Start `spring-client`

Navigate to the `product/spring-client` directory:

1. Run the following command to package the `spring-client` image:

   ```
   sh build-client.sh
   ```

2. Run the following command to deploy the `spring-client` Pod and Service:

   ```
   kubectl apply -f ../script/spring-client.yaml
   ```

#### 6. Apply Routing Rules

Navigate to the `product/script` directory and apply the routing rules by running the following commands:

```
kubectl apply -f spring-server-destination.yaml
kubectl apply -f spring-server-virtureservice.yaml
```

> **Routing Rules Explanation**:
>
> - **DestinationRule**: Divides the Pods into two subsets, `v1` and `v2`, based on the `version` label of the Deployment. The `spring-server` cluster uses the `ROUND_ROBIN` load balancing strategy.
> - **VirtualService**: Routes HTTP requests to the `spring-server` service to the `v1` subset if the request contains the `version:v1` header and the request path is `/router`.

#### 7. Verification

Access the `spring-client` microservice via a web browser, set the `host` parameter to `spring-server`, and set `version`to `v1`. Verify that the `spring-client` successfully calls the `v1` version of the upstream `spring-server` service:

```
http://127.0.0.1:30110/router/httpClient?host=spring-server&version=v1
```

If the web page displays the following output, it indicates that `spring-client` successfully called the `v1` version of the `spring-server` service:

```
spring-server version: v1
```
