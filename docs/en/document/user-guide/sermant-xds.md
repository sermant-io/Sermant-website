# Proxyless Service Mesh Based on Sermant and Istio

This article primarily introduces the concepts, deployment patterns, and specific capabilities of the Sermant + Istio proxyless service mesh. These capabilities are implemented based on the [xDS Core Service](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/XdsCoreService.java) of the Sermant framework layer.

## Service Governance of Sermant in Istio Environment

A service mesh is an infrastructure layer that handles service-to-service communication. It reliably delivers requests through the complex service topology that constitutes modern cloud-native applications. In practice, service mesh is usually implemented as a lightweight array of network proxies, which are deployed alongside application code, without the application being aware of the presence of these proxies.

Istio is currently the most widely used Service Mesh product, consisting of a control plane and a data plane. The data plane in Istio typically deploys separate sidecar containers to proxy microservices, resulting in additional performance overhead, including increased CPU usage and significant growth in service call latency. Additionally, this setup increases system complexity and the difficulty of operations and maintenance.

The Sermant xDS service allows microservices to integrate with Istio in a Kubernetes environment. Sermant communicates directly with Istio's control plane based on the xDS protocol to obtain configuration information such as service discovery and routing, thereby replacing Envoy as Istio's data plane for service governance.

Sermant is a cloud-native, proxyless service mesh based on a Java Agent. Microservices run Sermant in the same process, eliminating the need to start additional sidecar containers for network proxying. This significantly reduces application performance overhead and call latency between services.

## Supported Versions and Limitations

### Version Support

Istio Versions (Verified Support): 1.6 - 1.23

xDS Version: v3

