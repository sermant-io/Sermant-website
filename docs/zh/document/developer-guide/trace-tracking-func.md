# 链路功能

本文档介绍Sermant插件如何使用链路功能。

## 功能介绍

为了满足系统的高并发需求，软件架构日益复杂，系统中越来越多的组件开始走向分布式化，如单体架构拆分为微服务、服务内缓存变为分布式缓存、服务组件通信变为分布式消息，这些组件共同构成了繁杂的分布式系统，所以对分布式系统的流量链路中各个执行单元进行标记就显得尤为重要。通过链路标记，可获得在分布式系统流量链路中各个执行单元之间的依赖关系，执行顺序等，可用于分布式链路追踪，链路性能分析，分布式系统故障定位等多种场景。

**Sermant**提供了针对分布式系统中进行链路标记的能力，开发者在开发时只需要正确的选择正确的执行单元进行标记，并指定链路上下文信息在链路中的传递方式即可。

## 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程，在该工程中模拟了一个服务调用过程，并使用`HashMap`来模拟通信载体：

<MyImage src="/docs-img/simulate-tracing.png"></MyImage>

`SimulateServer`模拟WEB服务器，其中`handleRequest`模拟处理请求的逻辑，`consume`用于调用下游服务。

`SimulateProvider`模拟WEB服务器的下游服务，其中`handleConsume`用于处理来自`SimulateServer`的调用。

如需对链路进行完整的链路标记，需要对对分布式系统中关键执行单元进行打标，本示例中主要涉及两种：

- 对服务提供者执行单元进行链路标记：分布式系统各个节点的入口，此处需要通过分布式系统中的通信载体提取当前链路的上下文信息，如果无链路上下文信息，则当作新链路进行标记。
- 对服务消费者执行单元进行链路标记：分布式系统各个节点的出口，此处需要将链路数据的标记放入分布式系统中的通信载体，保持链路的连续性。

基于以上基础，我们针对工程中的服务调用过程来进行链路标记：

1. 首先在工程中`template\template-plugin`下创建针对`SimulateServer`中`handleRequest`的增强声明类`HandleRequestDeclarer`，并在其中实现如下逻辑：

> 注：拦截器的创建方法参考[创建首个插件](README.md)

```java
public class HandleRequestDeclarer extends AbstractPluginDeclarer {
    private static final java.util.logging.Logger LOGGER = LoggerFactory.getLogger();

    @Override
    public ClassMatcher getClassMatcher() {
        return ClassMatcher.nameEquals("com.huaweicloud.template.SimulateServer");
    }

    @Override
    public InterceptDeclarer[] getInterceptDeclarers(ClassLoader classLoader) {
        return new InterceptDeclarer[]{
                InterceptDeclarer.build(MethodMatcher.nameEquals("handleRequest"), new Interceptor() {
                    TracingService tracingService = ServiceManager.getService(TracingService.class);

                    @Override
                    public ExecuteContext before(ExecuteContext context) {
                        TracingRequest request =
                                new TracingRequest(context.getRawCls().getName(), context.getMethod().getName());
                        ExtractService<HashMap<String, String>> extractService = (tracingRequest, carrier) -> {
                            tracingRequest.setTraceId(carrier.get(TracingHeader.TRACE_ID.getValue()));
                            tracingRequest.setParentSpanId(carrier.get(TracingHeader.PARENT_SPAN_ID.getValue()));
                            tracingRequest.setSpanIdPrefix(carrier.get(TracingHeader.SPAN_ID_PREFIX.getValue()));
                        };
                        Optional<SpanEvent> spanEventOptional = tracingService.onProviderSpanStart(request,
                                extractService, (HashMap<String, String>) context.getArguments()[0]);
                        if (spanEventOptional.isPresent()) {
                            SpanEvent spanEvent = spanEventOptional.get();
                            LOGGER.info("TraceId:" + spanEvent.getTraceId());
                            LOGGER.info("SpanId:" + spanEvent.getSpanId());
                            LOGGER.info("ParentSpanId:" + spanEvent.getParentSpanId());
                            LOGGER.info("Class:" + spanEvent.getClassName());
                            LOGGER.info("Method:" + spanEvent.getMethod());
                        }
                        tracingService.onSpanFinally();
                        return context;
                    }

                    @Override
                    public ExecuteContext after(ExecuteContext context) throws Exception {
                        return context;
                    }

                    @Override
                    public ExecuteContext onThrow(ExecuteContext context) throws Exception {
                        tracingService.onSpanError(context.getThrowable());
                        return context;
                    }
                })
        };
    }
}
```
> `SimulateServer`中`handleRequest`即为该分布式系统中，`SimulateServer`这一节点的服务提供者执行单元，所以这里使用TracingService::onProviderSpanStart来标记该单元，并且通过ExtractService定义了从通信载体中提取链路信息的能力。

