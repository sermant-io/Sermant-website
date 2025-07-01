# 基于Sermant+Istio的无代理服务网格

本文主要介绍基于Sermant+Istio无代理服务网格的概念、部署形态和具体能力。该能力基于Sermant框架层的[xDS核心服务](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/XdsCoreService.java)实现。

## Istio下的Sermant服务治理

服务网格（Service Mesh）是处理服务间通信的基础设施层。它负责构成现代云原生应用程序的复杂服务拓扑来可靠地交付请求。在实践中，Service Mesh 通常以轻量级网络代理阵列的形式实现，这些代理与应用程序代码部署在一起，对应用程序来说无需感知代理的存在。

Istio是目前应用最广泛的Service Mesh产品，由控制平面和数据平面组成。Istio的数据平面一般会启动独立的Sidecar容器代理业务微服务的网络，因此会增加额外的性能损耗，包括CPU占用增加和服务调用时延的大幅增长，除此之外，系统的复杂性和运维的难度也在增加。

Sermant xDS服务使微服务可以在Kubenetes场景下接入Istio。Sermant基于xDS协议和Istio的控制平面直接进行通信，获取服务发现、路由、负载均衡等配置信息，从而可以替代Envoy作为Istio的数据平面完成服务治理能力。

Sermant是基于Java Agent的云原生无代理服务网格，业务微服务挂载Sermant同进程运行，无需启动额外的Sidecar容器进行网络代理，可以大幅度降低应用的性能损耗和服务之间的调用时延。

## 支持版本和限制

### 版本支持

Istio版本（已验证支持）：1.6 - 1.23

xDS版本：v3

