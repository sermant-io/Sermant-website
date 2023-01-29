# 链路功能

本文档介绍Sermant插件如何使用链路功能。

**链路功能**是一个继消息发送能力建立的一个上层功能，该功能简单来说就是从宿主端的调用链之间嵌入以下逻辑：

- 在发送数据的时候，在数据包中插入链路所需的`TraceId`和`SpanId`，前者是请求在分布式系统中的整个链路视图，后者代表整个链路中不同服务内部的视图。
- 在接收数据的时候，解析数据包中嵌入的链路相关内容，形成链路的一环提交到后台服务器中，逐渐形成调用链。

如需跨进程形成完整调用链，需要在生产者处理外部请求的方法和消费者向外部发起请求的方法中进行链路上下文数据的提取和注入：
- 对于生产者处理外部请求的方法，做如下增强：
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
      tracingService.onProviderSpanStart(request, extractService, (HashMap<String, String>)context.getArguments()[0]);
      return context;
  }

  @Override
  public ExecuteContext after(ExecuteContext context) throws Exception {
      tracingService.onSpanFinally();
      return context;
  }

  @Override
  public ExecuteContext onThrow(ExecuteContext context) throws Exception {
      tracingService.onSpanError(context.getThrowable());
      return context;
  }
```
- 对于消费者请求外部的方法，做如下增强：
```java
  TracingService tracingService = ServiceManager.getService(TracingService.class);

  @Override
  public ExecuteContext before(ExecuteContext context) throws Exception {
      return context;
  }

  @Override
  public ExecuteContext after(ExecuteContext context) throws Exception {
      TracingRequest request =
          new TracingRequest(context.getRawCls().getName(), context.getMethod().getName());
      InjectService<HashMap<String, String>> injectService = (spanEvent, carrier) -> {
          carrier.put(TracingHeader.TRACE_ID.getValue(), spanEvent.getTraceId());
          carrier.put(TracingHeader.PARENT_SPAN_ID.getValue(), spanEvent.getSpanId());
          carrier.put(TracingHeader.SPAN_ID_PREFIX.getValue(), spanEvent.getNextSpanIdPrefix());
      };
      tracingService.onConsumerSpanStart(request, injectService, (HashMap<String, String>)context.getResult());
      tracingService.onSpanFinally();
      return context;
  }

  @Override
  public ExecuteContext onThrow(ExecuteContext context) throws Exception {
      tracingService.onSpanError(context.getThrowable());
      return context;
  }
```