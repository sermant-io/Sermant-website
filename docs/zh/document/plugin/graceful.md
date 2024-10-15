# 无损上下线

本文介绍如何使用无损上下线插件，目前无损上下线功能当前集成在[注册迁移插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-service-registry) 中, 可独立使用。

## 功能介绍

在应用上下线发布过程中，如何做到流量的无损上/下线，是一个系统能保证SLA的关键。如果应用上下线不平滑，就会出现短时间的服务调用报错，比如连接被拒绝、请求超时、没有实例和请求异常等问题。
- 在应用上线发布过程中，由于过早暴露服务，实例可能仍处在JVM JIT编译或者使用的中间件还在加载，若此时大量流量进入，可能会瞬间压垮新起的服务实例。
- 在应用下线过程中，服务消费者感知服务提供者下线有延迟，在一段时间内，被路由到已下线服务提供者实例的请求都抛连接被拒绝异常。其次服务实例在接收到停止服务信号时，会立即关闭，但是这时候可能在请求队列中存在一部分请求还在处理，如果立即关闭这些请求都会损失掉。

针对应用上下线发布过程中的问题，插件提供预热和延迟下线机制，为应用提供无损上下线的能力。预热是无损上线的核心机制，延迟下线时无损下线的核心机制，而且为了无损上线，还做了延迟注册机制。

<MyImage src="/docs-img/elegant-online.png"/>

**延迟注册：** 若服务还未完全初始化就已经注册到注册中心提供给消费者调用，很有可能因资源为加载完成导致请求报错。可以通过设置延迟注册，让服务充分初始化后再注册到注册中心对外提供服务。

**预热：** 是基于客户端实现的，当流量进入时，Sermant会动态调整流量，根据服务的预热配置，对流量进行动态分配。对于开启服务预热的实例，在刚启动时，相对于其他已启动的实例，分配的流量会更少，流量将以曲线方式随时间推移增加直至与其他实例近乎持平。目的是采用少流量对服务实例进行初始化，防止服务崩溃。

<MyImage src="/docs-img/elegant-offline.png"/>

**延迟下线：** 即对下线的实例提供保护，插件基于**下线实时通知**+**刷新缓存的机制**快速更新上游的实例缓存，同时基于**流量统计**的方式，确保即将下线的实例尽可能的将流量处理完成，最大程度避免流量丢失。

**流量统计：** 为确保当前请求已全部处理完成，在服务下线时，Sermant会尝试等待30s（可配置），定时统计和判断当前实例请求是否均处理完成，处理完成后最终下线。

## 参数配置

### 插件配置

无损上下线插件需要打开无损上下线开关（`grace.rule.enableSpring`）、配置启动延迟时间（`grace.rule.startDelayTime`）、开启预热（`grace.rule.enableWarmUp`）等配置，可在`${path}/sermant-agent-x.x.x/agent/pluginPackge/service-registry/config/config.yaml`找到该插件的配置文件，配置如下所示：

```yaml
grace.rule:
  enableSpring: false # springCloud无损上下线开关。
  startDelayTime: 0  # 无损上线启动延迟时间, 单位S。上线延迟为避免实例未准备就绪就注册导致上游服务调用时无法提供服务。
  enableWarmUp: false # 是否开启预热。针对新实例，为避免实例初始化时涌入大量流量而导致请求响应超时、阻塞、资源耗尽等造成新实例宕机，可开启预热在初始化时分配少量流量。
  warmUpTime: 120    # 预热时间, 单位S。预热过程的持续时间。
  enableGraceShutdown: false # 是否开启无损下线。
  shutdownWaitTime: 30  # 关闭前相关流量检测的最大等待时间, 单位S。 需开启enabledGraceShutdown才会生效。在无损下线前，Agent会定期检查当前实例是否完成全部请求处理，通过此配置指定检查的持续时间。
  enableOfflineNotify: false # 是否开启下线主动通知。
  httpServerPort: 16688 # 提供的httpServer端口，用于应用就绪检查以及接收下游应用下线主动的通知。
  upstreamAddressMaxSize: 500 # 缓存上游地址的默认大小。上游实例接收主动通知的地址会被下游缓存，此处设置地址最多的缓存个数。
  upstreamAddressExpiredTime: 60 # 缓存上游地址的过期时间, 单位S。上游实例接收主动通知的地址会被下游缓存，此处设置地址的失效时间。
```