For the compatibility between Kubernetes versions and Istio versions, please refer to the [Istio Version Support](https://istio.io/v1.23/docs/releases/supported-releases/#support-status-of-istio-releases).

### Limitations

Sermant is a cloud-native, agentless service mesh based on the Java Agent, and it only supports the Java programming language.

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

- [Router Plugin](../plugin/router.md#routing-based-on-the-xds-protocol)、[Flow Control Plugin](../plugin/flowcontrol.md#flow-control-based-on-xds-protocol)

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

- [Router Plugin](../plugin/router.md#routing-based-on-the-xds-protocol)、[Flow Control Plugin](../plugin/flowcontrol.md#flow-control-based-on-xds-protocol)

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

- [Routing Plugin](../plugin/router.md#routing-based-on-the-xds-protocol)、[Flow Control Plugin](../plugin/flowcontrol.md#flow-control-based-on-xds-protocol)


## Flow Control Capabilities Based on xDS Service

The Sermant framework layer implements the ability to retrieve flow control configuration based on the xDS protocol. Plugins can call the xDS flow control service interface to obtain the flow control configuration for Kubernetes Services. For detailed development guidance, please refer to [Flow Control Service Development Guide Based on xDS Service](../developer-guide/sermant-xds-service.md#flow-control-service-based-on-xds-protocol).

### Supported Istio Flow Control Configuration Fields and Configuration Template

The Istio flow control configuration includes four types: circuit breaking, retries, fault injection, and rate limiting. Istio can push circuit breaker configurations through a custom resource file of [DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/), retry and fault injection configurations through a custom resource file of [VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/), and rate limiting configurations through a custom resource file of [EnvoyFilter](https://istio.io/v1.23/docs/reference/config/networking/envoy-filter/). Sermant communicates with Istio's control plane protocol based on the xDS protocol to retrieve the flow control configuration. The supported flow control configuration fields are as follows:

#### Circuit Breaker Configuration

- Supported fields for circuit breaker configuration:

| Supported Field                              | Description                                                  |
| -------------------------------------------- | ------------------------------------------------------------ |
| spec.trafficPolicy                           | Traffic policy                                               |
| spec.trafficPolicy.connectionPool            | Connection pool configuration                                 |
| spec.trafficPolicy.connectionPool.http       | HTTP connection pool configuration                            |
| spec.trafficPolicy.connectionPool.http.http2MaxRequests | Maximum active requests; triggers circuit breaking when exceeded |
| spec.trafficPolicy.outlierDetection          | Instance circuit breaker policy; instances are ejected when failure count exceeds threshold |
| spec.trafficPolicy.outlierDetection.splitExternalLocalOriginErrors | Whether to distinguish between local source and external errors; if true, uses consecutiveLocalOriginFailures to detect failure count threshold |
| spec.trafficPolicy.outlierDetection.consecutive5xxErrors | Maximum number of 5xx errors before circuit breaking; connection timeout, connection failure, and request failures are considered as 5xx errors |
| spec.trafficPolicy.outlierDetection.consecutiveLocalOriginFailures | Maximum number of local origin errors before circuit breaking|
| spec.trafficPolicy.outlierDetection.consecutiveGatewayErrors | Maximum number of gateway errors before circuit breaking; 502, 503, and 504 response codes are considered as gateway errors |
| spec.trafficPolicy.outlierDetection.interval  | Detection interval; if the error count exceeds the threshold within this period, it triggers instance circuit breaking |
| spec.trafficPolicy.outlierDetection.baseEjectionTime | Minimum circuit breaker duration; an instance remains in the circuit breaker state for the duration of failure count * minimum circuit breaker time |
| spec.trafficPolicy.outlierDetection.maxEjectionPercent | Maximum percentage of instances that can be ejected from the pool |
| spec.trafficPolicy.outlierDetection.minHealthPercent | At least minHealthPercent of instances must be healthy for eviction to occur |

> Note: Errors occurring before sending bytes to the server are considered local source errors, while errors occurring after sending bytes to the server are considered external errors.

- Example circuit breaker configuration template (DestinationRule):

```yaml
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
        version: 1.0.1
      trafficPolicy:
        loadBalancer:
          simple: ROUND_ROBIN
          localityLbSetting:
            enabled: true
        connectionPool:
          http:
            http2MaxRequests: 1000
        outlierDetection:
          consecutive5xxErrors: 8
          splitExternalLocalOriginErrors: true
          consecutiveLocalOriginFailures: 7
          consecutiveGatewayErrors: 9
          interval: 5m
          baseEjectionTime: 15m
          maxEjectionPercent: 15
          minHealthPercent: 10
```

> Description: The `spring-test` service is classified into clusters based on the `version` label. For the v1 cluster, the following flow control rules apply:
>
> 1. The maximum number of active requests supported by the client calling the v1 cluster is 1000. If the number of active instances exceeds 1000, the client will return a failure directly, and no further requests will be made to the server. Different client instances will not respond to each other.
> 2. When the client performs load balancing to the v1 cluster, if any instances in the pool meet one of the following conditions within 5 minutes (local origin error count ≥ 7, 5xx error count ≥ 8, or gateway error count ≥ 9), they will be marked as circuit-broken. If the number of circuit-broken instances in the pool is less than 10%, those instances will be ejected and not called. If the remaining number of instances after eviction is less than 15%, all instances will be returned. The circuit breaker flag for ejected instances will be removed after the circuit breaker timeout period ends.

#### Retry Configuration

- Supported fields for retry configuration:

| Supported Fields                          | Description                                                 |
| ----------------------------------------- | ----------------------------------------------------------- |
| spec.retries                              | Retry strategy configuration                                |
| spec.retries.attempts                     | Maximum allowed retry attempts                               |
| spec.retries.perTryTimeout                | Retry interval                                              |
| spec.retries.retryOn                      | Retry conditions, supports 5xx, gateway-error, connect-failure, retriable-4xx, <br> retriable-status-codes, retriable-headers |

- Template for Retry Configuration (VirtualService):

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: spring-test-virtualservice
spec:
  hosts:
  - spring-test
  http:
  - name: "base-route"
    match:
    - uri:
        exact: /test
    route:
    - destination:
        host:  spring-test
        port:
          number: 8003
    retries:
      attempts: 4
      perTryTimeout: 2s
      retryOn: "gateway-error"
```

> Description: For requests to the upstream service named `spring-test` with the access path `/test`, the following flow control rules apply:
>
> 1. If the upstream service returns a response with status code 502, 503, or 504, the client will retry up to 4 times, with a 2-second interval between each retry.

#### Fault Injection Configuration

- Supported fields for fault injection configuration:

| Supported Fields                          | Description                                                 |
| ----------------------------------------- | ----------------------------------------------------------- |
| spec.fault                                | Fault injection configuration                                |
| spec.fault.delay                          | Request delay configuration                                  |
| spec.fault.delay.percentage               | Trigger probability of request delay                          |
| spec.fault.delay.fixedDelay               | Delay time                                                    |
| spec.fault.abort                          | Request abort configuration                                  |
| spec.fault.abort.httpStatus               | HTTP status code to return when the request is aborted       |
| spec.fault.abort.percentage               | Trigger probability of request abort                         |

- Template for Retry and Fault Injection Configuration (VirtualService):

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: spring-test-virtualservice
spec:
  hosts:
  - spring-test
  http:
  - name: "base-route"
    match:
    - uri:
        exact: /test
    route:
    - destination:
        host:  spring-test
        port:
          number: 8003
    fault:
      delay:
        percentage:
          value: 20
        fixedDelay: 5s
      abort:
        percentage:
          value: 10
        httpStatus: 400
```

> Description: For requests to the upstream service named `spring-test` with the access path `/test`, the following flow control rules apply:
>
> 1. There is a 10% chance that the request will trigger an abort, in which case the client will return an HTTP 400 status code.
> 2. There is a 20% chance that the request will trigger a delay, causing the client to delay the request for 5 seconds before calling the upstream service.

#### Rate Limiting Configuration

- Supported fields for rate limiting configuration:

| Supported Field                                | Description                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| spec.configPatches.applyTo                    | Application location, supports HTTP_ROUTE: applies to routes within the virtual host specified in the route configuration. |
| spec.configPatches.match                      | Matching conditions                                                                            |
| spec.configPatches.match.routeConfiguration   | Route configuration, match and apply patches upon successful matching.                        |
| spec.configPatches.match.routeConfiguration.vhost   | Host information in the route configuration                                                   |
| spec.configPatches.match.routeConfiguration.vhost.name   | Hostname in the route configuration, full qualified service name + port, e.g., spring-test.default.svc.cluster.local:8003 |
| spec.configPatches.match.routeConfiguration.vhost.route   | Route information                                                                             |
| spec.configPatches.match.routeConfiguration.vhost.route.name   | [Route name](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/#HTTPRoute-name), corresponding to spec.http.name in VirtualService. |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit   | Rate limiting configuration                                                                   |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.value   | Specific configuration details of the rate limiting                                          |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.token_bucket   | Token bucket configuration for rate limiting                                                 |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.token_bucket.max_tokens   | Maximum number of tokens                                                                      |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.token_bucket.tokens_per_fill   | Number of tokens filled per interval                                                           |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled   | Enabling configuration for rate limiting                                                      |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled.default_value   | Probability of triggering rate limiting configuration                                        |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled.default_value.numerator   | Numerator for triggering probability                                                           |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled.default_value.denominator   | Denominator for triggering probability                                                         |
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.response_headers_to_add   | Response headers to add when rate limiting is triggered                                       |

> Note:
> 1. If only the route name is specified, the rate limiting rule will apply to all routes that match the specified route name across all service instances.
> 2. If only the host name is matched, the rate limiting rule will apply to all routes under the specified host.
> 3. If both the route name and host name are configured, the rate limiting rule will only apply to routes in the specified service instance (name and port must match exactly).

- Supported rate limiting configuration template (EnvoyFilter):

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: filter-local-ratelimit-svc
  namespace: istio-system
spec:
  configPatches:
    - applyTo: HTTP_ROUTE
      match:
        routeConfiguration:
          vhost:
            name: spring-test.default.svc.cluster.local:8003
            route:
              name: base-route
      patch:
        operation: MERGE
        value:
          typed_per_filter_config:
            envoy.filters.http.local_ratelimit:
              "@type": type.googleapis.com/udpa.type.v1.TypedStruct
              type_url: type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
              value:
                token_bucket:
                  max_tokens: 2
                  tokens_per_fill: 2
                  fill_interval: 90s
                filter_enabled:
                  default_value:
                    numerator: 50
                    denominator: HUNDRED
                response_headers_to_add:
                    header:
                      key: x-local-rate-limit
                      value: 'true'
```

> Description: For requests to the service "spring-test" with the route name "base-route," the following rate limiting rules will apply:
>
> 1. Each request that triggers the server's rate-limiting rule has a 50% chance of consuming a token. Based on the token bucket rate-limiting strategy, the token bucket has a maximum capacity of 2 tokens, and 2 tokens are refilled every 90 seconds. Therefore, up to 2 requests that consume tokens are allowed to pass through the rate-limiting rule every 90 seconds. When a request is rate-limited, the server will add `x-local-rate-limit: true` in the response header.
> 2. The rate-limiting rules apply independently to different instances of the same service and do not affect each other.

### Sermant Plugins Supporting xDS Flow Control Capabilities

- [Flow Control Plugin](../plugin/flowcontrol.md#flow-control-based-on-xds-protocol)

## Startup and Result Verification

### Routing Example Based on xDS Service

This tutorial demonstrates Sermant's routing capabilities based on xDS service using the `xds-demo` from the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-demo) repository. The demo includes two microservices: `spring-client` and `spring-server`. The `spring-client` microservice starts with the Sermant routing plugin and enables xDS-based routing capabilities. When the `spring-client` calls upstream services, the Sermant routing plugin routes the requests based on the upstream service’s routing rules, selecting the appropriate service instance that meets the rules.

#### 1. Preparation

- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.3.0/sermant-examples-xds-demo-2.3.0.tar.gz) the demo binary artifact package.
- [Download](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz) the Sermant binary artifact package.
- Prepare a Kubernetes environment.
- Install and start [Istio](https://istio.io/v1.23/docs/setup/getting-started/).

#### 2. Obtain the Demo Binary Artifacts

Unzip the demo binary artifact package to get the `product/` directory.

#### 3. Obtain and Move the Sermant Binary Artifacts

Unzip the Sermant binary artifact package to get the `sermant-agent/` directory.

Run the following command to move the Sermant binary artifacts to the `spring-client` directory for packaging the `spring-client` image:

```
cp -r ${sermant-path}/sermant-agent/agent ${demo-path}/product/spring-client
```

> Note: `${sermant-path}` is the path to the Sermant binary artifacts, and `${demo-path}` is the path to the demo binary artifacts.

#### 4. Start `spring-server`

Navigate to the `product/spring-server` directory:

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

### Example of Flow Control Based on xDS Service

This tutorial demonstrates the flow control capability of Sermant based on xDS services using the [Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-demo) repository's xds-demo. The demo includes `spring-client` and `spring-server` microservices. The `spring-client` microservice mounts the Sermant flow control plugin and enables flow control based on xDS. The Sermant flow control plugin will control traffic according to the flow control rules of upstream services when `spring-client` calls those upstream services.

#### 1 Prerequisites

- [Download](https://github.com/sermant-io/Sermant-examples/releases/download/v2.3.0/sermant-examples-xds-demo-2.3.0.tar.gz) the Demo binary package.
- [Download](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz) the Sermant binary package.
- [Prepare](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/) a Kubernetes environment.
- Install and start [Istio](https://istio.io/v1.23/docs/setup/getting-started/).

#### 2 Get the Demo Binary Package

Unzip the Demo binary package to get the `product/` directory files.

#### 3 Get and Move the Sermant Binary Package

Unzip the Sermant binary package to get the `sermant-agent/` directory files.

Execute the following command to move the Sermant binary files to the `spring-client` directory for packaging the `spring-client` image:

```
cp -r ${sermant-path}/sermant-agent/agent ${demo-path}/product/spring-client
```

> Note: `${sermant-path}` is the path where the Sermant binary package is located, and `${demo-path}` is the path where the Demo binary package is located.

#### 4 Start the Spring Server

Navigate to the `product/spring-server` directory:

1. Run the following command to build the `spring-server` image:

   ```
   sh build-server.sh
   ```

2. Run the following command to apply the Spring Server Pod and Service:

   ```
   kubectl apply -f ../script/spring-server.yaml
   ```

#### 5 Start the Spring Client

Navigate to the `product/spring-client` directory:

1. Run the following command to build the `spring-client` image:

   ```
   sh build-client.sh
   ```

2. Run the following command to apply the Spring Client Pod and Service:

   ```
   kubectl apply -f ../script/spring-client-flowcontrol.yaml
   ```

#### 6 Apply Flow Control Rules

Navigate to the `product/script` directory and run the following commands to apply the flow control rules:

```
kubectl apply -f spring-server-destination.yaml
kubectl apply -f spring-server-virtureservice-flowcontrol.yaml
```

> Rule Explanation:
>
> - `DestinationRule`: Divides the Pods into two subsets (v1 and v2) based on the `version` label of the Deployment. The `spring-server` cluster uses the `ROUND_ROBIN` load balancing rule.
> - `VirtualService`: For HTTP requests accessing the `spring-server` service, if the request contains the header `version:v1` and the path is `/router`, the request will be routed to the v1 subset of `spring-server`. Requests to the v1 subset will trigger a 100% request abort.

#### 7 Verification

Access the `spring-client` microservice via the web, set the `host` parameter to `spring-server`, and the `version` to `v1`, to test whether the `spring-client` service triggers a request abort:

```
http://127.0.0.1:30110/router/httpClient?host=spring-server&version=v1
```

If the following message is displayed on the webpage, it indicates that the `spring-client` has triggered a request abort:

```
The request has been aborted due to triggering fault injection
```
