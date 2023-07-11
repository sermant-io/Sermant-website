# Sermant性能基准测试

本文档包含Sermant性能的基准测试结果(持续更新)。

## 标签路由插件

我们使用 [Sermant-examples](https://github.com/huaweicloud/Sermant-examples) 仓库中的作为基准应用进行性能测试，以说明Sermant的[service-router标签路由插件](../plugin/router.md)挂载至应用上的性能表现。

### 部署场景

本次测试我们将上述仓库中的 [Spring Cloud应用](https://github.com/huaweicloud/Sermant-examples/tree/main/grace-demo/spring-grace-nacos-demo) 部署至容器环境中:

- nacos-rest-consumer，部署1个Pod，挂载Sermant的service-router插件。该服务作为入口服务，根据动态配置中心下发的标签规则来筛选下游实例进行调用。本次测试将监控该服务的性能表现。
- nacos-rest-provider，部署3个Pod，挂载Sermant的service-router插件，并且不同的Pod配置的不同的标签以供服务消费者进行筛选。该服务作为nacos-rest-consumer的服务提供者。
- nacos-rest-data，部署1个Pod，不挂载Sermant，该服务作为作为nacos-rest-provider的服务提供者。

该部署场景中，服务调用关系如下：

<MyImage src="/docs-img/test_router.jpg"/>

我们向动态配置中心下发合法的路由插件规则，使得nacos-rest-consumer的请求按标签路由规则发送到指定的nacos-rest-provider实例。

另外，本次测试的基线对照组，所有应用均不挂载Sermant。

### 部署环境

本次测试使用华为云容器引擎CCE进行应用部署，K8s集群的ECS节点数量为2个，规格如下：

```
规格：通用计算型｜16vCPUs｜32GiB｜s6.4xlarge.2
Docker Version: v18.09.9
Kubernetes Version: v1.23
```

K8s中所有应用Pod的规格一致，均为`4vCPUs|8GiB`。

Sermant版本：[`Release v1.1.0`](https://github.com/huaweicloud/Sermant/releases/tag/v1.1.0)

### 测试结果

使用Jmeter对nacos-rest-consumer进行并发调用，分别模拟50用户、目标1000tps，以及100用户、目标2000tps。

| 并发线程数 | CPU(基线/挂载Sermant/差异) | Heap内存                | Metaspace内存         | P90(ms)            | P95(ms)            | Throughout(/s)          |
| ---------- | -------------------------- | ----------------------- | --------------------- | ------------------ | ------------------ | ----------------------- |
| 50         | 13.8% / 16.9% / 3.1%       | 92.7M / 122.5M /  29.8M | 56.8M / 66.6M / 9.8M  | 34ms / 34ms / 0    | 35ms / 36ms / 2.8% | 992.8 / 986.4 / -0.6%   |
| 100        | 26.9% / 32.5% / 5.6%       | 150.4M / 183.5M / 33.1M | 56.6M / 66.8M / 10.2M | 34ms / 35ms / 2.9% | 35ms / 38ms / 7.9% | 1980.4 / 1965.4 / -0.7% |

### 总结

Sermant标签路由插件对于宿主应用的CPU占用率、内存占用、吞吐量以及时延影响较低，额外消耗的资源主要用于请求过程中路由规则的匹配和实例的筛选。

## 离群实例摘除插件

我们使用 [Sermant-examples](https://github.com/huaweicloud/Sermant-examples) 仓库中的作为基准应用进行性能测试，以说明Sermant的[service-removal离群实例摘除插件](../plugin/removal.md)挂载至应用上的性能表现。

### 部署场景

本次测试我们将上述仓库中的 [Spring Cloud应用](https://github.com/huaweicloud/Sermant-examples/tree/main/grace-demo/spring-grace-nacos-demo) 部署至容器环境中:

- nacos-rest-consumer，部署1个Pod，挂载Sermant的service-removal插件。该服务作为入口服务，离群实例摘除插件挂载于该插件上，会对异常的nacos-rest-provider实例做摘除操作，避免请求调用至状态异常的实例。本次测试将监控该服务的性能表现。
- nacos-rest-provider，部署3个Pod，不挂载Sermant。该服务作为nacos-rest-consumer的服务提供者。
- nacos-rest-data，部署1个Pod，不挂载Sermant，该服务作为作为nacos-rest-provider的服务提供者。

该部署场景中，服务调用关系如下：

<MyImage src="/docs-img/test_removal.jpg"/>

我们在离群实例摘除插件中配置合法的实例摘除规则，使得nacos-rest-consumer将状态异常的实例从服务发现列表中删除。

另外，本次测试的基线对照组，所有应用均不挂载Sermant。

### 部署环境

本次测试使用华为云容器引擎CCE进行应用部署，K8s集群的ECS节点数量为2个，规格如下：

```
规格：通用计算型｜16vCPUs｜32GiB｜s6.4xlarge.2
Docker Version: v18.09.9
Kubernetes Version: v1.23
```

K8s中所有应用Pod的规格一致，均为`4vCPUs|8GiB`。

Sermant版本：[`Release v1.1.0`](https://github.com/huaweicloud/Sermant/releases/tag/v1.1.0)

### 测试结果

使用Jmeter对nacos-rest-consumer进行并发调用，分别模拟50用户、目标1000tps，以及100用户、目标2000tps。

| 并发线程数 | CPU(基线/挂载Sermant/差异) | Heap内存                | Metaspace内存        | P90(ms)         | P95(ms)             | Throughout(/s)          |
| ---------- | -------------------------- | ----------------------- | -------------------- | --------------- | ------------------- | ----------------------- |
| 50         | 13.8% / 14.3% / 0.5%       | 92.7M / 105.7M /  13.0M | 56.8M / 65.5M / 8.7M | 34ms / 34ms / 0 | 35ms / 34ms / -2.9% | 992.8 / 993.5 / 0.1%    |
| 100        | 26.9% / 28.2% / 0.3%       | 150.4M /  167M / 16.6M  | 56.6M / 65.5M / 8.9M | 34ms / 34ms / 0 | 34ms / 34ms / 0     | 1980.4 / 1984.5 /  0.1% |

### 总结

Sermant离群实例摘除插件对于宿主应用的CPU占用率、内存占用、吞吐量以及时延影响非常轻微，额外的资源消耗主要用于请求成功率的统计以及离群实例的摘除过程，对请求过程基本无影响。