2. 接着创建针对`SimulateServer`中`consume`的增强声明类`ConsumerDeclarer`，并在其中实现如下逻辑：

```java
public class ConsumerDeclarer extends AbstractPluginDeclarer {
    private static final java.util.logging.Logger LOGGER = LoggerFactory.getLogger();

    @Override
    public ClassMatcher getClassMatcher() {
        return ClassMatcher.nameEquals("com.huaweicloud.template.SimulateServer");
    }

    @Override
    public InterceptDeclarer[] getInterceptDeclarers(ClassLoader classLoader) {
        return new InterceptDeclarer[]{
                InterceptDeclarer.build(MethodMatcher.nameEquals("consume"), new Interceptor() {
                    TracingService tracingService = ServiceManager.getService(TracingService.class);

                    @Override
                    public ExecuteContext before(ExecuteContext context) throws Exception {
                        TracingRequest request =
                                new TracingRequest(context.getRawCls().getName(), context.getMethod().getName());
                        InjectService<HashMap<String, String>> injectService = (spanEvent, carrier) -> {
                            carrier.put(TracingHeader.TRACE_ID.getValue(), spanEvent.getTraceId());
                            carrier.put(TracingHeader.PARENT_SPAN_ID.getValue(), spanEvent.getSpanId());
                            carrier.put(TracingHeader.SPAN_ID_PREFIX.getValue(), spanEvent.getNextSpanIdPrefix());
                        };
                        Optional<SpanEvent> spanEventOptional = tracingService.onConsumerSpanStart(request,
                                injectService, (HashMap<String, String>) context.getArguments()[0]);
                        if (spanEventOptional.isPresent()) {
                            SpanEvent spanEvent = spanEventOptional.get();
                            LOGGER.info("TraceId:" + spanEvent.getTraceId());
                            LOGGER.info("SpanId:" + spanEvent.getSpanId());
                            LOGGER.info("ParentSpanId:" + spanEvent.getParentSpanId());
                            LOGGER.info("Class:" + spanEvent.getClassName());
                            LOGGER.info("Method:" + spanEvent.getMethod());
                        }
                        tracingService.onSpanFinally();
                        return context;
                    }

                    @Override
                    public ExecuteContext after(ExecuteContext context) throws Exception {
                        return context;
                    }

                    @Override
                    public ExecuteContext onThrow(ExecuteContext context) throws Exception {
                        tracingService.onSpanError(context.getThrowable());
                        return context;
                    }
                })
        };
    }
}
```

> `SimulateServer`中`consume`即为该分布式系统中，`SimulateServer`这一节点的服务消费者执行单元，所以这里使用TracingService::onConsumerSpanStart来标记该执行单元，并且通过InjectService定义了将链路上下文信息注入通信载体中的能力。

3. 创建针对`SimulateProvider`中`handleConsume`的增强声明类`HandleConsumerDeclarer`，并在其中实现如下逻辑：

```java
public class HandleConsumerDeclarer extends AbstractPluginDeclarer {
    private static final java.util.logging.Logger LOGGER = LoggerFactory.getLogger();

    @Override
    public ClassMatcher getClassMatcher() {
        return ClassMatcher.nameEquals("com.huaweicloud.template.SimulateProvider");
    }

    @Override
    public InterceptDeclarer[] getInterceptDeclarers(ClassLoader classLoader) {
        return new InterceptDeclarer[]{
                InterceptDeclarer.build(MethodMatcher.nameEquals("handleConsume"), new Interceptor() {
                    TracingService tracingService = ServiceManager.getService(TracingService.class);

                    @Override
                    public ExecuteContext before(ExecuteContext context) throws Exception {
                        TracingRequest request =
                                new TracingRequest(context.getRawCls().getName(), context.getMethod().getName());
                        ExtractService<HashMap<String, String>> extractService = (tracingRequest, carrier) -> {
                            tracingRequest.setTraceId(carrier.get(TracingHeader.TRACE_ID.getValue()));
                            tracingRequest.setParentSpanId(carrier.get(TracingHeader.PARENT_SPAN_ID.getValue()));
                            tracingRequest.setSpanIdPrefix(carrier.get(TracingHeader.SPAN_ID_PREFIX.getValue()));
                        };
                        Optional<SpanEvent> spanEventOptional = tracingService.onProviderSpanStart(request,
                                extractService, (HashMap<String, String>) context.getArguments()[0]);
                        if (spanEventOptional.isPresent()) {
                            SpanEvent spanEvent = spanEventOptional.get();
                            LOGGER.info("TraceId:" + spanEvent.getTraceId());
                            LOGGER.info("SpanId:" + spanEvent.getSpanId());
                            LOGGER.info("ParentSpanId:" + spanEvent.getParentSpanId());
                            LOGGER.info("Class:" + spanEvent.getClassName());
                            LOGGER.info("Method:" + spanEvent.getMethod());
                        }
                        tracingService.onSpanFinally();
                        return context;
                    }

                    @Override
                    public ExecuteContext after(ExecuteContext context) throws Exception {
                        return context;
                    }

                    @Override
                    public ExecuteContext onThrow(ExecuteContext context) throws Exception {
                        tracingService.onSpanError(context.getThrowable());
                        return context;
                    }
                })
        };
    }
}
```