| 参数键                               | 说明                                                                     | 默认值        | 是否必须 |
| :----------------------------------- | :---------------------------------------------------------------------- | :------------| :------- |
| grace.rule.enableSpring              | springCloud无损上下线开关。                                                | false         | 是    |
| grace.rule.startDelayTime            | 无损上线启动延迟时间, 单位S。上线延迟为避免实例未准备就绪就注册导致上游服务调用时无法提供服务。                                            | 0             | 是    |
| grace.rule.enableWarmUp              | 是否开启预热。针对新实例，为避免实例初始化时涌入大量流量而导致请求响应超时、阻塞、资源耗尽等造成新实例宕机，可开启预热在初始化时分配少量流量。                                                             | false         | 是    |
| grace.rule.enableGraceShutdown       | 是否开启无损下线。                                                          | false         | 是    |
| grace.rule.shutdownWaitTime          | 关闭前相关流量检测的最大等待时间, 单位S。需开启enabledGraceShutdown才会生效。在无损下线前，Agent会定期检查当前实例是否完成全部请求处理，通过此配置指定检查的持续时间。  | 30            | 是    |
| grace.rule.enableOfflineNotify       | 是否开启下线主动通知。                                                      | false         | 是    |
| grace.rule.httpServerPort            | 提供的httpServer端口，用于应用就绪检查以及接收下游应用下线主动的通知。                                 | 16688          | 是    |
| grace.rule.upstreamAddressMaxSize    | 缓存上游地址的默认大小。上游实例接收主动通知的地址会被下游缓存，此处设置地址最多的缓存个数。                                                    | 5000           | 是    |
| grace.rule.upstreamAddressExpiredTime| 缓存上游地址的过期时间, 单位S。上游实例接收主动通知的地址会被下游缓存，此处设置地址的失效时间。                                              | 60            | 是    |

## 微服务延迟下线

为了保证每次微服务下线过程中，服务消费者能尽早感知服务提供者实例下线的行为，同时服务提供者需保证处理中请求被处理完后再进行服务下线。

容器场景：K8s提供了Pod优雅退出机制，允许Pod在退出前完成一些清理工作。preStop会先执行完，然后K8s才会给Pod发送TERM信号。在容器场景利用K8s提供的preStop机制，配合延迟下线API使用，这样就能保证流量的无损下线。以容器化服务为例（Sermant容器化部署依赖[injector组件](../user-guide/sermant-injector.md)）：给SpringCloud应用配置了preStop。

> **注意：** 延迟下线能力依赖k8s的preStop机制，若您的编排文件已配置preStop，需要您在编排文件位置“spec > containers > lifecycle > preStop > exec > command”添加如下命令：

```shell
curl -XPOST http://127.0.0.1:16688/\$\$sermant\$\$/shutdown 2>/tmp/null;sleep 30;exit 0
```

> **说明：** 添加该命令会在Pod停止前通知实例进行下线。其中16688为下线通知端口，默认为该值，可通过环境变量“grace_rule_httpServerPort”进行指定。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: spring-cloud-xxx
  name: spring-cloud-xxx
  namespace: xxx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: spring-cloud-xxx
  template:
    metadata:
      labels:
        app: spring-cloud-xxx
        sermant-injection: enabled
    spec:
      containers:
      - env:
        - name: JAVA_HOME
          value: /xxx
        image: xxx
        imagePullPolicy: Always
        name: spring-cloud-xxx
        ports:
        - containerPort: 8080
          protocol: TCP
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
        lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - '-c'
                  - '>- curl -XPOST http://127.0.0.1:16688/\$\$sermant\$\$/shutdown 2>/tmp/null;sleep
                    30;exit 0'
                    # 在Pod停止前通知实例进行下线，其中16688为下线通知端口，无损上下线插件配置中的httpServerPort
