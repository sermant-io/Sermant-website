
# Graceful Online/Offline
## What is graceful on and off line
Imagine a scenario A. There is a consumer (client) and two service providers (servers) running in the system, and consumers can call the service providers in load balancing. Suppose a service provider needs rolling upgrades due to business updates or other scenarios. If there is a large amount of concurrent traffic at this time, the following problems will occur:

- A large number of TCP connections are upgraded and offline due to the service provider, resulting in a large number of request errors.
- Due to the problem of delayed registry refresh of consumers (clients), subsequent traffic will still be allocated to providers that have been offline, resulting in a large number of request errors.

The above is a typical "inelegant" scene.

Therefore, in order to avoid such problems, graceful online and offline services came into being, mainly to provide protection for services such as restarting, going online, and going offline.

## Service operation and maintenance FAQ
(1) The service itself has a large number of lazy loading mechanisms (such as load balancing initialization). When the service is just online, due to the influx of concurrent traffic requests, a large number of requests are lazy loaded at the same time, so that the request response is slow, the thread is blocked, and even eventually causes the service to crash.

(2) The service cannot be offline gracefully. Just like the scenario A mentioned above, the server is offline and the client service cannot sense it in time, which causes traffic to flow into the offline instance and loses a lot of traffic.

## What kind of capabilities does graceful online and offline provide?
(1) Server warm-up capability

The server-side warm-up is implemented based on the client. When the traffic enters, the Sermant Agent will dynamically adjust the traffic and dynamically allocate the traffic according to the warm-up configuration of the service. Instances with service warm-up turned on will be allocated less traffic at first launch relative to other launched instances, and the traffic will increase over time in a curvilinear fashion until it is nearly equal to the other instances. The purpose is to initialize the service instance with less traffic to prevent the service from crashing.

(2) Graceful offline ability

Elegant offline combined with server and client implementation, the main implementation points are as follows：

**Anti-registration**

<MyImage src="/docs-img/anti-registration.png"></MyImage>

When the server is required to go offline, the Sermant Agent will dynamically perform the anti-registration operation according to the current registry and refresh the registry in time. However, even if the registry has been refreshed, the upstream consumer cannot sense it in time due to the cache problem, thus introducing offline Notice.

**Offline notification**

<MyImage src="/docs-img/offline-notification.png"></MyImage>

After de-registration, the Sermant Agent will notify all upstreams by means of interface notification and response notification, and actively refresh the provider instance cache synchronously.

**Blacklist**

<MyImage src="/docs-img/blacklist.png"></MyImage>

A blacklist mechanism is introduced to ensure that traffic will no longer call offline instances. After the client receives the offline notification, it automatically pulls the offline instance into the blacklist. When performing traffic distribution, it automatically filters the blacklisted (disconnected) instances, and no longer calls the offline instance.

Note: The blacklist adopts a timing refresh mechanism, the default is 2 minutes, that is, for the same IP instance, after marking it offline, it can be rediscovered after waiting for 2 minutes.

**Traffic Statistics**

In order to ensure that the current request has been fully processed, when the service goes offline, the Sermant Agent will try to wait for 30s (configurable), regularly count and judge whether the current instance request has been processed, and finally go offline after the processing is completed.