> `SimulateProvider`中`handleConsume`即为该分布式系统中`SimulateServer`这一节点的服务提供者执行单元，所以这里使用TracingService::onProviderSpanStart来标记该执行单元，并且通过ExtractService定义了从通信载体中提取链路信息的能力。

4. 在`META-INF/services/io.sermant.core.plugin.agent.declarer.PluginDeclarer`SPI文件中添加上述增强声明类的类名

5. 开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**，
6. 执行完成后将文件`agent/config/config.properties`中的统一网关服务开关`agent.service.gateway.enable`和链路标记服务开关`agent.service.tracing.enable`均设置为`true`:
```properties
# 统一网关服务开关
agent.service.gateway.enable=true
# 链路标记服务开关
agent.service.tracing.enable=true
```
7. 最后修改在根目录执行 `cd agent/`，并在其中携带**Sermant**运行测试应用，执行如下命令 **java -javaagent:sermant-agent.jar -jar Application.jar**


```shell
$ java -javaagent:sermant-agent.jar -jar Application.jar
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading god library into BootstrapClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Building argument map by agent arguments.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading core library into SermantClassLoader.
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Loading sermant agent, artifact is: default
[xxxx-xx-xxTxx:xx:xx.xxx] [INFO] Load sermant done, artifact is: default
Good morning!
Good afternoon!
Good night!
```

在插件中定义的执行逻辑已被增强到测试应用中。接下来，查看程序运行时产生的日志：

1. 执行如下命令 `cd logs/sermant/core/app/${yyyy-mm-dd}/`进入运行日志存放目录，其中 `${yyyy-mm-dd}`指代运行时基于日期生成的目录名。
2. 打开日志文件`sermant-0.log`检查日志内容，可以在其中看到如下日志，通过该日志的`SpanId`和`ParentSpanId`可以还原该应用的链路关系：

```日志
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleRequestDeclarer$1] [before:47] [main] TraceId:715c69a5-0c94-423d-b2b8-b288c5fccdb3
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleRequestDeclarer$1] [before:48] [main] SpanId:0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleRequestDeclarer$1] [before:49] [main] ParentSpanId:null
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleRequestDeclarer$1] [before:50] [main] Class:com.huaweicloud.template.SimulateServer
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleRequestDeclarer$1] [before:51] [main] Method:handleRequest

xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.ConsumerDeclarer$1] [before:48] [main] TraceId:715c69a5-0c94-423d-b2b8-b288c5fccdb3
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.ConsumerDeclarer$1] [before:49] [main] SpanId:1
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.ConsumerDeclarer$1] [before:50] [main] ParentSpanId:0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.ConsumerDeclarer$1] [before:51] [main] Class:com.huaweicloud.template.SimulateServer
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.ConsumerDeclarer$1] [before:52] [main] Method:consume

xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleConsumerDeclarer$1] [before:47] [main] TraceId:715c69a5-0c94-423d-b2b8-b288c5fccdb3
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleConsumerDeclarer$1] [before:48] [main] SpanId:1-0-0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleConsumerDeclarer$1] [before:49] [main] ParentSpanId:1
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleConsumerDeclarer$1] [before:50] [main] Class:com.huaweicloud.template.SimulateProvider
xxxx-xx-xx xx:xx:xx.xxx [INFO] [io.sermant.template.HandleConsumerDeclarer$1] [before:51] [main] Method:handleConsume
```

