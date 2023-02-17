# 链路功能

本文档介绍Sermant插件如何使用链路功能。

## 功能介绍

分布式链路追踪就是将一次分布式请求还原成调用链路，将一次分布式请求的调用情况集中展示，用于分布式系统的链路分析及链路性能状态可视化。

其原理简单理解为，在分布式系统中，对一条链路中的各个单元进行标记，其中通过`TraceId`来标识一条链路，`SpanId`来标识在分布式系统中的各个执行单元，通过`ParentSpanId`来标识各个执行单元的上游执行单元，并将这些执行单元的上下文信息通过分布式系统中的通信载体在链路中传递，最终通过这些相互关联的标记串联成一条完整的链路。

**Sermant**已提供分布式链路追踪能力开发的基础能力，针对分布式链路追踪各执行单元中进行标记的步骤已进行封装，开发者在开发时只需要正确的选择正确的执行单元进行标记，并指定执行单元上下文信息在链路中的传递方式即可。

## 开发示例

本开发示例基于[创建首个插件](README.md)文档中创建的工程，在该工程中模拟了一个简单调用链，并使用`HashMap`来模拟通信载体：

<MyImage src="/docs-img/simulate-tracing.png"></MyImage>

`SimulateServer`模拟WEB服务器，其中`handleRequest`模拟处理请求的逻辑，`consume`用于调用下游服务。

`SimulateProvider`模拟WEB服务器的下游服务，其中`handleConsume`用于处理来自`SimulateServer`的调用。

基于分布式链路追踪的原理，**Sermant**对分布式链路追踪开发中需要执行动作的各个执行单元的标记步骤进行封装，本示例中主要用到两种：

- 针对服务提供者执行单元的标记步骤：分布式系统各个节点的入口，此处需要通过分布式系统中的通信载体提取当前链路的信息，如果无链路信息，则需创建新的链路。
- 针对服务消费执行单元的标记步骤：分布式系统各个节点的出口，此处需要将链路数据的标记放入分布式系统中的通信载体，保持链路的连续性。

基于以上基础，我们针对工程中的调用链来做一次分布式链路追踪：

