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

**xDS服务发现**服务共有两个接口方法，分别用于直接获取服务实例、通过订阅方式获取服务实例：

```java
Set<ServiceInstance> getServiceInstance(String serviceName);

void subscribeServiceInstance(String serviceName, XdsServiceDiscoveryListener listener);
```

#### 直接获取服务实例

- 获取Kubernetes service的服务实例信息，返回值为`java.util.Set`类型，包含该service的所有服务实例

    ```java
    xdsServiceDiscovery.getServiceInstance("service-test")
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

  | 方法                                         | 解析                           |
  | :------------------------------------------- | :----------------------------- |
  | void process(Set<ServiceInstance> instances) | 处理最新服务实例信息的回调接口 |

- 服务实例[ServiceInstance](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/ServiceInstance.java)，其方法如下：

  | 返回值类型          | 方法名           | 解析                                     |
  | :------------------ | :--------------- | :--------------------------------------- |
  | String              | getClusterName() | 获取服务实例所属的istio cluster名称      |
  | String              | getServiceName() | 获取服务实例所属的Kubernetes service名称 |
  | String              | getHost()        | 获取服务实例的Pod IP                     |
  | int                 | getPort()        | 获取服务实例的端口                       |
  | Map<String, String> | getMetaData()    | 获取服务实例的元数据                     |
  | boolean             | isHealthy()      | 服务是否健康                             |

## xDS服务配置

在Sermant Agent的产品包`agent/config/config.properties`，可通过`agent.service.xds.service.enable`配置项开启xDS服务，xDS服务的其他配置也在该文件进行配置：

```
# xDS服务开关
agent.service.xds.service.enable=false
```