> 根据日志中携带的链路标记信息可分析出以下结论
>
> - 三组数据的`TraceId`一致，代表这是同一条链路的链路数据。
> - `SimulateServer`中`handleRequest`为链路入口，因为其`ParentSpanId`为`null`。
> - `SimulateServer`中`consume`的`ParentSpanId`为`0`，可见其被`SimulateServer`中`handleRequest`所调用。
> - `SimulateProvider`中`handleConsume`的`ParentSpanId`为`1`，可见其被`SimulateServer`中`consume`所调用。
> - `SimulateProvider`中`handleConsume`的`SpanId`为`1-0-0`，相较于`ParentSpanId`多了两位可见其和`SimulateProvider`并非同进程。相差位的值为`0`，也可以推断出这是该链路中上游对其发起的第一次调用。
>
> 注：链路标记的生成规则可参考[规则](#规则)

由此可见，在分布式系统中针对各个执行单元进行链路标记，可以清晰的了解在分布式系统中各个执行单元之间的依赖关系，执行顺序等。

## API&配置

- **Sermant**封装了针对分布式系统中对各类执行单元链路标记操作，抽象为基础服务，使用时需获取其实例。

```java
TracingService tracingService = ServiceManager.getService(TracingService.class);
```

- 针对服务提供者执行单元的链路标记操作，分布式系统各个节点的入口，此处需要通过分布式系统中的通信载体提取当前链路的信上下文信息，如果无链路上下文信息，则当作新的链路进行标记。

```java
tracingService.onProviderSpanStart(TracingRequest tracingRequest, ExtractService<T> extractService, T carrier);
```

- 针对服务消费者执行单元的链路标记操作，分布式系统各个节点的出口，此处需要将链路数据的上下文信息放入分布式系统中的通信载体，保持链路的连续性。

```java
tracingService.onConsumerSpanStart(TracingRequest tracingRequest, InjectService<T> injectService, T carrier);
```

- 针对服务内部执行单元的链路标记操作，分布式系统各个节点的内部调用，只需要关注内部的调用顺序，无需和分布式系统中的通信载体交互。

```java
tracingService.onNormalSpanStart(TracingRequest tracingRequest);
```

- 针对各执行单元结束时的链路标记步操作各个单元结束时，需要使用该标记步骤。

```java
tracingService.onSpanFinally();
```

- 针对各执行单元异常的链路标记操作，各个单元执行遇到异常时，需要使用该标记步骤。

```java
tracingService.onSpanError(Throwable throwable);
```

### 函数式接口

在进行链路标记的过程中，需要从分布式系统通信载体中提取和注入链路上下文信息，这两种能力的具体实现，可通过下述两个函数式接口来定义：

- 从分布式系统通信载体中提取链路上下文信息需实现：

```java
@FunctionalInterface
public interface ExtractService<T> {
    /**
     * 跨进程链路追踪，需要将链路信息从协议载体中取出，
     */
    void getFromCarrier(TracingRequest tracingRequest, T carrier);
}
```

- 从分布式系统通信载体中注入链路上下文信息需实现：

```java
@FunctionalInterface
public interface InjectService<T> {
    /**
     * 跨进程链路追踪，需要将链路信息内容放入协议载体
     */
    void addToCarrier(SpanEvent spanEvent, T carrier);
}
```

### 规则

在链路标记的数据中，`SpanId`是一个很重要的数据，其表明了各个执行单元之间的执行顺序和父子逻辑，**Sermant**提供的链路标记的`SpanId`生成规则如下：

<MyImage src="/docs-img/span-rule.png"></MyImage>

其中A服务是链路的入口，`SpanId`为0，在这里会生成一条链路的`TraceId`。重点关注B服务和C服务的`SpanId`，最重要的是**后两位值**：

- B服务的后两位值0-0，其中第一位表示B服务是A服务的**第1次**调用，第二位表示该信息属于B服务中的第一个执行单元。
- C服务的后两位值1-0，其中第一位表示C服务是A服务的**第2次**调用，第二位表示该信息属于C服务中的第一个执行单元。

除分布式系统入口的执行单元的链路信息没有`ParentSpanId`，其他执行的单元链路信息皆有，者久可以清晰的知道他的上游执行单元是谁，通过这种关系，最终就可以串联出完整的链路信息。

通过上述描述，**Sermant**提供的`SpanId`生成规则应该很清晰了。

### 说明

针对链路上下文信息，在分布式系统中传递的上下文信息为`key:value`的形式，以下针对链路上下文信息的`key`做说明：

- `sermant-trace-id`，用于存放链路的`TraceId`，用于标识一条链路。

```java
TracingHeader.TRACE_ID.getValue()
```

- `sermant-parent-span-id`，用于存放当前`SpanId`传递给下游，告知下游其上游的`SpanId`值，用于串联上下游执行单元。

```java
TracingHeader.PARENT_SPAN_ID.getValue()
```

- `sermant-span-id-prefix`，用于存放下游定义自身`SpanId`的前缀，用于标识该下游是自己的第几个分支。

```java
TracingHeader.SPAN_ID_PREFIX.getValue()
```
