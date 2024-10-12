# xDS服务

Istio 的部署分为控制平面和数据平面。传统的数据平面通常使用带有网络代理的 Sidecar 容器（如 Envoy），这会增加微服务调用的网络延时。在 Kubernetes 场景下，Sermant 基于 xDS 协议直接与 Istiod 通信，实现了服务发现功能。使用基于 [Istio+Sermant 的无代理服务网格](../user-guide/sermant-xds.md)，可以显著降低微服务调用延时，并简化系统部署。本文介绍在开发中插件如何使用Sermant提供的xDS服务。

## 基于xDS协议的服务发现

### 功能介绍

**基于xDS协议的服务发现**允许Sermant对接Istio的控制平面获取Kubernetes Service信息和其对应的具体服务实例信息。

> 说明：使用Sermant的xDS服务发现能力需服务部署在Kubernetes容器环境并运行Istio。 

### 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程，演示插件如何通过Sermant框架提供的xDS服务发现能力获取服务实例：

1. 在工程中`template/template-plugin`下的`io.sermant.template.TemplateDeclarer` 类中新增变量`xdsServiceDiscovery`获取Sermant框架提供的xDS服务发现服务，用于获取服务实例：

   ```java
   XdsServiceDiscovery xdsServiceDiscovery = ServiceManager.getService(XdsCoreService.class).getXdsServiceDiscovery();
   ```

2. 获取服务发现实例之后，可以调用`XdsServiceDiscovery`提供的API进行相应的动作。本示例以服务实例的直接获取为例，获取名称为`service-test`的服务实例信息，可通过如下代码来实现：

   ```java
   @Override
   public ExecuteContext before(ExecuteContext context) throws Exception {
     Set<ServiceInstance> serviceInstance = xdsServiceDiscovery.getServiceInstance("service-test");
     Iterator<ServiceInstance> iterator = serviceInstance.iterator();
     while (iterator.hasNext()) {
         ServiceInstance instance = iterator.next();
         System.out.println("ServiceInstance: [" + instance.getHost() + " : "
                 + instance.getPort() + "]");
     }
   }
   ```
   > 说明：`service-test`必须是Kubernetes Service的名称，获取的服务实例信息为该Service对应的Pod实例数据，示例Kubernetes Service如下所示：

   ```
   apiVersion: v1
   kind: Service
   metadata:
     name: service-test
   spec:
     type: ClusterIP
     ports:
     - name: http
     	port: 8080
       targetPort: 8080
       protocol: TCP
     selector:
       app: service-test
   ```
   开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**后生成构建产物。

3. 开启xDS服务并且在`agent/config/config.properties`中设置开启xDS服务，配置示例如下：

   ```
   # xDS service switch
   agent.service.xds.service.enable=true
   ```