```

虚拟机场景：无需配置preStop机制，因为无损上下线插件会对Spring的ContextClosedEvent事件进行监听，当监听到ContextClosedEvent事件，会主动通知实例进行下线。

> **说明：** Spring的核心是ApplicationContext，它负责管理beans的完整生命周期。当关闭ApplicationContext时，ContextClosedEvent事件会被触发。

```java
    /**
     * ContextClosedEvent事件监听器
     */
    @EventListener(value = ContextClosedEvent.class)
    public void listener() {
        if (!isEnableGraceDown() || graceService == null) {
            return;
        }
        graceService.shutdown();
    }
```

> **注意：** 虚机关闭应用服务建议执行kill -15 PID ，给目标进程一个清理善后工作的机会。
> 
> kill -15，系统向应用发送SIGTERM（15）信号，该信号是可以被执行、阻塞和忽略的，应用程序接收到信号后，可以做很多事情，甚至可以决定不终止；
>
> kill -9， 系统会发出SIGKILL（9）信号，由操作系统内核完成杀进程操作，该信号不允许忽略和阻塞，所以应用程序会立即终止； 

**那为什么容器应用（K8s环境）要配置preStop？**

#### 一、首先要介绍一下Pod的终止过程：

<MyImage src="/docs-img/pod-terminate.png"/>

1) 用户发送删除 Pod 对象的命令。

2) API 服务器中的 Pod 对象会随着时间的推移而更新，在宽限期内（默认为30秒），Pod被视为“dead”。

3) 将 Pod 标记为 “Terminating” 状态。

4) （与第3步同时运行）kubelet 在监控到 Pod 对象转为 “Terminating” 状态的同时启动 Pod 关闭程序。

5) （与第3步同时运行）端点控制器监控到 Pod 对象的关闭行为时将其从所有匹配到此端点的 Service 资源的端点列表中移除。

6) Pod 对象中的容器进程收到 TERM 信号。

7) 如果当前当前 Pod 对象定义了 preStop 钩子处理器，则在其标记为 “terminating” 后即会以同步的方式启动执行；如若宽限期结束后，preStop 仍未执行结束，则第2步会被重新执行并额外获取一个时长为2秒的小宽限期。

8) 宽限期结束后，若存在任何一个仍在运行的进程，那么 Pod 对象即会收到 SIGKILL 信号。

9) kubelet 请求 API Server 将此 Pod 资源的宽限期设置为0从而完成删除操作，它变得对用户不在可见。

默认情况下，所有删除操作的宽限期都是30秒，不过，kubectl delete 命令可以使用“--grace-period=”选项自定义其时长，若使用0值则表示直接强制删除指定的资源，不过，此时需要同时为命令使用 “--force” 选项。

> **参考：** https://kubernetes.renkeju.com/chapter_4/4.5.5.pod_termination_process.html

**从上述Pod终止过程的时序图可知，关闭Pod流程（关注红色框），给Pod内的进程发送TERM信号(即kill, kill -15)，如果配置了preStop钩子也会同时处理，最后宽限期结束后，若存在任何一个仍在运行的进程，那么Pod对象即会收到SIGKILL（kill-9）信号**。

#### 二、存在这样一种情况Pod中的业务进程接受不到`SIGTERM`信号

存在这样一种情况Pod中的业务进程接受不到`SIGTERM`信号（而且没有配置preStop钩子），等待一段时间业务进程直接被SIGKILL强制杀死了。

**为什么业务进程接受不到`SIGTERM`信号？**

> 踩过坑！

通常都是因为容器启动入口使用了 shell，比如使用了类似 `/bin/sh -c my-app` 或 `/docker-entrypoint.sh` 这样的 ENTRYPOINT 或 CMD，这就可能就会导致容器内的业务进程收不到SIGTERM信号，原因是:

1. 容器主进程是shell，业务进程是在shell中启动的，成为了shell进程的子进程。
2. shell 进程默认不会处理 SIGTERM 信号，自己不会退出，也不会将信号传递给子进程，导致业务进程不会触发停止逻辑。
3. 当等到 K8S 优雅停止超时时间 (terminationGracePeriodSeconds，默认30s)，发送SIGKILL强制杀死shell及其子进程。

> **参考:** https://imroc.cc/k8s/faq/why-cannot-receive-sigterm/

#### 三、如何解决上述Pod中的业务进程接受不到`SIGTERM`信号问题

1. 配置preStop钩子（K8s场景），处理退出前完成一些清理工作，比如使用无损上下线插件的应用服务需在停止前通知实例进行下线。
2. 如果可以的话，尽量不使用 shell 启动业务进程。
3. 如果一定要通过 shell 启动，比如在启动前需要用 shell 进程一些判断和处理，或者需要启动多个进程，那么就需要在 shell 中传递下 SIGTERM 信号了，解决方案请[参考 Kubernetes 实用技巧: 在 SHELL 中传递信号](https://imroc.cc/k8s/trick/propagating-signals-in-shell/) 。

**所以容器应用（K8s环境）要配置preStop，在停止前通知实例进行下线，加了一层防护，保证Pod中的业务能优雅的结束。**


## 支持版本和限制

框架支持：

- **仅支持SpringCloud应用**，需确保SpringCloud版本在`Edgware.SR2`及以上
- 注册中心支持：ZooKeeper、Consul、Nacos、Eureka、ServiceComb

限制：

- 无损上下线能力基于SpringCloud的默认负载均衡能力开发，若您实现了自定义负载均衡能力，该能力将不再适用
- 容器场景镜像需要支持curl命令


## 操作和结果验证

下面演示如何使用无损上下线插件，在容器场景下，验证SpringCloud应用的延迟注册、预热和延迟下线场景。

### 1 准备工作

- 已经部署好kubernetes环境
- [下载](https://github.com/sermant-io/Sermant/releases/download/v2.0.0/sermant-2.0.0.tar.gz) Sermant Release包（当前版本推荐2.0.0版本）
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v2.0.0/sermant-examples-grace-demo-2.0.0.tar.gz) Demo二进制产物压缩包
- [下载](https://github.com/alibaba/nacos/releases)Nacos（注册中心），并部署

> **注意：** 
> 1. [动态配置中心](../user-guide/configuration-center.md)会在本场景中默认使用，由于非本场景的核心组件，因此在本文中不额外赘述。
> 2. 容器环境需提前部署好[injector组件](../user-guide/sermant-injector.md)。

### 2 制作Demo应用镜像

**1.编译打包Demo应用**

在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo`目录执行如下命令：