首先在工程中`template\template-plugin`下创建针对`SimulateServer`中`handleRequest`的[拦截器](bytecode-enhancement.md#拦截器)，并在其中实现如下逻辑：

> 注：拦截器的创建方法参考[创建首个插件](README.md)，本开发示例不再赘述

```java
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
    Optional<SpanEvent> spanEventOptional = tracingService.onProviderSpanStart(request, extractService, (HashMap<String, String>) context.getArguments()[0]);
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
```
> 按照上文所讲分布式链路追踪的原理，`SimulateServer`中`handleRequest`即为该分布式系统中，`SimulateServer`这一节点的入口方法，属于服务提供者执行单元，所以这里使用TracingService::onProviderSpanStart来标记该单元，并且通过ExtractService定义了从通信载体中提取链路信息的能力。

接着创建针对`SimulateServer`中`consume`的[拦截器](bytecode-enhancement.md#拦截器)，并在其中实现如下逻辑：

```java
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
    Optional<SpanEvent> spanEventOptional = tracingService.onConsumerSpanStart(request, injectService, (HashMap<String, String>) context.getArguments()[0]);
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
```

> 按照上文所讲分布式链路追踪的原理，`SimulateServer`中`consume`即为该分布式系统中，`SimulateServer`这一节点的出口方法，属于服务消费者执行单元，所以这里使用TracingService::onConsumerSpanStart来标记该执行单元，并且通过InjectService定义了将链路信息注入通信载体中的能力。

创建针对`SimulateProvider`中`handleConsume`的[拦截器](bytecode-enhancement.md#拦截器)，并在其中实现如下逻辑：

```java
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
    Optional<SpanEvent> spanEventOptional = tracingService.onProviderSpanStart(request, extractService, (HashMap<String, String>) context.getArguments()[0]);
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
```

> 按照上文所讲分布式链路追踪的原理，`SimulateProvider`中`handleConsume`即为该分布式系统中`SimulateServer`这一节点的入口方法，属于服务提供者执行单元，所以这里使用TracingService::onProviderSpanStart来标记该执行单元，并且通过ExtractService定义了从通信载体中提取链路信息的能力。

开发完成后，可参照创建首个插件时的[打包构建](README.md#打包构建)流程，在工程根目录下执行 **mvn package**，执行完成后在根目录执行 `cd agent/`，并在其中携带**Sermant**运行测试应用，执行如下命令 **java -javaagent:sermant-agent.jar -jar Application.jar**


```shell
$ java -javaagent:sermant-agent.jar -jar Application.jar
[INFO] Loading core library... 
[INFO] Building argument map... 
[INFO] Loading sermant agent... 
[INFO] Load sermant done. 
Good morning!
Good afternoon!
Good night!
```

在插件中定义的执行逻辑已被增强到测试应用中。接下来，查看程序运行时产生的日志：

1. 执行如下命令 `cd logs/sermant/core/app/${yyyy-mm-dd}/`进入运行日志存放目录，其中 `${yyyy-mm-dd}`指代运行时基于日期生成的目录名。
2. 打开日志文件`sermant-0.log`检查日志内容，可以在其中看到如下日志，通过该日志的`SpanId`和`ParentSpanId`可以还原该应用的链路关系：

```日志
[TemplateTracingDeclarer.java] [before:55] [main] TraceId:137232c4-ce6e-4161-b44d-88cd819145e5
[TemplateTracingDeclarer.java] [before:55] [main] SpanId:0
[TemplateTracingDeclarer.java] [before:56] [main] ParentSpanId:null
[TemplateTracingDeclarer.java] [before:57] [main] Class:com.huaweicloud.template.SimulateServer
[TemplateTracingDeclarer.java] [before:58] [main] Method:handleRequest

[TemplateTracingDeclarer.java] [before:88] [main] TraceId:137232c4-ce6e-4161-b44d-88cd819145e5
[TemplateTracingDeclarer.java] [before:89] [main] SpanId:1
[TemplateTracingDeclarer.java] [before:90] [main] ParentSpanId:0
[TemplateTracingDeclarer.java] [before:91] [main] Class:com.huaweicloud.template.SimulateServer
[TemplateTracingDeclarer.java] [before:92] [main] Method:consume

[TemplateTracingDeclarer.java] [before:122] [main] TraceId:137232c4-ce6e-4161-b44d-88cd819145e5
[TemplateTracingDeclarer.java] [before:123] [main] SpanId:1-0-0
[TemplateTracingDeclarer.java] [before:124] [main] ParentSpanId:1
[TemplateTracingDeclarer.java] [before:125] [main] Class:com.huaweicloud.template.SimulateProvider
[TemplateTracingDeclarer.java] [before:126] [main] Method:handleConsume
```

> - 三组数据的`TraceId`一致，代表这是同一条链路的链路数据。
> - `SimulateServer`中`handleRequest`为链路入口，因为其`ParentSpanId`为`null`。
> - `SimulateServer`中`consume`的`ParentSpanId`为`0`，可见其被`SimulateServer`中`handleRequest`所调用。
> - `SimulateProvider`中`handleConsume`的`ParentSpanId`为`1`，可见其被`SimulateServer`中`consume`所调用。
> - `SimulateProvider`中`handleConsume`的`SpanId`为`1-0-0`，相较于`ParentSpanId`多了两位可见其和`SimulateProvider`并非同进程。相差位的值为`0`，也可以推断出这是该链路中上游对其发起的第一次调用。
>
> 注：链路信息的生成规则可参考[规则](#规则)

## API&配置

- **Sermant**针对分布式链路追踪中所涉及的各个生命周期进行了封装，抽象为基础服务，使用时需获取其实例。

```java
TracingService tracingService = ServiceManager.getService(TracingService.class);
```

- 针对服务提供者执行单元的标记步骤，分布式系统各个节点的入口，此处需要通过分布式系统中的通信载体提取当前链路的信息，如果无链路信息，则需创建新的链路。

```java
tracingService.onProviderSpanStart(TracingRequest tracingRequest, ExtractService<T> extractService, T carrier);
```

- 针对服务消费者执行单元的标记步骤，分布式系统各个节点的出口，此处需要将链路数据的标记放入分布式系统中的通信载体，保持链路的连续性。

```java
tracingService.onConsumerSpanStart(TracingRequest tracingRequest, InjectService<T> injectService, T carrier);
```

- 针对服务内部执行单元的标记步骤，分布式系统各个节点的内部调用，只需要关注内部的调用顺序，无需和分布式系统中的通信载体交互。

```java
tracingService.onNormalSpanStart(TracingRequest tracingRequest);
```

- 针对各执行单元结束时的标记步骤，各个单元结束时，需要使用该标记步骤。

```java
tracingService.onSpanFinally();
```

- 针对各执行单元异常的标记步骤，各个单元执行遇到异常时，需要使用该标记步骤。

```java
tracingService.onSpanError(Throwable throwable);
```

### 函数式接口

在开发分布式链路追踪能力的过程中，需要从分布式系统通信载体中提取和注入链路信息，执行分布式链路追踪的各个生命周期时需要定义提取和注入的能力，可通过下述两个函数式接口来定义：

- 从分布式系统通信载体中提取链路信息需实现：

```java
@FunctionalInterface
public interface ExtractService<T> {
    /**
     * 跨进程链路追踪，需要将链路信息从协议载体中取出，
     */
    void getFromCarrier(TracingRequest tracingRequest, T carrier);
}
```

- 从分布式系统通信载体中注入链路信息需实现：

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

在分布式链路追踪的数据中，`SpanId`是一个很重要的数据，其表明了各个执行单元之间的执行顺序和父子逻辑，**Sermant**提供的分布式链路追踪的`SpanId`生成规则如下：

<MyImage src="/docs-img/span-rule.png"></MyImage>

其中A服务是链路的入口，`SpanId`为0，在这里会生成一条链路的`TraceId`。重点关注B服务和C服务的`SpanId`，最重要的是**后两位值**：

- B服务的后两位值0-0，其中第一位表示B服务是A服务的**第1次**调用，第二位表示该信息属于B服务中的第一个执行单元。
- C服务的后两位值1-0，其中第一位表示C服务是A服务的**第2次**调用，第二位表示该信息属于C服务中的第一个执行单元。

除分布式系统入口的执行单元的链路信息没有`ParentSpanId`，其他执行的单元链路信息皆有，者久可以清晰的知道他的上游执行单元是谁，通过这种关系，最终就可以串联出完整的链路信息。

通过上述描述，**Sermant**提供的分布式链路追踪的`SpanId`生成规则应该很清晰了。

### 说明

针对分布式链路追踪能力，在分布式系统中传递中链路的上下文信息的传递为`key:value`的形式，以下针对链路上下文信息的`key`做说明：

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