4. 执行完成后打包Sermant镜像和宿主微服务镜像。在k8s环境中启动名称为`service-test`的Service，并创建相应的服务实例（用户自行实现）。最后在Kubernetes启动宿主应用并挂载Sermant。Kubernetes环境打包Sermant和宿主镜像以及宿主微服务挂载Sermant启动的指导请参考[Sermant Injector使用手册](../user-guide/sermant-injector.md#启动和结果验证)

5. 宿主微服务挂载Sermant的Pod启动成功后，可以执行以下命令获取宿主微服务日志，查看通过xDS服务发现能力获取的服务实例

   ```shell
   $ kubectl logs -f ${POD_NAME}
   ServiceInstance: [xxx.xxx.xxx.xxx : xxxx]
   ```
   > 说明：`${POD_NAME}`必须是宿主微服务运行的pod名称，可通过`kubectl get pod`命令查看。

### xDS服务发现API

**获取xDS服务发现服务：**

```java
XdsServiceDiscovery xdsServiceDiscovery = ServiceManager.getService(XdsCoreService.class).getXdsServiceDiscovery();
```

**xDS服务发现**服务共有三个接口方法，分别用于直接获取服务实例、通过订阅方式获取服务实例和通过Cluster获取服务实例：

```java
Set<ServiceInstance> getServiceInstance(String serviceName);

void subscribeServiceInstance(String serviceName, XdsServiceDiscoveryListener listener);

Optional<XdsClusterLoadAssigment> getClusterServiceInstance(String clusterName);
```

#### 直接获取服务实例

- 获取Kubernetes service的服务实例信息，返回值为`java.util.Set`类型，包含该service的所有服务实例

    ```java
    xdsServiceDiscovery.getServiceInstance("service-test");
    ```

#### 订阅方式获取服务实例

- 订阅Kubernetes service的服务实例信息，并注册服务发现监听器，监听器的`process`函数可在监听到服务实例发生变化后执行自定义操作

  ```java
  xdsServiceDiscovery.subscribeServiceInstance("service-test", new XdsServiceDiscoveryListener() {
              @Override
              public void process(Set<ServiceInstance> instances) {
                  // do something
              }
          });
  ```

- 服务发现监听器[XdsServiceDiscoveryListener](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/listener/XdsServiceDiscoveryListener.java)，其中包含的接口方法如下：

  | 方法                                         | 描述                           |
  | :------------------------------------------- | :----------------------------- |
  | void process(Set<ServiceInstance> instances) | 处理最新服务实例信息的回调接口 |

- 服务实例[ServiceInstance](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/ServiceInstance.java)，其方法如下：

  | 方法名           | 返回值类型          | 描述                                     |
  | :--------------- | :------------------ | :--------------------------------------- |
  | getClusterName() | String              | 获取服务实例所属的istio cluster名称      |
  | getServiceName() | String              | 获取服务实例所属的Kubernetes service名称 |
  | getHost()        | String              | 获取服务实例的Pod IP                     |
  | getPort()        | int                 | 获取服务实例的端口                       |
  | getMetaData()    | Map<String, String> | 获取服务实例的元数据                     |
  | isHealthy()      | boolean             | 服务是否健康                             |
#### 通过Cluster获取服务实例

- 获取Service Cluster的服务实例信息，返回值为`Optional<XdsClusterLoadAssigment>`类型，包含该Cluster的所有服务实例：

    ```java
    xdsServiceDiscovery.getClusterServiceInstance("outbound|8080||service-test.default.svc.cluster.local");
    ```
- Cluster服务实例[XdsClusterLoadAssigment](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsClusterLoadAssigment.java)，其字段如下：

  | 字段名称    | 字段类型     | 描述                                     |
  | :------------------ | :--------------- | :--------------------------------------- |
  | serviceName   | String | Cluster服务实例所属的服务名称 |
  | clusterName   | String | Cluster名称 |
  | localityInstances | Map<XdsLocality, Set<ServiceInstance>> | Cluster的服务实例，由不同区域的服务实例组成 |
- 区域信息[XdsLocality](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsLocality.java)，其字段如下：

  | 字段名称          | 字段类型 | 描述         |
  | ----------------- | -------- | ------------ |
  | region            | String   | 区域信息     |
  | zone              | String   | 区域信息     |
  | subZone           | String   | 区域信息     |
  | loadBalanceWeight | int      | 负载均衡权重 |
  | localityPriority  | int      | 区域优先级   |

  

## 基于xDS协议的路由配置服务

### 功能介绍

**基于xDS协议的路由配置**服务允许Sermant对接Istio的控制平面获取Kubernetes Service的路由配置信息。

> 说明：使用Sermant的xDS路由配置服务能力需服务部署在Kubernetes容器环境并运行Istio。 

### 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程，演示插件如何通过Sermant框架提供的xDS路由配置服务获取服务的路由配置信息：

1. 在工程中`template/template-plugin`下的`io.sermant.template.TemplateDeclarer` 类中新增变量`xdsRouteService`获取Sermant框架提供的xDS路由配置服务，用于获取服务的路由配置信息：

   ```java
   XdsRouteService xdsRouteService = ServiceManager.getService(XdsCoreService.class).getXdsRouteService();
   ```

2. 获取路由配置服务实例之后，可以调用`xdsRouteService`提供的API调用指定服务的路由配置信息：

   ```java
   List<XdsRoute> serviceRoute = xdsRouteService.getServiceRoute("spring-test");
   System.out.println("The size of routing config: " + serviceRoute.size());
   ```

   > 说明：`service-test`必须是Kubernetes Service的名称，获取的路由配置通过Istio提供的[DestinationRule](https://istio.io/latest/zh/docs/reference/config/networking/destination-rule/)和[VirtualService](https://istio.io/latest/zh/docs/reference/config/networking/virtual-service/)下发，Sermant具体支持的路由配置字段和配置模版请参考[基于xDS服务的路由能力](../user-guide/sermant-xds.md#基于xDS服务的路由能力)一节。

   开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**后生成构建产物。

3. 开启xDS服务并且在`agent/config/config.properties`中设置开启xDS服务，配置示例如下：

   ```
   # xDS service switch
   agent.service.xds.service.enable=true
   ```

4. 执行完成后打包Sermant镜像和宿主微服务镜像。在Kubernetes启动宿主应用并挂载Sermant。Kubernetes环境打包Sermant和宿主镜像以及宿主微服务挂载Sermant启动的指导请参考[Sermant Injector使用手册](../user-guide/sermant-injector.md#启动和结果验证)。根据Sermant提供的[路由配置模版](../user-guide/sermant-xds.md#Istio路由配置模版)下发[DestinationRule](https://istio.io/latest/zh/docs/reference/config/networking/destination-rule/)和[VirtualService](https://istio.io/latest/zh/docs/reference/config/networking/virtual-service/)规则。

5. 宿主微服务挂载Sermant的Pod启动成功后，可以执行以下命令获取宿主微服务日志，查看通过xDS路由配置服务获取的路由配置数量

   ```shell
   $ kubectl logs -f ${POD_NAME}
   The size of routing config: 1
   ```

   > 说明：`${POD_NAME}`必须是宿主微服务运行的pod名称，可通过`kubectl get pod`命令查看。

### xDS路由配置服务API

**获取xDS路由配置服务：**

```java
XdsRouteService xdsRouteService = ServiceManager.getService(XdsCoreService.class).getXdsRouteService();
```

**xDS路由配置服务**服务共有两个接口方法，分别用于获取Service的路由配置信息、Cluster是否开启同AZ路由：

```java
List<XdsRoute> getServiceRoute(String serviceName);

boolean isLocalityRoute(String clusterName);
```

#### 获取服务的路由配置信息

- 获取Kubernetes Service的路由配置信息，返回值为`List<XdsRoute>`类型，包含该Service的所有路由配置信息

  ```java
  xdsRouteService.getServiceRoute("service-test");
  ```

- 路由配置[XdsRoute](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsRoute.java)，其字段如下：

  | 字段名称    | 字段类型       | 描述                 |
  | ----------- | -------------- | -------------------- |
  | name        | String         | 路由配置的名称       |
  | routeMatch  | XdsRouteMatch  | 路由匹配的匹配规则   |
  | routeAction | XdsRouteAction | 路由匹配的路由目的地 |

#### ClusterAZ路由

- 获取Service的Cluster是否开启同AZ路由，返回值为`boolean`类型

  ```java
  xdsRouteService.isLocalityRoute("outbound|8080||service-test.default.svc.cluster.local")；
  ```

## 基于xDS协议的负载均衡配置服务

### 功能介绍

**基于xDS协议的负载均衡配置服务**允许Sermant对接Istio的控制平面获取Kubernetes Service的负载均衡规则。

> 说明：使用Sermant的xDS负载均衡配置服务需服务部署在Kubernetes容器环境并运行Istio。 

### 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程，演示插件如何通过Sermant框架提供的xDS负载均衡配置服务获取服务的负载均衡规则：

1. 在工程中`template/template-plugin`下的`io.sermant.template.TemplateDeclarer` 类中新增变量`loadBalanceService`获取Sermant框架提供的xDS负载均衡配置服务，用于获取服务的负载均衡规则：

   ```java
   XdsLoadBalanceService loadBalanceService = 
   ServiceManager.getService(XdsCoreService.class).getLoadBalanceService();
   ```

2. 获取负载均衡配置服务之后，可以调用`loadBalanceService`提供的API获取服务的负载均衡策略：

   ```java
   XdsLbPolicy serviceLbPolicy = loadBalanceService.getBaseLbPolicyOfService("spring-test");
   System.out.println("service lb policy: " + serviceLbPolicy);
   ```
   
   > 说明：`service-test`必须是Kubernetes Service的名称，获取的负载均衡配置通过Istio提供的[DestinationRule](https://istio.io/latest/zh/docs/reference/config/networking/destination-rule/)下发，Sermant具体支持的负载均配置字段、支持配置的负载均衡规则和配置模版请参考[基于xDS服务的负载均衡能力](../user-guide/sermant-xds.md#基于xDS服务的负载均衡能力)一节。
   
   开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**后生成构建产物。
   
3. 开启xDS服务并且在`agent/config/config.properties`中设置开启xDS服务，配置示例如下：

   ```
   # xDS service switch
   agent.service.xds.service.enable=true
   ```

4. 执行完成后打包Sermant镜像和宿主微服务镜像。在Kubernetes启动宿主微服务并挂载Sermant。Kubernetes环境打包Sermant和宿主镜像以及宿主微服务挂载Sermant启动的指导请参考[Sermant Injector使用手册](../user-guide/sermant-injector.md#启动和结果验证)。根据Sermant提供的[负载均衡配置模版](../user-guide/sermant-xds.md#Istio负载均衡配置模版)下发[DestinationRule](https://istio.io/latest/zh/docs/reference/config/networking/destination-rule/)。

5. 宿主微服务挂载Sermant的Pod启动成功后，可以执行以下命令获取宿主微服务日志，查看通过xDS负载均衡配置服务获取的服务负载均衡策略

   ```shell
   $ kubectl logs -f ${POD_NAME}
   service lb policy: ROUND_ROBIN
   ```

   > 说明：`${POD_NAME}`必须是宿主微服务运行的pod名称，可通过`kubectl get pod`命令查看。

### xDS负载均衡配置服务API

**获取xDS负载均衡配置服务：**

```java
XdsLoadBalanceService loadBalanceService = 
ServiceManager.getService(XdsCoreService.class).getLoadBalanceService();
```

**xDS负载均衡配置服务**共有两个接口方法，分别用于获取Service的负载均衡规则、Cluster的负载均衡规则：

```java
XdsLbPolicy getLbPolicyOfCluster(String clusterName);

XdsLbPolicy getBaseLbPolicyOfService(String serviceName);
```

#### 获取Service的负载均衡规则

- 获取Service的负载均衡规则，返回值为`XdsLbPolicy`类型

  ```java
  loadBalanceService.getBaseLbPolicyOfService("service-test")；
  ```

- 负载均衡规则实体类[XdsLbPolicy](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsLbPolicy.java)为枚举类型

  | 负载均衡规则              | 描述                 |
  | ------------------------- | -------------------- |
  | XdsLbPolicy.RANDOM        | 随机负载均衡规则     |
  | XdsLbPolicy.ROUND_ROBIN   | 轮训负载均衡规则     |
  | XdsLbPolicy.LEAST_REQUEST | 最小请求负载均衡规则 |
  | XdsLbPolicy.UNRECOGNIZED  | 未识别的负载均衡规则 |

#### 获取Cluster的负载均衡规则

- 获取Service Cluster的负载均衡规则，返回值为`XdsLbPolicy`类型

  ```java
  loadBalanceService.getLbPolicyOfCluster("outbound|8080||service-test.default.svc.cluster.local")；
  ```

## xDS服务配置

在Sermant Agent的产品包`agent/config/config.properties`，可通过`agent.service.xds.service.enable`配置项开启xDS服务，xDS服务的其他配置也在该文件进行配置：

```
# xDS服务开关
agent.service.xds.service.enable=false
```