```shell
mvn clean package
```

打包成功后可在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-data/target`得到` nacos-rest-data-2.2.0.RELEASE.jar`包，在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-consumer/target`得到`nacos-rest-consumer-2.2.0.RELEASE.jar`，在`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/nacos-rest-provider/target`得到`nacos-rest-provider-2.2.0.RELEASE.jar`。

> **说明：** ${path}为Demo应用下载所在路径。

**2.制作Demo镜像**

修改文件夹中`${path}/Sermant-examples/grace-demo/spring-grace-nacos-demo/deploy/image`中三个服务的Dockfile（`consumerDockerfile`、`dataDockerfile`、`providerDockerfile`）中COPY操作的jar包路径，以及三个服务对应的制作镜像脚本（`build.sh`、`buildConsumer.sh`、`buildData.sh`）中version和name的值。

分别执行三个服务制作镜像的脚本：

```shell
sh build.sh
sh buildConsumer.sh
sh buildData.sh
```
执行 `docker images` 命令可查看制作完的三个镜像。

如需将镜像推送至镜像仓库，请执行如下命令：

```shell
docker push ${imageName}:{imageVerison} 
```


### 3 部署应用

我们将部署一个consumer实例，2个provider实例， 一个data实例(不挂sermant)。三个服务之间的依赖关系如下:

