# Link Function

This document describes how the Sermant plug-in uses the link functionality.

## Function Introduction

In order to meet the high concurrency requirements of the system, the software architecture is becoming more and more complex, and more and more components in the system are becoming distributed. For example, the monolithic architecture is split into microservices, the in-service caches are changed into distributed caches, and the service component communication is changed into distributed messages. Therefore, it is particularly important to mark each execution unit in the traffic link of the distributed system. Through the link labeling, the dependence relationship and execution order between each execution unit in the distributed system traffic link can be obtained, which can be used in many scenarios such as distributed link tracing, link performance analysis, and fault location of distributed system.


**Sermant** provides the ability to tag a link in a distributed system. Developers only need to select the right execution unit to tag and specify how the link context information is passed along the link.

## Developing Examples

This development example is based on the project created in the [Create your first plugin](README.md) document, which simulates a service call process and uses a `HashMap` to simulate the communication carrier:

<MyImage src="/docs-img/simulate-tracing.png"></MyImage>

`SimulateServer` simulates a WEB server, where `handleRequest` simulates the logic for handling requests, and `consume` is used to invoke downstream services.

`SimulateProvider` simulates the downstream service of the WEB server, where `handleConsume` is used to handle calls from `SimulateServer`.

In order to mark the link completely, it is necessary to mark the key execution units in the distributed system. In this example, two types are mainly involved:

- Link marking of the service provider execution unit: the entry point of each node of the distributed system, where the context information of the current link needs to be extracted through the communication carrier in the distributed system. If there is no link context information, it is marked as a new link.

- Link marking of the service consumer execution unit: the exit of each node of the distributed system, here it is necessary to put the tag of the link data into the communication carrier of the distributed system to maintain the continuity of the link.

Based on the above basis, we mark the links for the service invocation process in the project:

1. create an enhanced declaration class `HandleRequestDeclarer` for `handleRequest` in `SimulateServer` under the project `template\template-plugin`, and implement the following logic in it:

> Note: The interceptor is created by referring to [Create your first plugin](README.md), so we won't repeat it in this development example

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
> The `handleRequest` in the `SimulateServer` is the service provider execution unit of the `SimulateServer` node in the distributed system. So here use TracingService: : onProviderSpanStart to mark the unit, and through ExtractService defines the ability to link information extracted from communication carrier.

2. create an enhanced declaration class `ConsumerDeclarer` for `consume` in `SimulateServer`, and implement the following logic in it:

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
> `SimulateServer` in `consume` for the distributed system, namely `SimulateServer` the node execution unit service consumers, so here use TracingService: : onConsumerSpanStart to mark the execution unit, And InjectService defines the ability to inject link context information into the communication carrier.

3. create an enhanced declaration class `HandleConsumerDeclarer` for `handleConsume` in `SimulateProvider`, and implement the following logic in it:


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

> `handleConsume` in `SimulateProvider` is the service provider execution unit of the `SimulateServer` node in the distributed system. So here use TracingService: : onProviderSpanStart to mark the execution unit, and through ExtractService defines the ability to link information extracted from communication carrier.

4. Add the class name of the above enhanced declaration class to the `META-INF/services/com.huaweicloud.sermant.core.plugin.agent.declarer.PluginDeclarer` SPI file

