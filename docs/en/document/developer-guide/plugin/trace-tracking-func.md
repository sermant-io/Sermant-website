# Trace Tracking

This document describes how the Sermant plugin uses the Trace Tracking.

The **Trace Tracking** is an upper layer function established by message sending capability, which simply means embedding the following logic between the invoke chains of the host side:

- When sending data, the `TraceId` and `SpanId` required by the trace are inserted in the data packet. The former is the view of the whole trace in the distributed system, and the later represents the view inside the different services in the whole trace.
- When receiving data, it parses the trace-related content embedded in the data packet, forms a trace and submits it to the backend server, and gradually forms a invoke chain.

To form a complete call chain across processes, link context data needs to be extracted and injected in the producer's method of processing external requests and the consumer's method of initiating requests to the external:

- Enhancements to the way producers handle external requests are as follows:
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
- For the consumer request external method, make the following enhancements:
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