`consumer  ----------->  provider(两实例)  ------------->  data`

其中consumer开启无损上下线能力，一个provider实例开启延迟注册、预热与延迟下线能力， 另一个provider实例仅开启延迟下线能力，data服务接受到请求后会返回自身服务名+IP地址信息。

（1）部署data（端口8008）

执行如下命令：

```shell
kubectl apply -f data.yaml
```

> **注意：** 部署之前需修改data.yaml中相关Namespace、服务镜像地址和Nacos注册中心地址。

`data.yaml`配置如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos-rest-data
  namespace: xxx   # 需修改部署data应用所在的namespace
  labels:
    app: nacos-rest-data
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos-rest-data
  template:
    metadata:
      labels:
        app: nacos-rest-data
    spec:
      containers:
        - name: nacos-rest-data
          image: xxx/data:x.x.x # 需修改data应用的镜像
          ports:
            - containerPort: 8008
          env:
          - name: "spring_cloud_nacos_discovery_serveraddr"
            value: "x.x.x.x:8848" # nacos注册中心地址
      imagePullSecrets:
        - name: default-secret
```

（2）部署第一个provider实例（端口8006, **关闭预热功能**）

执行如下命令：

```shell
kubectl apply -f provider-closeWarmUp.yaml
```

> **注意：** 部署之前需修改provider-closeWarmUp.yaml中相关Namespace、服务镜像地址和Nacos注册中心地址。

`provider-closeWarmUp.yaml`配置如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos-rest-provider-close-warmup
  namespace: xxx    # 需修改部署nacos-rest-provider-close-warmup应用所在的namespace
  labels:
    app: nacos-rest-provider-close-warmup
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos-rest-provider-close-warmup
  template:
    metadata:
      labels:
        app: nacos-rest-provider-close-warmup
        sermant-injection: enabled
    spec:
      containers:
        - name: nacos-rest-provider-close-warmup
          image: xxx/provider:x.x.x # 需修改nacos-rest-provider-close-warmup应用的镜像
          ports:
            - containerPort: 8006
          env:
          - name: "server_port"
            value: "8006"
          - name: "spring_cloud_nacos_discovery_serveraddr"
            value: "x.x.x.x:8848" # Nacos注册中心地址
          - name: "grace_rule_enableSpring"
            value: "true"
          - name: "grace_rule_enableWarmUp"
            value: "false"  # 配置关闭服务预热功能
          - name: "grace_rule_enableGraceShutdown"
            value: "true"
          - name: "grace_rule_enableOfflineNotify"
            value: "true"
      imagePullSecrets:
        - name: default-secret
```

（3）启动第二个provider实例（端口8004, **开启延迟注册和预热能力**）

执行如下命令：

```shell
kubectl apply -f provider.yaml
```

> **注意：** 部署之前需修改provider.yaml中相关Namespace、服务镜像地址和Nacos注册中心地址。

