# HTTP Server服务

本文介绍如何在 Sermant 插件中实现HTTP API的开发。

## 功能介绍
Sermant 提供了内置的 HTTP Server 功能，允许开发者在插件中通过简单的配置和实现相关接口，快速搭建起可以对外提供 HTTP 接口的服务。此功能使得外部系统可以访问这些接口，实现数据的交互和处理。HTTP Server 支持常见的 HTTP 方法，如 GET、POST、PUT、DELETE 等，使得开发者能够根据不同的业务需求，灵活地设计和实现功能，比如实现健康检查接口、监控指标、服务状态切换等功能。

## 开发示例
以下是一个开发示例，展示了如何在 Sermant 框架中利用 HTTP Server 功能，在插件中开发一个 HTTP API：
1. 实现 `HttpRouteHandler` 接口，并在实现类上添加 `@HttpRouteMapping` 注解来指定路由信息。以下是一个具体的示例：
```java
@HttpRouteMapping(path = "/health", method = HttpMethod.GET)
public class HealthHttpRouteHandler implements HttpRouteHandler {
    private static final int SUCCESS_CODE = 200;

    @Override
    public void handle(HttpRequest request, HttpResponse response) throws Exception {
        // 设置响应状态码
        response.setStatus(SUCCESS_CODE)
                // 设置响应内容类型
                .setContentType("application/json;charset=utf-8")
                // 写入响应体
                .writeBody("{}");
    }
}
```
在此示例中，我们创建了一个 `HealthHttpRouteHandler` 类，并通过 `@HttpRouteMapping` 注解映射到 `/{package.plugin.name}/health` 路径，仅接受 GET 方法。在 `handle` 方法中，设置了响应的状态码、内容类型和响应体。

2. 开启 HTTP 服务，在`agent/config/config.properties`文件中设置开启HTTP服务，配置如下：
   ```
   # HTTP server switch
   agent.service.httpserver.enable=true
   ```

3. 通过以下 URL 可以访问 API：`http://localhost:47128/{package.plugin.name}/health`
> 注意：`{package.plugin.name}` 是当前 HTTP API 所在插件的名称，例如在插件 `service-router` 插件中新增一个健康检查 HTTP API，则最终的请求路径为：`http://localhost:47128/service-router/health`

## API & 配置

### API
`HttpRequest` 接口提供了丰富的方法来获取请求的详细信息，包括请求的 URI、路径、方法、内容类型、IP 地址、请求头、查询参数和请求体。以下是 `HttpRequest` 接口的一些关键方法：
- `getUri()`: 获取请求的 URI 对象。
- `getPath()`: 获取解析后的请求路径。
- `getMethod()`: 获取 HTTP 方法。
- `getContentType()`: 获取请求的内容类型。
- `getIp()`: 获取请求的 IP 地址。
- `getFirstHeader(String name)`: 获取指定名称的请求头的第一个值。
- `getParams()`: 获取所有查询参数。
- `getBody()`: 获取请求体内容。
- ...

`HttpResponse` 接口则用于构建和发送 HTTP 响应，提供了设置状态码、响应头、内容类型和写入响应体的方法：
- `setStatus(int status)`: 设置响应状态码。
- `addHeader(String name, String value)`: 添加响应头。
- `setContentType(String contentType)`: 设置响应内容类型。
- `writeBody(String str)`: 写入字符串作为响应体。
- ...

### 配置
Sermant 的 HTTP Server 功能可以通过以下配置项进行配置：
- `agent.service.httpserver.enable`: HTTP Server 开关，默认关闭；
- `httpserver.type`: 指定 HTTP Server 的类型，默认为 `simple`，使用 JDK 内置的 HTTP Server；
- `httpserver.port`: 指定 HTTP Server 监听的端口号，默认为 `47128`；
- `httpserver.serverCorePoolSize`: 指定 HTTP Server 线程池的核心线程数，默认为当前 CPU 的核数；
- `httpserver.serverMaxPoolSize`: 指定 HTTP Server 线程池的最大线程数，默认为当前 CPU 的核数。
  以下是一个配置示例：
```properties
# HTTP 服务开关
agent.service.httpserver.enable=true
# 使用 JDK 内置的 Http Server
httpserver.type=simple
# 监听端口
httpserver.port=8080
# 线程池核心线程数
httpserver.serverCorePoolSize=10
# 线程池最大线程数
httpserver.serverMaxPoolSize=20
```
