# xDS Service

Istio is deployed with a control plane and a data plane. Traditionally, the data plane uses sidecar containers with network proxies (such as Envoy), which increases network latency for microservice calls. In Kubernetes environments, Sermant uses the xDS protocol to communicate directly with Istiod, enabling service discovery. Using a [Proxyless Service Mesh based on Istio+Sermant](../user-guide/sermant-xds.md) can significantly reduce microservice call latency and simplify system deployment. This article introduces how to use Sermant's xDS service in plugin development.

## Service Discovery Based on xDS Protocol

### Feature Introduction

**Service discovery based on xDS protocol** allows Sermant to connect to Istio's control plane to obtain Kubernetes service information and the corresponding specific service instance information.

> Note: Using Sermant's xDS service discovery capability requires the service to be deployed in a Kubernetes container environment and istio is running. 

### Development Example

This development example is based on the project created in the [Creating Your First Plugin](README.md) document and demonstrates how the plugin uses the xDS service discovery capability provided by the Sermant framework to obtain service instances:

1. Add the `xdsServiceDiscovery` variable in the `com.huaweicloud.sermant.template.TemplateDeclarer` class under `template/template-plugin` in the project to get the xDS service discovery service provided by the Sermant framework for obtaining service instances:

   ```java
   XdsServiceDiscovery xdsServiceDiscovery = ServiceManager.getService(XdsCoreService.class).getXdsServiceDiscovery();
   ```