5. Once the development is complete, follow the [Packaged build](README.md#Packaged-build) process used to create the 
first plugin, run **mvn package** in the root directory of the project.
6. Set both the unified Gateway service switch `agent.service.gateway.enable` and the link marking service switch `agent.service.tracing.enable` to `true` in file `agent/config/config.properties` after execution:
```properties
# Gateway Service switch
agent.service.gateway.enable=true
# Tracing Service switch
agent.service.tracing.enable=true
```

7. run `cd agent/` in it with **Sermant** to run 
   the test app. Run **java -javaagent:sermant-agent.jar -jar Application.jar**

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

The execution logic defined in the plug-in has been enhanced into the test application. Next, take a look at the logs generated while the program is running:

1. Enter the log directory by running `cd logs/sermant/core/app/${yyyy-mm-dd}/`, where `${yyyy-mm-dd}` refers to the directory name generated by the runtime based on the date.

2. Open the log file `sermant-0.log` and check the log contents. You can see the following log, from which the `SpanId` and `ParentSpanId` can be used to restore the link relationship of the app:

```日志
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleRequestDeclarer$1] [before:47] [main] TraceId:715c69a5-0c94-423d-b2b8-b288c5fccdb3
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleRequestDeclarer$1] [before:48] [main] SpanId:0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleRequestDeclarer$1] [before:49] [main] ParentSpanId:null
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleRequestDeclarer$1] [before:50] [main] Class:com.huaweicloud.template.SimulateServer
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleRequestDeclarer$1] [before:51] [main] Method:handleRequest

xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.ConsumerDeclarer$1] [before:48] [main] TraceId:715c69a5-0c94-423d-b2b8-b288c5fccdb3
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.ConsumerDeclarer$1] [before:49] [main] SpanId:1
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.ConsumerDeclarer$1] [before:50] [main] ParentSpanId:0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.ConsumerDeclarer$1] [before:51] [main] Class:com.huaweicloud.template.SimulateServer
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.ConsumerDeclarer$1] [before:52] [main] Method:consume

xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleConsumerDeclarer$1] [before:47] [main] TraceId:715c69a5-0c94-423d-b2b8-b288c5fccdb3
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleConsumerDeclarer$1] [before:48] [main] SpanId:1-0-0
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleConsumerDeclarer$1] [before:49] [main] ParentSpanId:1
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleConsumerDeclarer$1] [before:50] [main] Class:com.huaweicloud.template.SimulateProvider
xxxx-xx-xx xx:xx:xx.xxx [INFO] [com.huaweicloud.sermant.template.HandleConsumerDeclarer$1] [before:51] [main] Method:handleConsume
```

> According to the link marking information carried in the log, the following conclusions can be analyzed
>
> -  All three sets of data have the same `TraceId`, meaning they are link data for the same link.
> - In `SimulateServer`, `handleRequest` is the link entry because its `ParentSpanId ` is `null`.
> - The `ParentSpanId` of `consume` in `SimulateServer` is `0`, so it is called by `handleRequest` in `SimulateServer`.
> - The `ParentSpanId` of `handleConsume` in `SimulateProvider` is `1`, so it is called by `consume` in `SimulateServer`.
> - The `SpanId` of `handleConsume` in `SimulateProvider` is `1-0-0`, which is two more than `ParentSpanId` so it is not the same process as `SimulateProvider`. The value of the phase difference is `0`, which can also be inferred that this is the first upstream call on this link.
>
> Note: Link marker generation rules can be found in [Rules](#Rules)

It can be seen that the link marking for each execution unit in the distributed system can clearly understand the dependency relationship and execution order between each execution unit in the distributed system.

## API & Configuration

- **Sermant** encapsulates link marking operations for various types of execution units in a distributed system. It is abstracted as a basic service, and it needs to obtain instances when using it.

```java
TracingService tracingService = ServiceManager.getService(TracingService.class);
```

- For the link marking operation of the service provider execution unit, the entry of each node in the distributed system, the current link context information needs to be extracted through the communication carrier in the distributed system. If there is no link context information, it will be marked as a new link.

```java
tracingService.onProviderSpanStart(TracingRequest tracingRequest, ExtractService<T> extractService, T carrier);
```

- The service consumer executes the link marking operation of the unit and the exit of each node of the distributed system. Here, the context information of the link data needs to be put into the communication carrier of the distributed system to maintain the continuity of the link.

```java
tracingService.onConsumerSpanStart(TracingRequest tracingRequest, InjectService<T> injectService, T carrier);
```

- For the link marking operation of the internal execution unit of the service, the internal call of each node in the distributed system only needs to pay attention to the internal call order, without interacting with the communication carrier in the distributed system.

```java
tracingService.onNormalSpanStart(TracingRequest tracingRequest);
```

- This marking step is required to operate the end of each unit against the link marking step at the end of each execution unit.

```java
tracingService.onSpanFinally();
```

- The link marking operation for the exception of each execution unit. When each execution unit encounters an exception, it needs to use this marking step.

```java
tracingService.onSpanError(Throwable throwable);
```

### Functional Interface

Link labeling requires the ability to extract and inject link context information from the communication carrier of the distributed system. The following two functional interfaces are used to implement these capabilities:

- Extracting link context information from the communication carrier of a distributed system needs to implement:

```java
@FunctionalInterface
public interface ExtractService<T> {
    /**
     * Cross-process link tracking requires extracting the link information from the protocol carrier
     */
    void getFromCarrier(TracingRequest tracingRequest, T carrier);
}
```

- To inject link context information from the communication carrier of a distributed system, implement:

```java
@FunctionalInterface
public interface InjectService<T> {
    /**
     * Link tracing across processes needs to put the content of link information into the protocol carrier
     */
    void addToCarrier(SpanEvent spanEvent, T carrier);
}
```

### Rules

The `SpanId` is a very important data in the link tag data, which indicates the execution order between each execution unit and the parent-child logic. The `SpanId` of the link tag provided by **Sermant** is as follows:

<MyImage src="/docs-img/span-rule.png"></MyImage>

Service A is the entry point of the link with a `SpanId` of 0, where a `TraceId` of the link is generated. Focusing on the `SpanId` of service B and service C, the most important thing is the **last two values** :

- The last two bits of service B are 0-0, where the first one indicates that service B was the **first** invocation of service A, and the second one indicates that this information belongs to the first execution unit in service B.

- The last two bits of the C service are 1-0, where the first one indicates that the C service is the **second** invocation of the A service, and the second one indicates that the information belongs to the first execution unit in the C service.

Except for the link information of the execution unit at the entrance of the distributed system, which does not have `ParentSpanId`, the link information of other execution units is available, and the user can clearly know who his upstream execution unit is. Through this relationship, the complete link information can be connected in series eventually.

With the above description, the `SpanId` generation rules provided by **Sermant** should be clear.

### Notes

For the link context information, the context information passed in the distributed system is in the form of `key:value`. The following is explained for the `key` of the link context information:

- `sermant-trace-id`, which holds the link's `TraceId` to identify a link.

```java
TracingHeader.TRACE_ID.getValue()
```
- `sermant-parent-span-id`, which holds the current `SpanId` to pass downstream to inform the downstream of its `SpanId` value, which is used to concatenate upstream and downstream execution units.

```java
TracingHeader.PARENT_SPAN_ID.getValue()
```

- `sermant-span-id-prefix`, which holds the prefix that defines its own `SpanId`, which identifies its own spanid.

```java
TracingHeader.SPAN_ID_PREFIX.getValue()
```
