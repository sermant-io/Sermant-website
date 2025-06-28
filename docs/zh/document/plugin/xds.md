# xDS
Sermant框架的xDS服务使微服务可以在Kubenetes场景下接入Istio。Sermant基于xDS协议和Istio的控制平面直接进行通信，获取服务发现、路由、负载均衡等配置信息，从而可以替代Envoy作为Istio的数据平面完成服务治理能力。xDS插件插件整合了xDS协议的流量管理、安全特性等，使得用户可以在不使用Envoy的方式和Istio控制平面进行通信，并实现基于xDS协议的服务治理。
具体的xDS功能在Sermant框架中的支持和介绍请参考[基于Sermant+Istio的无代理服务网格](../user-guide/sermant-xds.md#基于xDS服务的路由能力)。本文将介绍xDS插件的使用。

## 基于xDS协议的路由

xDS插件基于Sermant框架层的xDS服务获取服务的[路由配置](../user-guide/sermant-xds.md#基于xDS服务的路由能力)、[服务实例](../user-guide/sermant-xds.md#基于xDS服务的服务发现能力)和[负载均衡配置](../user-guide/sermant-xds.md#基于xDS服务的负载均衡能力)实现基于xDS协议的路由（下文简称xDS路由）。用户可以通过Istio的[DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/)和[VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/)下发路由配置。目前支持通过请求header和路径进行流量路由，支持HttpClient、HttpAsyncClient、OkHttp、HttpURLConnection和Spring Cloud框架。

### xDS路由使用

使用xDS插件的路由功能需在Kubenetes环境部署[Istio](https://istio.io/v1.23/docs/setup/getting-started/)，同时在xDS插件的`config/config.yaml`配置文件中开启xDS功能开关：

```
xds.traffic.management.config:   
  enable: true
```

> 使用xDS路由能力的微服务在创建Pods时无需挂载Envoy代理容器

http客户端调用上游服务的URL格式需要为`http://${serviceName}.${hostSuffix}/{path}`，其中${serviceName}为调用上游服务的服务名，${hostSuffix}为Kubernetes的域名后缀。Istio下发路由配置模版请参考[基于xDS服务的路由能力](../user-guide/sermant-xds.md#基于xDS服务的路由能力)一节，xDS路由使用示例请参考[基于xds服务的路由示例](../user-guide/sermant-xds.md#基于xds服务的路由示例)一节。

### xDS路由支持框架版本和限制

| 框架              | 支持版本               |
| ----------------- | ---------------------- |
| SpringCloud       | Edgware.SR2 - 2021.0.0 |
| HttpClient        | 4.x                    |
| HttpAsyncClient   | 4.x                    |
| OkHttp            | 2.2.x - 4.x            |
| HttpURLConnection | 1.8                    |

## 基于xDS协议的流控

xDS插件基于Sermant框架层的xDS服务获取服务的[流控配置](../user-guide/sermant-xds.md#基于xds服务的流控能力)实现基于xDS协议的流控（下文简称xDS流控）。用户可以通过Istio的[DestinationRule](https://istio.io/v1.23/docs/reference/config/networking/destination-rule/)、[VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/)和[EnvoyFilter](https://istio.io/v1.23/docs/reference/config/networking/envoy-filter/)下发流控配置。目前支持重试、错误注入、限流和熔断四种能力，支持HttpClient、OkHttp、HttpURLConnection三种框架。

### xDS流控使用

使用xDS流控需在Kubenetes环境部署[Istio](https://istio.io/v1.23/docs/setup/getting-started/)，同时在xDS插件的`config/config.yaml`配置文件中开启xDS功能开关（如需启用基于匹配响应状态码和响应头名称的重试功能，需要在xDS插件的`config/config.yaml`配置文件中配置状态码和响应头，并在[VirtualService](https://istio.io/v1.23/docs/reference/config/networking/virtual-service/)的spec.retries.retryOn中添加重试条件retriable-status-codes和retriable-headers）：

```yaml
xds.traffic.management.config:   
  enable: true    
  x-sermant-retriable-status-codes:  
    - 503
  x-sermant-retriable-header-names:
    - x-local-rate-limit
```

> 使用xDS流控能力的微服务在创建Pods时无需挂载Envoy代理容器

http客户端调用上游服务的URL格式需要为`http://${serviceName}.${hostSuffix}/{path}`，其中${serviceName}为调用上游服务的服务名，${hostSuffix}为Kubernetes的域名后缀。Istio下发流控配置模版请参考[基于xds服务的流控能力](../user-guide/sermant-xds.md#基于xds服务的流控能力)一节，xDS流控使用示例请参考[基于xds服务的流控示例](../user-guide/sermant-xds.md#基于xds服务的流控示例)一节。

### xDS流控支持框架版本和限制

| 框架              | 支持版本               |
| ----------------- | ---------------------- |
| HttpClient        | 4.x                    |
| OkHttp            | 2.2.x - 4.x            |
| HttpURLConnection | 1.8                    |

## 基于xDS协议的安全

Sermant框架层基于xDS协议实现了安全配置的获取能力，xDS插件调用xDS安全服务接口获取Kubenetes Service的安全配置。Istio的安全配置包括身份和证书管理、对等认证、安全认证、授权。Istio可以通过[PeerAuthentication](https://istio.io/latest/docs/reference/config/security/peer_authentication/)、[RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/)、[AuthorizationPolicy](https://istio.io/latest/zh/docs/reference/config/security/authorization-policy/)来下发以上规则。

### xDS安全使用

使用xDS安全需在Kubenetes环境部署[Istio](https://istio.io/v1.23/docs/setup/getting-started/)，同时在xDS插件的`config/config.yaml`配置文件中开启xDS功能开关：

```
xds.traffic.management.config:   
  enable: true
```

> 使用xDS安全能力的微服务在创建Pods时无需挂载Envoy代理容器

http客户端调用上游服务的URL格式需要为`http://${serviceName}.${hostSuffix}/{path}`，其中${serviceName}为调用上游服务的服务名，${hostSuffix}为Kubernetes的域名后缀。Istio下发安全配置模版请参考[基于xDS服务的安全能力](../user-guide/sermant-xds.md#基于xDS服务的安全能力)一节。

### xDS安全支持框架版本和限制

请求认证和授权策略不受客户端限制，对等认证支持客户端如下。

| 框架                 | 支持版本    |
| -------------------- | ----------- |
| HttpClient(对等认证) | 4.x         |
| OkHttp(对等认证)     | 2.2.x - 4.x |