2. After obtaining the service discovery instance, you can call the APIs provided by `XdsServiceDiscovery` to perform corresponding actions. This example demonstrates how to directly obtain service instance information for a service named `service-test`:

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
   > Note: `service-test` must be the name of the Kubernetes Service. The obtained service instance information 	corresponds to the Pod instance data of that service, an example Kubernetes Service looks like this:

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
   After completing the development, refer to the [Packaging and Building](README.md#packaged-build) process in the Creating Your First Plugin 	document. Execute **mvn package** in the root directory of the project to generate the build artifact.

3. Enable the xDS service and set it to be enabled in `agent/config/config.properties` with the following configuration: 

   ```
   # xDS service switch
   agent.service.xds.service.enable=true
   ```
4. After completing the execution, package the Sermant image and the host microservice image. Start the `service-test`service in the k8s environment and create the corresponding service instances (implemented by the user). Finally, start the host application in Kubernetes and mount Sermant. Refer to the [Sermant Injector User Guide](../user-guide/sermant-injector.md#startup-and-result-validation) for guidance on packaging Sermant and the host image in the Kubernetes environment, as well as mounting Sermant for startup.

5. After the host microservice pod with Sermant mounted starts successfully, you can execute the following command to obtain the host microservice logs and view the service instances obtained through the xDS service discovery capability:

   ```shell
   $ kubectl logs -f ${POD_NAME}
   ServiceInstance: [xxx.xxx.xxx.xxx : xxxx]
   ```
   > Note: `${POD_NAME}` must be the name of the pod running the host microservice, which can be viewed using the `kubectl get pod` command.

### xDS Service Discovery API

**Obtain xDS Service Discovery Service:**

```java
XdsServiceDiscovery xdsServiceDiscovery = ServiceManager.getService(XdsCoreService.class).getXdsServiceDiscovery();
```

The **xDS Service Discovery** service has three interface methods: used respectively for directly obtaining service instances,   obtaining service instances through subscription and obtaining service instances through cluster.

```java
Set<ServiceInstance> getServiceInstance(String serviceName);

void subscribeServiceInstance(String serviceName, XdsServiceDiscoveryListener listener);

Optional<XdsClusterLoadAssigment> getClusterServiceInstance(String clusterName);
```

#### Directly Obtain Service Instance

- Obtain the service instance information of the Kubernetes service, returning a `java.util.Set` containing all instances of the service.

    ```java
    xdsServiceDiscovery.getServiceInstance("service-test")
    ```

#### Subscribe to Obtain Service Instances

- Subscribe to the service instance information of the Kubernetes service and register a service discovery listener. The listener's `process` function can execute custom operations when service instances change.

  ```java
  xdsServiceDiscovery.subscribeServiceInstance("service-test", new XdsServiceDiscoveryListener() {
              @Override
              public void process(Set<ServiceInstance> instances) {
                  // do something
              }
          });
  ```

- [XdsServiceDiscoveryListener](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/listener/XdsServiceDiscoveryListener.java)，contains the following interface methods:

  | Method                                       | Description                                                  |
  | :------------------------------------------- | :----------------------------------------------------------- |
  | void process(Set<ServiceInstance> instances) | Callback interface for processing the latest service instance information |

- [ServiceInstance](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/ServiceInstance.java), with the following methods:

  | Method Name      | Return Type         | Description                                             |
  | :--------------- | :------------------ | :------------------------------------------------------ |
  | getClusterName() | String              | Get the Istio cluster name the instance belongs to      |
  | getServiceName() | String              | Get the Kubernetes service name the instance belongs to |
  | getHost()        | String              | Get the Pod IP of the instance                          |
  | getPort()        | int                 | Get the port of the instance                            |
  | getMetaData()    | Map<String, String> | Get the metadata of the instance                        |
  | isHealthy()      | boolean             | Check if the service is healthy                         |

#### Get Service Instances through Cluster

- Retrieve the service instance information of a Service Cluster. The return type is `Optional<XdsClusterLoadAssignment>`, which contains all service instances of the Cluster:

  ```
  
  xdsServiceDiscovery.getClusterServiceInstance("outbound|8080||service-test.default.svc.cluster.local");
  ```

- Cluster service instance [XdsClusterLoadAssignment](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsClusterLoadAssignment.java) has the following fields:

  | Field Name        | Field Type                             | Description                                                  |
  | ----------------- | -------------------------------------- | ------------------------------------------------------------ |
  | serviceName       | String                                 | The name of the service to which the Cluster service instance belongs |
  | clusterName       | String                                 | The name of the Cluster                                      |
  | localityInstances | Map<XdsLocality, Set<ServiceInstance>> | The service instances of the Cluster, consisting of service instances from different localities |

- Locality information [XdsLocality](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsLocality.java) has the following fields:

  | Field Name        | Field Type | Description           |
  | ----------------- | ---------- | --------------------- |
  | region            | String     | Region information    |
  | zone              | String     | Zone information      |
  | subZone           | String     | Sub-zone information  |
  | loadBalanceWeight | int        | Load balancing weight |
  | localityPriority  | int        | Locality priority     |

## Route Configuration Service Based on xDS Protocol

### Feature Introduction

The **Route Configuration Service Based on xDS Protocol** allows Sermant to connect with Istio's control plane to retrieve the routing configuration information of Kubernetes Services.

> Note: To use Sermant's xDS routing configuration service, the service must be deployed in a Kubernetes container environment and running Istio.

### Development Example

This development example is based on the project created in the [Create Your First Plugin](README.md) document, demonstrating how a plugin can retrieve routing configuration information for services using the xDS routing configuration service provided by the Sermant framework:

1. In the `io.sermant.template.TemplateDeclarer` class under `template/template-plugin` in the project, add the variable `xdsRouteService` to obtain the xDS route configuration service provided by the Sermant framework, which is used to get the routing configuration information of the services:

   ```
   XdsRouteService xdsRouteService = ServiceManager.getService(XdsCoreService.class).getXdsRouteService();
   ```

2. After obtaining the route configuration service instance, you can call the API provided by `xdsRouteService` to get the routing configuration information of a specified service:

   ```
   List<XdsRoute> serviceRoute = xdsRouteService.getServiceRoute("spring-test");
   System.out.println("The size of routing config: " + serviceRoute.size());
   ```

   > Note: `service-test` must be the name of a Kubernetes Service. The retrieved routing configuration is delivered through Istio's DestinationRule and VirtualService. For the specific routing configuration fields and templates supported by Sermant, please refer to the section [Routing based on xDS Service](../user-guide/sermant-xds.md#routing-based-on-xds-service).

   After development, you can follow the [Packaging and Building](README.md#packaged-build) steps from the first plugin creation to generate the build artifact by executing **mvn package** in the project root directory.

3. Enable the xDS service and configure `agent/config/config.properties` to enable the xDS service. The configuration example is as follows:

   ```
   # xDS service switch
   agent.service.xds.service.enable=true
   ```

4. After completion, package the Sermant image and the host microservice image. Start the host microservice  in Kubernetes and mount Sermant. For guidance on packaging Sermant and host images and mounting Sermant to start host microservices in Kubernetes, please refer to the [Sermant Injector User Guide](../user-guide/sermant-injector.md#startup-and-result-validation). Use the DestinationRuleand VirtualService rules according to the [Istio Routing Configuration Template](../user-guide/sermant-xds.md#istio-routing-configuration-template) provided by Sermant. 

5. After the host microservice is successfully started with Sermant mounted, you can execute the following command to fetch the logs of the host microservice and check the number of routing configurations retrieved by the xDS route configuration service:

   ```
   $ kubectl logs -f ${POD_NAME}
   The size of routing config: 1
   ```

   > Note: `${POD_NAME}` must be the name of the pod where the host microservice is running. You can check it using the `kubectl get pod` command.

### xDS Route Configuration Service API

**To obtain the xDS Route Configuration Service:**

```
XdsRouteService xdsRouteService = ServiceManager.getService(XdsCoreService.class).getXdsRouteService();
```

The **xDS Route Configuration Service** has two API methods: one for getting the routing information of a Service, and the other for checking whether a Cluster has enabled same AZ routing.

```
List<XdsRoute> getServiceRoute(String serviceName);

boolean isLocalityRoute(String clusterName);
```

#### Get Service Routing Configuration

- Retrieve the routing configuration information of a Kubernetes Service. The return type is `List<XdsRoute>`, containing all the routing configuration for that Service:

  ```
  xdsRouteService.getServiceRoute("service-test");
  ```

- The routing configuration entity [XdsRoute](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsRoute.java) includes the following fields:

  | Field Name  | Field Type     | Description                           |
  | ----------- | -------------- | ------------------------------------- |
  | name        | String         | The name of the route configuration   |
  | routeMatch  | XdsRouteMatch  | The matching rule for the route       |
  | routeAction | XdsRouteAction | The routing destination for the match |

#### Cluster AZ Routing

- Check whether the Cluster of a Service has enabled same AZ routing. The return type is `boolean`:

  ```
  xdsRouteService.isLocalityRoute("outbound|8080||service-test.default.svc.cluster.local");
  ```

## Load Balancing Configuration Service Based on xDS Protocol

### Feature Introduction

The **Load Balancing Configuration Service Based on xDS Protocol** allows Sermant to connect with Istio's control plane to retrieve the load balancing rules of Kubernetes Services.

> Note: To use Sermant's xDS load balancing configuration service, the service must be deployed in a Kubernetes container environment and running Istio.

### Development Example

This development example is based on the project created in the [Create Your First Plugin](README.md) document, demonstrating how a plugin can retrieve the load balancing rules for services using the xDS load balancing configuration service provided by the Sermant framework:

1. In the `io.sermant.template.TemplateDeclarer` class under `template/template-plugin` in the project, add the variable `loadBalanceService` to obtain the xDS load balancing configuration service provided by the Sermant framework, which is used to get the load balancing rules of the services:

   ```
   XdsLoadBalanceService loadBalanceService = 
   ServiceManager.getService(XdsCoreService.class).getLoadBalanceService();
   ```

2. After obtaining the load balancing configuration service, you can call the API provided by `loadBalanceService`to get the load balancing strategy of a service:

   ```
   XdsLbPolicy serviceLbPolicy = loadBalanceService.getBaseLbPolicyOfService("spring-test");
   System.out.println("Service lb policy: " + serviceLbPolicy);
   ```

   > Note: `service-test` must be the name of a Kubernetes Service. The load balancing configuration is delivered through Istio's DestinationRule. For the specific supported fields and load balancing rules in the configuration, and configuration templates, please refer to the section [Load balancing based on xDS Service](../user-guide/sermant-xds.md#load-balancing-based-on-xds-service). 

   After development, you can follow the [Packaging and Building](README.md#packaged-build) steps from the first plugin creation to generate the build artifact by executing **mvn package** in the project root directory.

3. Enable the xDS service and configure `agent/config/config.properties` to enable the xDS service. The configuration example is as follows:

   ```
   # xDS service switch
   agent.service.xds.service.enable=true
   ```

4. After completion, package the Sermant image and the host microservice image. Start the host microservice in Kubernetes and mount Sermant. For guidance on packaging Sermant and host images and mounting Sermant to start host microservices in Kubernetes, please refer to the [Sermant Injector User Guide](../user-guide/sermant-injector.md#startup-and-result-validation). Use the DestinationRule provided by Sermant in the [Istio Load Balancing Configuration Template](../user-guide/sermant-xds.md#istio-load-balancing-configuration-template).

5. After the host microservice is successfully started with Sermant mounted, you can execute the following command to fetch the logs of the host microservice and check the load balancing strategy retrieved by the xDS load balancing configuration service:

   ```
   $ kubectl logs -f ${POD_NAME}
   Service lb policy: ROUND_ROBIN
   ```

   > Note: `${POD_NAME}` must be the name of the pod where the host microservice is running. You can check it using the `kubectl get pod` command.

### xDS Load Balancing Configuration Service API

**To obtain the xDS Load Balancing Configuration Service:**

```
XdsLoadBalanceService loadBalanceService = 
ServiceManager.getService(XdsCoreService.class).getLoadBalanceService();
```

The **xDS Load Balancing Configuration Service** provides two API methods: one for getting the load balancing rules of a Service, and another for the load balancing rules of a Cluster:

```
XdsLbPolicy getLbPolicyOfCluster(String clusterName);

XdsLbPolicy getBaseLbPolicyOfService(String serviceName);
```

#### Get Load Balancing Rules of a Service

- Retrieve the load balancing rules for a Service. The return type is `XdsLbPolicy`:

  ```
  loadBalanceService.getBaseLbPolicyOf("spring-test");
  ```

- The load balancing rule entity class [XdsLbPolicy](https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/service/xds/entity/XdsLbPolicy.java) is an enumeration type.

  | Load Balancing Rule       | Description                       |
  | ------------------------- | --------------------------------- |
  | XdsLbPolicy.RANDOM        | Random load balancing rule        |
  | XdsLbPolicy.ROUND_ROBIN   | Round-robin load balancing rule   |
  | XdsLbPolicy.LEAST_REQUEST | Least-request load balancing rule |
  | XdsLbPolicy.UNRECOGNIZED  | Unrecognized load balancing rule  |

#### Get Load Balancing Rules of the Cluster

- Retrieve the load balancing rules of a Service Cluster. The return type is `XdsLbPolicy`.

  ```
  loadBalanceService.getLbPolicyOfCluster("outbound|8080||service-test.default.svc.cluster.local");
  ```

## xDS Service Configuration

In the `agent/config/config.properties` file of the Sermant Agent package, you can enable the xDS service using the `agent.service.xds.service.enable` configuration item. Other xDS service configurations are also set in this file:

```
# xDS service switch
agent.service.xds.service.enable=false
```