`provider.yaml`配置如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos-rest-provider
  namespace: xxx   # 需修改部署nacos-rest-provider应用所在的namespace
  labels:
    app: nacos-rest-provider
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos-rest-provider
  template:
    metadata:
      labels:
        app: nacos-rest-provider
        sermant-injection: enabled
    spec:
      containers:
        - name: nacos-rest-provider
          image: xxx/provider:x.x.x   # 需修改nacos-rest-provider应用的镜像
          ports:
          - containerPort: 8004
          env:
          - name: "spring_cloud_nacos_discovery_serveraddr"
            value: "x.x.x.x:8848" # nacos注册中心地址
          - name: "grace_rule_enableSpring"
            value: "true"
          - name: "grace_rule_startDelayTime"
            value: "30"    # 上线启动延迟30s
          - name: "grace_rule_enableWarmUp"
            value: "true"  # 开启服务预热功能
          - name: "grace_rule_enableGraceShutdown"
            value: "true"
          - name: "grace_rule_enableOfflineNotify"
            value: "true"
      imagePullSecrets:
        - name: default-secret
```

> **注意：** 第二个provider实例对比第一个provider实例会延迟30s后再注册到Nacos注册中心

（4）部署consumer（端口8005）

执行如下命令：

```shell
kubectl apply -f consumer.yaml
```

> **注意：** 部署之前需修改consumer.yaml中相关Namespace、服务镜像地址和Nacos注册中心地址。

`consumer.yaml`配置如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos-rest-consumer
  namespace: xxx   # 需修改部署nacos-rest-consumer应用所在的namespace
  labels:
    app: nacos-rest-consumer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos-rest-consumer
  template:
    metadata:
      labels:
        app: nacos-rest-consumer
        sermant-injection: enabled
    spec:
      containers:
        - name: nacos-rest-consumer
          image: xxx/consumer:x.x.x  # 需修改nacos-rest-consumer应用的镜像
          ports:
          - containerPort: 8005
          env:
          - name: "spring_cloud_nacos_discovery_serveraddr"
            value: "x.x.x.x:8848" # Nacos注册中心地址
          - name: "grace_rule_enableSpring"
            value: "true"
          - name: "grace_rule_enableWarmUp"
            value: "true"
          - name: "grace_rule_enableGraceShutdown"
            value: "true"
          - name: "grace_rule_enableOfflineNotify"
            value: "true"
      imagePullSecrets:
        - name: default-secret
```

如下图所示：3个服务对应的4个实例都已经注册至Nacos上

<MyImage src="/docs-img/nacos-rest-services.png"/>

### 4 验证

#### 预热能力验证

找到consumer服务的pod名，执行如下命令：

```shell
# xxx为namespace
kubectl get pod -n xxx
```

进入pod的容器内，执行如下命令：

```shell
# nacos-rest-consumer-7d8f9f4f7-rtwfn为consumer服务的pod名
kubectl exec -it nacos-rest-consumer-7d8f9f4f7-rtwfn bash
```

持续访问接口`curl localhost:8005/graceHot`，根据接口返回的ip与port判断预热是否生效。若预热时间段内（默认120s）访问偏向端口为`8006`的provider，随时间推移流量逐渐**平均**，则说明预热生效。

**预热阶段的数据**（流量大部分进入了端口为8006的provider实例，少量进入端口为8004的provider实例）：

```shell
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
```

**完成预热后数据**（流量**均匀**的进入端口为8006和8004的provider实例）：

```shell
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceHot
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
```


#### 延迟下线验证

找到consumer服务的pod名，执行如下命令：

```shell
# xxx为namespace
kubectl get pod -n xxx
```

进入pod的容器内，执行如下命令：

```shell
# nacos-rest-consumer-7d8f9f4f7-rtwfn为consumer服务的pod名
kubectl exec -it nacos-rest-consumer-7d8f9f4f7-rtwfn bash
```

持续访问接口`curl localhost:8005/graceDownOpen`, 此时下线其中一个provider实例，观察请求是否出现错误，若未出现错误，则延迟下线能力验证成功。

请求数据（**随机一个时间下线其中一个provider实例**）如下：

```shell
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8006]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
curl localhost:8005/graceDownOpen
nacos-rest-consumer[x.x.x.x:8005]->nacos-rest-provider[x.x.x.x:8004]->nacos-rest-data[x.x.x.x:8008]
```