Kubenetes版本和Istio的版本适配请参考[Istio版本支持](https://istio.io/v1.23/docs/releases/supported-releases/#support-status-of-istio-releases)。

### 限制

Sermant是基于Java Agent的云原生无代理服务网格，仅支持Java语言。

### Istio+Sermant的Sidecar无代理模式部署形态

<MyImage src="/docs-img/xds-deploy.jpg" />

1. 混合部署模式：Sidecar代理模式和Sidecar无代理模式共存。业务微服务通过混合部署模式接入Istio并实现服务治理能力，该模式可以避免修改已有的部署架构，仅新增服务使用Sidecar无代理模式。
2. 无代理部署模式：所有的业务微服务均使用Sermant作为Istio的数据平面实现服务发现、路由、负载均衡等能力。Sermant可以替代Envoy提供的能力，当前已经支持了服务发现，未来功能将持续演进。

### Istio环境下使用Sermant的优势

1. Sermant和业务微服务同进程运行，无需启动额外的Sidecar容器，大幅减少网络调用时延和CPU损耗。
2. 基于Sermant框架开发插件可以实现比Envoy更丰富的治理能力，可扩展性更强。
3. 更低的架构复杂度可以带来更低的部署成本。

## 基于xDS服务的服务发现能力

Kubenetes环境中，用户可以通过[Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)和[Service](https://kubernetes.io/docs/concepts/services-networking/service/)自定义资源文件创建Pod和Service。Sermant框架层基于xDS协议实现了服务发现能力，插件可以调用xDS服务发现接口获取Kubenetes Service的服务实例，具体开发指导请参考[基于xDS服务的服务发现开发指导](../developer-guide/sermant-xds-service.md#基于xDS服务的服务发现)。

### Kubenetes创建Pod和Service模版

**Deployment**：

```yaml
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

**Service：**

```yaml
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

> 说明：Sermant使用Service资源文件的`metadata.name`作为服务名称进行服务发现

### 支持xDS服务发现能力的Sermant插件

- [路由插件](../plugin/router.md#基于xDS协议的路由)
- [流控插件](../plugin/flowcontrol.md#基于xds协议的流控)
- [xDS插件](../plugin/xds.md)

## 基于xDS服务的路由能力

Sermant框架层基于xDS协议实现了路由配置的获取能力，插件可以调用xDS路由配置服务接口获取Kubenetes Service的路由配置。具体开发指导请参考[基于xDS服务的路由配置服务开发指导](../developer-guide/sermant-xds-service.md#基于xDS协议的路由配置服务)。

### Istio路由配置字段支持

Istio通过下发[DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/)和[VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/) 自定义资源文件下发路由配置。Sermant基于xDS协议和Istio的控制平面协议进行通信获取路由配置，具体支持的路由配置字段如下所示：

**VirtualService**：

| 支持字段                                      | 描述                                             |
| --------------------------------------------- | ------------------------------------------------ |
| spec.hosts                                    | 路由的服务域名                                   |
| spec.hosts.http                               | http路由配置                                     |
| spec.hosts.http.match                         | http路由匹配规则                                 |
| spec.hosts.http.match.headers                 | http路由header匹配规则，支持精确、前缀和正则匹配 |
| spec.hosts.http.match.uri                     | http路由路径匹配规则，支持精确、前缀和正则匹配   |
| spec.hosts.http.match.ignoreUriCase           | http路由路径匹配忽略大小写                       |
| spec.hosts.http.route                         | http路由                                         |
| spec.hosts.http.route.destination             | http路由目标服务                                 |
| spec.hosts.http.route.destination.host        | http路由目标服务域名                             |
| spec.hosts.http.route.destination.subset      | http路由目标服务子集                             |
| spec.hosts.http.route.destination.port.number | http路由目标服务端口                             |
| spec.hosts.http.route.weight                  | http路由目标权重                                 |

**DestinationRule**：

| 支持字段                                                  | 描述         |
| --------------------------------------------------------- | ------------ |
| spec.trafficPolicy                                        | 流量策略     |
| spec.trafficPolicy.loadBalancer                           | 负载均衡策略 |
| spec.trafficPolicy.loadBalancer.localityLbSetting.enabled | 同AZ路由配置 |

### Istio路由配置模版

**VirtualService**：

```yaml
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

> 描述：对于访问服务名称为spring-test的上游服务，存在如下路由规则：
>
> 1. http请求中存在version:v1的header，并且访问路径为/test，路由到spring-test的v1子集的8003端口
> 2. 其他http请求路由到spring-test的base子集的8003端口

**DestinationRule**：

```yaml
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

> 描述：spring-test服务根据version标签划分为两个子集，即服务的两个Cluster集群。v1集群使用同AZ路由策略，v2集群不使用同AZ路由策略。

### 支持xDS路由配置能力的Sermant插件

- [路由插件](../plugin/router.md#基于xDS协议的路由)
- [流控插件](../plugin/flowcontrol.md#基于xds协议的流控)
- [xDS插件](../plugin/xds.md)

## 基于xDS服务的负载均衡能力

Sermant框架层基于xDS协议实现了负载均衡配置的获取能力，插件可以调用xDS负载均衡配置服务接口获取Kubenetes Service的负载均衡配置。具体开发指导请参考[基于xDS服务的负载均衡配置服务开发指导](../developer-guide/sermant-xds-service.md#基于xDS协议的负载均衡配置服务)。

### Istio负载均衡配置字段支持

Istio通过下发[DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/)自定义资源文件下发负载均衡配置。Sermant基于xDS协议和Istio的控制平面协议进行通信获取负载均衡配置，具体支持的负载均衡配置字段和负载均衡规则如下所示：

| 支持字段                               | 描述                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| spec.trafficPolicy                     | 流量策略                                                 |
| spec.trafficPolicy.loadBalancer        | 负载均衡策略                                             |
| spec.trafficPolicy.loadBalancer.simple | 简单负载均衡策略，支持ROUND_ROBIN、RANDOM、LEAST_REQUEST |

### Istio负载均衡配置模版

**DestinationRule**：

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
      version: v1
    trafficPolicy:
      loadBalancer:
        simple: RANDOM
  subsets:
  - name: base
    labels:
      version: base
```

> 描述：spring-test服务根据version标签划分为两个子集，即服务的两个Cluster集群。v1集群使用随机负载均衡策略，v2集群使用轮训负载均衡策略。

### 支持xDS负载均衡配置能力的Sermant插件

- [路由插件](../plugin/router.md#基于xDS协议的路由)
- [流控插件](../plugin/flowcontrol.md#基于xds协议的流控)
- [xDS插件](../plugin/xds.md)

## 基于xDS服务的流控能力

Sermant框架层基于xDS协议实现了流控配置的获取能力，插件可以调用xDS流控服务接口获取Kubenetes Service的流控配置。具体开发指导请参考[基于xDS服务的流控服务开发指导](../developer-guide/sermant-xds-service.md#基于xds协议的流控服务)。

### Istio流控配置字段支持和模板

Istio流控配置包含熔断、重试、错误注入、限流四种配置。Istio可以通过下发[DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/)自定义资源文件来下发熔断配置，通过下发[VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/)自定义资源文件来下发重试配置和错误注入配置，通过下发[EnvoyFilter](https://istio.io/v1.23/docs/reference/config/networking/envoy-filter/) 自定义资源文件下发限流配置。Sermant基于xDS协议和Istio的控制平面协议进行通信获取流控配置，具体支持的流控配置字段如下所示：

#### 熔断配置

- 熔断配置支持的字段：

| 支持字段                               | 描述                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| spec.trafficPolicy                     | 流量策略                                                 |
| spec.trafficPolicy.connectionPool      | 连接池配置|
| spec.trafficPolicy.connectionPool.http    | http的连接池配置 |
| spec.trafficPolicy.connectionPool.http.http2MaxRequests    | 最大活跃请求数，活跃请求数超过阈值则触发熔断 |
| spec.trafficPolicy.outlierDetection    | 实例熔断策略，实例失败次数达到阈值则会触发熔断而被驱逐 |
| spec.trafficPolicy.outlierDetection.splitExternalLocalOriginErrors   | 是否区分本地来源错误和外部错误，设置为true，将使用consecutiveLocalOriginFailures来检测实例的失败次数是否达到阈值 |
| spec.trafficPolicy.outlierDetection.consecutive5xxErrors    | 实例被熔断之前可以发生的5xx错误次数，连接超时、连接错误/失败和请求失败均被视为 5xx 错误 |
| spec.trafficPolicy.outlierDetection.consecutiveLocalOriginFailures    | 实例被熔断之前可以发生的本地来源错误次数 |
| spec.trafficPolicy.outlierDetection.consecutiveGatewayErrors    | 实例被熔断之前可以发生的网关错误次数，响应码为502、503、504时视为网关错误|
| spec.trafficPolicy.outlierDetection.interval  | 检测的时间间隔，在时间间隔内错误次数达到阈值则会触发实例熔断|
| spec.trafficPolicy.outlierDetection.baseEjectionTime  | 实例的最小熔断时间，实例保持熔断状态的时间等于熔断次数*最小熔断时间|
| spec.trafficPolicy.outlierDetection.maxEjectionPercent  | 驱逐的实例占可选实例的最大百分比 |
| spec.trafficPolicy.outlierDetection.minHealthPercent  | 至少有minHealthPercent的实例处于健康状态，才会进行驱逐 |

> 注意：发送字节给服务端前发生的错误视为本地来源错误，发送字节给服务端后发生的错误视为外部错误

- 熔断配置的模板（DestinationRule）：

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

> 描述：spring-test服务根据version标签划为Cluster集群。对于v1集群有以下流控规则：
>
> 1. 客户端调用v1集群时支持的最大活跃请求数为1000，活跃实例数超过1000时客户端会直接返回失败，不会调用服务端，不同的客户端实例不会相互响应。 
> 2. 客户端调用v1集群进行负载均衡时，如果可选实例中存在满足5分钟内本地来源错误次数达到7、5xx错误次数达到8、网关错误次数达到9任一条件的实例，则标记为熔断实例，当可选的实例中标记为熔断的实例数量小于10%则驱逐熔断的实例，驱逐的实例将不会被调用。如果驱逐熔断实例之后剩余实例数小于15%则返回全部实例。熔断的实例会在熔断时间结束之后取消熔断标记。

#### 重试配置

- 重试配置支持的字段:

| 支持字段                               | 描述                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| spec.retries                                | 重试策略配置                                                 |
| spec.retries.attempts                       | 允许的最大重试次数                                     |
| spec.retries.perTryTimeout                  | 重试的时间间隔           |
| spec.retries.retryOn                        | 重试条件，支持5xx、gateway-error、connect-failure、retriable-4xx、<br> retriable-status-codes、retriable-headers           |

- 重试配置的模板（VirtualService）:

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

> 描述：对于访问服务名称为spring-test的上游服务且访问路径为/test的请求，存在如下流控规则：
>
> 1. 如果上游服务返回的响应状态码为502、503、504的其中一种，则客户端会进行重试，最多重试4次，每次重试间隔2秒。

#### 错误注入配置

- 错误注入配置支持的字段:

| 支持字段                               | 描述                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| spec.fault                                  | 错误注入配置                                                 |
| spec.fault.delay                            | 请求延时配置                                                 |
| spec.fault.delay.percentage                 | 请求延时的触发概率                                                 |
| spec.fault.delay.fixedDelay                 | 延迟时间                                                 |
| spec.fault.abort                  | 请求终止配置                                                 |
| spec.fault.abort.httpStatus       | 请求终止时返回错误响应的响应码                                                 |
| spec.fault.abort.percentage       | 请求终止的触发概率                                              |


- 重试和错误注入支持的模板（VirtualService）:

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

> 描述：对于访问服务名称为spring-test的上游服务且访问路径为/test的请求，存在如下流控规则：
>
> 1. 请求会有10%的概率触发请求中止，触发请求中止时客户端会直接返回状态码为400的响应。
> 2. 请求会有20%的概率触发请求延时，触发请求延时客户端会延时5秒再调用上游服务。

#### 限流配置

- 限流配置支持的字段:

| 支持字段                               | 描述                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| spec.configPatches.applyTo           | 应用位置，支持HTTP_ROUTE：应用于路由配置中指定的虚拟主机内的路由对象|
| spec.configPatches.match             | 匹配条件|
| spec.configPatches.match.routeConfiguration   | 路由配置，通过路由配置进行匹配，匹配成功后应用补丁|
| spec.configPatches.match.routeConfiguration.vhost   |路由配置中的主机信息|
| spec.configPatches.match.routeConfiguration.vhost.name   |路由配置中的主机名称，服务的全限定名称+端口，如：spring-test.default.svc.cluster.local:8003|
| spec.configPatches.match.routeConfiguration.vhost.route   |路由信息|
| spec.configPatches.match.routeConfiguration.vhost.route.name   |[路由名称](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/#HTTPRoute-name)，对应VirtualService中的spec.http.name|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit   |限流配置|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.value   |限流配置的具体配置信息|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.token_bucket   |限流配置的令牌桶信息|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.token_bucket.max_tokens   |最大令牌数量|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.token_bucket.tokens_per_fill   |每次填充的令牌数量|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled   |限流配置的启用配置|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled.default_value   |请求触发限流配置的概率|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled.default_value.numerator   |触发概率的分子|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.filter_enabled.default_value.denominator   |触发概率的分母|
| spec.configPatches.patch.value.typed_per_filter_config.envoy.filters.http.local_ratelimit.response_headers_to_add   |触发限流时响应信息需要添加的响应头|

> 注意：
> 1. 如果只配路由名称，限流规则会对所有服务实例下路由名称匹配的路由生效。
> 2. 如果只匹配主机名称，则限流规则会对主机下所有的路由生效。
> 3. 如果路由名称和主机名称都配置，限流规则只会对指定服务实例（名称和端口必须全部匹配）下路由名称匹配的路由生效。

- 限流配置支持的模板（EnvoyFilter）：

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

> 描述：对于调用服务spring-test且路由名称为base-route的请求，会触发以下流控规则：
>
> 1. 每个触发服务端限流规则的请求有50%的概率消耗令牌。基于令牌桶限流策略，令牌桶的最大容量为2，每90秒会重新填充2个令牌，因此每90秒，最多允许2个消耗令牌的请求通过限流规则。当请求被限流时，服务端会在响应头中添加 x-local-rate-limit: true。
> 2. 限流规则对同一服务的不同实例单独生效，不会相互影响。

### 支持xDS流控能力的Sermant插件

- [流控插件](../plugin/flowcontrol.md#基于xds协议的流控)
- [xDS插件](../plugin/xds.md)

## 基于xDS服务的安全能力

Sermant框架层基于xDS协议实现了安全配置的获取能力，插件可以调用xDS安全服务接口获取Kubenetes Service的安全配置。

### Istio安全配置字段支持

Istio的安全配置包括身份和证书管理、对等认证、安全认证、授权。Istio可以通过[PeerAuthentication](https://istio.io/latest/docs/reference/config/security/peer_authentication/)、[RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/)、[AuthorizationPolicy](https://istio.io/latest/zh/docs/reference/config/security/authorization-policy/)来下发以上规则。Sermant基于xDS协议和Istio的控制平面协议进行通信获取安全配置，具体支持的安全配置字段如下所示：

**PeerAuthentication**：

| 支持字段       | 描述                                                 |
| -------------- | ---------------------------------------------------- |
| spec.mtls.mode | 对等认证模式，支持PERMISSIVE、STRICT、DISABLE、UNSET |

**RequestAuthentication**：

| 支持字段                  | 描述                                                         |
| ------------------------- | ------------------------------------------------------------ |
| spec.jwtRules.issuer      | 标识签发 JWT 的颁发者                                        |
| spec.jwtRules.audiences   | 允许访问的JWT受众列表                                        |
| spec.jwtRules.fromHeaders | 预期 JWT 所在的请求头位置列表。例如，如果预期 JWT 位于`x-jwt-assertion`头中且具有`Bearer`前缀，则如下配置：<br/>  fromHeaders:<br/>  - name: x-jwt-assertion<br/>    prefix: "Bearer " |
| spec.jwtRules.fromParams  | 需要 JWT 的查询参数列表。例如，如果通过查询参数提供 JWT `my_token`（例如`/path?my_token=<JWT>`），则配置为：<br/>  fromParams:<br/>  - "my_token" |
| spec.jwtRules.jwks        | JSON Web Key 一组用于验证 JWT 签名的公钥                     |

**AuthorizationPolicy**：

| 支持字段                                     | 描述                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| spec.action                                  | 表示采取的操作，目前支持ALLOW和DENY                          |
| spec.rules.to.operation                      | 标识请求的操作                                               |
| spec.rules.to.operation.hosts                | HTTP 请求中指定的主机列表。匹配不区分大小写。如果未设置，则允许任何主机 |
| spec.rules.to.operation.notHosts             | HTTP 请求中指定的主机的否定匹配列表。匹配不区分大小写        |
| spec.rules.to.operation.paths                | HTTP 请求中指定的路径列表                                    |
| spec.rules.to.operation.notPaths             | HTTP 请求中路径的否定匹配列表                                |
| spec.rules.to.operation.ports                | HTTP 请求中指定的端口列表。如果未设置，则允许任何端口        |
| spec.rules.to.operation.notPorts             | HTTP 请求中指定的否定匹配端口列表                            |
| spec.rules.to.operation.methods              | HTTP 请求中指定的方法列表，例如GET、POST                     |
| spec.rules.to.operation.notMethods           | 请求中指定的方法的否定匹配列表                               |
| spec.rules.when.key.request.headers[xxx]     | 匹配HTTP 请求头。请求头名称用引号括起来，`[]`不带引号        |
| spec.rules.when.key.source.ip                | 源工作负载实例的 IP 地址，支持单个 IP 或 CIDR                |
| spec.rules.when.key.remote.ip                | 由 X-Forwarded-For 头或代理协议确定的原始客户端 IP 地址，支持单个 IP 或 CIDR |
| spec.rules.when.key.destination.ip           | 目标工作负载实例 IP 地址，支持单个 IP 或 CIDR                |
| spec.rules.when.key.destination.port         | 目标工作负载实例端口，必须在 [0, 65535] 范围内。注意，不是服务端口。 |
| spec.rules.when.key.connection.sni           | 服务器名称指示，需要启用 TLS                                 |
| spec.rules.when.key.request.auth.principal   | 经过身份验证的 JWT 令牌的主体，由格式为 的 JWT 声明构成`<iss>/<sub>` |
| spec.rules.when.key.request.auth.audiences   | 经过身份验证的 JWT 令牌的目标受众（由 JWT 声明构建`<aud>`）需要应用请求身份验证策略 |
| spec.rules.when.key.request.auth.claims[xxx] | 已验证 JWT 令牌的原始声明。声明名称`[]`不带引号，也可以使用嵌套声明，需要应用请求身份验证策略。注意：仅支持字符串或字符串列表类型的声明 |
| spec.rules.when.key.request.auth.presenter   | 经过身份验证的 JWT 令牌（由 JWT 声明构建`<azp>`）的授权出示者需要应用请求身份验证策略 |

### Istio安全配置模版

**PeerAuthentication**：

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: foo
spec:
  mtls:
    mode: STRICT
```

> 描述：对于命名空间为foo下的服务，请求调用必须使用mTLS。
>

**RequestAuthentication**：

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: spring-provider 
  namespace: default
spec:
  selector:
    matchLabels:
      app: spring-provider
  jwtRules:
  - issuer: "issuer-foo"
    fromHeaders:
    - name: x-jwt-assertion
      prefix: "Bearer "
    audiences:
    - your-audience
```

> 描述：对于命名空间为default下的spring-provider服务，存在如下安全规则：
>
> 1. 接收到的请求的请求头中需要包含形如“x-jwt-assertion: Bearer xxxxxx"的Json Web Token(JWT)
> 2. JWT中包含的信息中issuer必须是issuer-foo，audiences必须是your-audience
>
> 如不满足则调用失败，返回403

**AuthorizationPolicy**：

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: httpbin
  namespace: foo
spec:
  action: ALLOW
  rules:
    to:
    - operation:
        methods: ["POST"]
        paths: ["/data"]
    when:
    - key: request.auth.claims[iss]
      values: ["https://accounts.google.com"]

```

> 描述：改授权策略表示
>
> 1. 仅适用于 foo 命名空间中名为 httpbin 的服务
> 2. 只允许满足以下所有条件的请求：
>    - 使用 HTTP POST 方法
>    - 访问路径是 `/data`
>    - 请求带有有效的 JWT 令牌，且该令牌是由 Google (issuer 为 `https://accounts.google.com`) 签发的
>
> 如不满足则返回403

### 支持xDS安全能力的Sermant插件

- [xDS插件](../plugin/xds.md)

## 启动和结果验证

### 基于xds服务的路由示例

本教程使用[Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-demo)仓库中的xds-demo演示Sermant 基于xDS服务的路由能力。本Demo中包括spring-client微服务、spring-server微服务。spring-client微服务挂载Sermant的路由插件启动，并开启基于xDS的路由能力，Sermant路由插件在spring-client调用上游服务时，根据上游服务的路由规则进行路由，并选择符合规则的服务实例进行调用。

#### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.3.0/sermant-examples-xds-demo-2.3.0.tar.gz) Demo二进制产物压缩包
- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz) Sermant二进制产物压缩包
- [准备](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/) Kubenetes环境
- 安装[Istio](https://istio.io/v1.23/docs/setup/getting-started/)并启动

#### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`product/`目录文件。

#### 3 获取和移动Sermant二进制产物

解压Sermant二进制产物压缩包，即可得到`sermant-agent/`目录文件。

执行如下命令，将Sermant二进制产物移动至spring-client目录，用于打包spring-client镜像：

```
cp -r ${sermant-path}/sermant-agent/agent ${demo-path}/product/spring-client
```

> 说明：${sermant-path}为Sermant二进制产物所在路径，${demo-path}为Demo二进制产物所在路径。

#### 4 启动spring-server

进入product/spring-server目录：

1. 执行以下命令打包spring-server镜像：

   ```
   sh build-server.sh
   ```

2. 执行以下命令运行spring-server Pod和Service

   ```
   kubectl apply -f ../script/spring-server.yaml
   ```

#### 5 启动spring-client

进入product/spring-client目录：

1. 执行以下命令打包spring-client镜像：

   ```
   sh build-client.sh
   ```

2. 执行以下命令运行spring-client Pod和Service

   ```
   kubectl apply -f ../script/spring-client.yaml
   ```

#### 6 下发路由规则

进入product/script目录，执行如下命令下发路由规则：

```
kubectl apply -f spring-server-destination.yaml
kubectl apply -f spring-server-virtureservice.yaml
```

> 路由规则说明：
>
> DestinationRule: 根据Deployment的version标签将Pod划分为v1和v2两个子集, spring-server集群使用ROUND_ROBIN负载均衡规则。
>
> VirtualService: 对于访问spring-server服务的http请求，如果存在version:v1的header，并且请求路径为/router，则将请求路由到spring-server的v1子集。

#### 7 验证

通过网页访问spring-client微服务，入参host设置为spring-server，version为v1，验证spring-client服务是否能成功调用v1版本的上游服务spring-server：

```
http://127.0.0.1:30110/router/httpClient?host=spring-server&version=v1
```

网页收到如下显示，说明spring-client成功调用了v1版本的spring-server服务

```
spring-server version: v1
```

### 基于xds服务的流控示例

本教程使用[Sermant-examples](https://github.com/sermant-io/Sermant-examples/tree/main/xds-demo)仓库中的xds-demo演示Sermant基于xDS服务的错误注入能力。本Demo中包括spring-client微服务、spring-server微服务。spring-client微服务挂载Sermant的流控插件启动，并开启基于xDS的流控能力，Sermant流控插件在spring-client调用上游服务时，根据上游服务的错误注入规则进行请求中止。

#### 1 准备工作

- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.3.0/sermant-examples-xds-demo-2.3.0.tar.gz) Demo二进制产物压缩包
- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.3.0/sermant-2.3.0.tar.gz) Sermant二进制产物压缩包
- [准备](https://kubernetes.io/zh-cn/docs/tutorials/hello-minikube/) Kubenetes环境
- 安装[Istio](https://istio.io/v1.23/docs/setup/getting-started/)并启动

#### 2 获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`product/`目录文件。

#### 3 获取和移动Sermant二进制产物

解压Sermant二进制产物压缩包，即可得到`sermant-agent/`目录文件。

执行如下命令，将Sermant二进制产物移动至spring-client目录，用于打包spring-client镜像：

```
cp -r ${sermant-path}/sermant-agent/agent ${demo-path}/product/spring-client
```

> 说明：${sermant-path}为Sermant二进制产物所在路径，${demo-path}为Demo二进制产物所在路径。

#### 4 启动spring-server

进入product/spring-server目录：

1. 执行以下命令打包spring-server镜像：

   ```
   sh build-server.sh
   ```

2. 执行以下命令运行spring-server Pod和Service

   ```
   kubectl apply -f ../script/spring-server.yaml
   ```

#### 5 启动spring-client

进入product/spring-client目录：

1. 执行以下命令打包spring-client镜像：

   ```
   sh build-client.sh
   ```

2. 执行以下命令运行spring-client Pod和Service

   ```
   kubectl apply -f ../script/spring-client-flowcontrol.yaml
   ```

#### 6 下发流控规则

进入product/script目录，执行如下命令下发错误注入的请求中止规则：

```
kubectl apply -f spring-server-destination.yaml
kubectl apply -f spring-server-virtureservice-flowcontrol.yaml
```

> 规则说明：
>
> DestinationRule: 根据Deployment的version标签将Pod划分为v1和v2两个子集, spring-server集群使用ROUND_ROBIN负载均衡规则。
>
> VirtualService: 对于访问spring-server服务的http请求，如果存在version:v1的header，并且请求路径为/router，则将请求路由到spring-server的v1子集，对于请求到v1子集的请求100%触发请求中止

#### 7 验证

通过网页访问spring-client微服务，入参host设置为spring-server，version为v1, 调用验证spring-client服务是否触发请求中止：

```
http://127.0.0.1:30110/router/httpClient?host=spring-server&version=v1
```

网页收到如下显示，说明spring-client触发了请求中止

```
The request has been aborted due to triggering fault injection
```