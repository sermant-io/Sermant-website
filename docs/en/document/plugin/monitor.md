# Monitoring
This article describes how to use the [Monitoring plug-in](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-monitor)。

## Function introduction

The monitoring plug-in is used to monitor the usage of CPU, memory, disk IO, network IO and other hardware resources of the server where the host application is located. The usage of JVM resources, such as heap memory usage, non-heap memory usage, cache usage, throughput (QPS, TPS, average response time). The monitoring plug-in relies on Prometheus for indicator collection. Prometheus will periodically pull the indicator data collected by the monitoring plug-in.

## Parameter configuration

### Plug-in configuration

The monitoring plug-in needs to be configured with monitoring enable switch (`monitor.config.enableStartService`), IP address/domain name of the host application's environment (`monitor.config.address`), the port of the host service (`monitor.config.port`) and the reporting method (`monitor.config.reportType`). The configuration file of the plug-in can be found in the path `${sermant-agent-x.x.x}/agent/pluginPackage/monitor/config/config.yaml`. The configuration is as follows:

```yaml
monitor.config:                     # Monitoring plug-in configuration.
    enableStartService: false       # Monitoring plug-in start switch. When it is true, the indicator is collected.
    address: 127.0.0.1              # IP address/domain name of the host application's environment. Used when creating a server instance. Prometheus obtains the indicator information collected by the plug-in by calling the created server instance.
    port: 12345                     # Provides the port information of Http service externally. Used when creating a server instance. Prometheus obtains the indicator information collected by the plug-in by calling the created server instance.
    reportType: PROMETHEUS          # Monitoring indicator reporting method. Currently only PROMETHEUS is supported.
    userName:                       # Authorization information -- authorization username. After the authorization information is configured, prometheus also needs to configure the authorization information to obtain the indicator normally to prevent malicious requests to obtain the indicator information.
    password:                       # Authorization information -- authorized user password -- AES encryption ciphertext. After configuring the authorization information, prometheus also needs to configure the authorization information to obtain the indicator to prevent malicious requests to obtain the indicator information.
    key:                            # KEY used for password encryption of authorized users.
```

| Parameter key                     | Description                                                              | Default value | Required |
|-----------------------------------|--------------------------------------------------------------------------|---------------|----------|
| monitor.config.enableStartService | Monitoring plug-in start switch                                          | false         | Yes      |
| monitor.config.address            | IP address/domain name of the host application's environment             | 127.0.0.1     | Yes      |
| monitor.config.port               | Port information for external Http service                               | 12345         | Yes      |
| monitor.config.reportType         | Monitoring indicator reporting method currently only supports PROMETHEUS | PROMETHEUS    | Yes      |
| monitor.config.userName           | authorization information -- authorization user name                     | null          | No       |
| monitor.config.password           | authorization information -- authorized user password -- AES encryption  | null          | No       |
| monitor.config.key                | KEY used for password encryption of authorized users                     | Empty         | No       |

## Detailed governance rules

The indicator data that the monitoring plug-in can collect at present is shown in the following table (after docking with prometheus, users can query the specific indicator information in prometheus through the indicator name, see [Verification](#verification)):

| Indicator name                   | Description                                                                | Indicator type |
|:---------------------------------|:---------------------------------------------------------------------------|:---------------|
| cpu_user                         | proportion of user time                                                    | CPU            |
| cpu_sys                          | System time share                                                          | CPU            |
| cpu_wait                         | Percentage of waiting time                                                 | CPU            |
| cpu_idle                         | idle time ratio                                                            | CPU            |
| cpu_cores                        | CPU physical cores                                                         | CPU            |
| memory_total                     | Total memory size                                                          | memory         |
| memory_swap                      | Size of swap space for cache memory                                        | memory         |
| memory_cached                    | Total physical memory of cache memory                                      | memory         |
| memory_buffer                    | Make a buffer size for the file                                            | memory         |
| memory_used                      | Used memory size                                                           | memory         |
| disk_readBytesPerSec             | Number of bytes read by the disk per second during the collection cycle    | Disk IO        |
| disk_writeBytesPerSec            | Number of bytes written on the disk per second during the collection cycle | Disk IO        |
| disk_ioSpentPercentage           | Percentage of time spent on disk IO during the acquisition cycle           | Disk IO        |
| network_readBytesPerSec          | Number of bytes read by the network per second during the collection cycle | Network        |
| network_writeBytesPerSec         | Number of bytes read by the network per second during the collection cycle | Network        |
| network_readPackagePerSec        | Number of network bytes per second in the collection cycle                 | Network        |
| network_writePackagePerSec       | Percentage of network IO time spent in the collection cycle                | Network        |
| heap_memory_init                 | heap memory initialization value                                           | JVM            |
| heap_memory_max                  | Maximum heap memory                                                        | JVM            |
| heap_memory_used                 | Heap memory used                                                           | JVM            |
| heap_memory_committed            | The heap memory has been committed                                         | JVM            |
| non_heap_memory_init             | Non-heap memory initialization value                                       | JVM            |
| non_heap_memory_max              | Maximum non-heap memory                                                    | JVM            |
| non_heap_memory_used             | Non-heap memory used value                                                 | JVM            |
| non_heap_memory_committed        | Non-heap memory committed                                                  | JVM            |
| code_cache_init                  | Code cache initialization value                                            | JVM            |
| code_cache_max                   | Maximum code cache size                                                    | JVM            |
| code_cache_used                  | The code cache has been used                                               | JVM            |
| code_cache_committed             | The code cache has been committed                                          | JVM            |
| meta_sapce_init                  | Metaspace initialization value                                             | JVM            |
| meta_sapce_max                   | Maximum value of metaspace                                                 | JVM            |
| meta_sapce_used                  | Metaspace used value                                                       | JVM            |
| meta_sapce_committed             | Metaspace committed value                                                  | JVM            |
| compressed_class_space_init      | Compressed class space initialization value                                | JVM            |
| compressed_class_space_max       | Maximum compressed class space                                             | JVM            |
| compressed_class_space_used      | Compressed class space used value                                          | JVM            |
| compressed_class_space_committed | Compressed class space committed value                                     | JVM            |
| eden_init                        | eden memory initialization value                                           | JVM            |
| eden_max                         | maximum memory of eden area                                                | JVM            |
| eden_used                        | used value of eden area memory                                             | JVM            |
| eden_committed                   | eden area memory committed value                                           | JVM            |
| survivor_init                    | memory initialization value of the survivor area                           | JVM            |
| survivor_max                     | maximum memory of the survivor area                                        | JVM            |
| survivor_used                    | Memory used value of the survivor area                                     | JVM            |
| survivor_committed               | memory committed value of the survivor area                                | JVM            |
| old_gen_init                     | Memory initialization value in the old era                                 | JVM            |
| old_gen_max                      | Maximum memory in the old age                                              | JVM            |
| old_gen_used                     | Memory used in the old age                                                 | JVM            |
| old_gen_committed                | Memory committed value in the old age                                      | JVM            |
| thread_live                      | Active thread                                                              | JVM            |
| thread_peak                      | thread peak                                                                | JVM            |
| thread_daemon                    | daemon thread                                                              | JVM            |
| new_gen_count                    | Young generation GC times                                                  | JVM            |
| new_gen_spend                    | Young generation GC time                                                   | JVM            |
| old_gen_count                    | GC times of older generation                                               | JVM            |
| old_gen_spend                    | GC time of the elderly generation                                          | JVM            |
| cpu_used                         | CPU usage of JVM                                                           | JVM            |
| start_time                       | JVM started time, milliseconds                                             | JVM            |
| qps                              | Requests per second                                                        | Throughput     |
| tps                              | Number of requests processed per second                                    | Throughput     |
| avg_response_time                | Average response time                                                      | Throughput     |

## Supported versions and restrictions

Framework support:

- SpringBoot 1.5.10. Release and above

- Dubbo 2.6.x-2.7.x

Restrictions:

- Dependent on Prometheus

- The collection of server indicators depends on the Linux environment

## Operation and result verification

The following will demonstrate how to use the monitoring plug-in.

### Preparations

- Download [demo application](https://start.spring.io/#!type=maven-project&language=java&platformVersion=2.7.7&packaging=jar&jvmVersion=1.8&groupId=com.example&artifactId=demo&name=demo&description=Demo%20project%20for%20Spring%20Boot&packageName=com.example.demo&dependencies=web)

- [Download](https://github.com/huaweicloud/Sermant/releases)/Compile the sermant package

- [Download](https://github.com/prometheus/prometheus/releases) prometheus

### Step 1: Compile and package the demo application

Execute the following command in the root directory of the demo application to package the demo application:

```shell
mvn clean package
```

The demo-0.0.1-SNAPSHOT.jar package can be obtained.

### Step 2: Modify the configuration

- Modify the monitoring plug-in configuration, which can be found in the path `${sermant-agent-x.x.x}/agent/pluginPackage/monitor/config/config.yaml`.

```yaml
monitor.config:                   # Monitoring plug-in configuration
    enableStartService: true      # Monitoring plug-in start switch. Modify to true.
    address: 127.0.0.1            # IP address/domain name of the host application's environment. Modify to host specific IP address.
    port: 12345                   # Provides the port information of Http service externally. Modify to an available port.
    reportType: PROMETHEUS        # Monitoring indicator reporting method. Currently only PROMETHEUS is supported.
```
- Modify the configuration file prometheus.yml of [Prometheus](https://prometheus.io/docs/introduction/overview/).

Add job information under the original job information.

```yaml
scrape_ configs:
  - job_Name: "prometheus"            # Job name. This is the original task of prometheus.
    static_configs:
      - targets: ["localhost:9090"]   # Monitoring host address
  - job_Name: "Sermant"               # Job name. Add the job of collecting and monitoring plug-in indicators
    metrics_path: /                   # The request path for collecting indicators. Default is/
    basic_auth:                       # Collect the authorization information of indicators, which is consistent with the monitoring plug-in configuration. The monitoring plug-in can be deleted when it is not configured.
      username:                       # Collect the authorization information of the indicator - username
      password:                       # Collect the authorization information of the indicator - password
    static_configs:                   
      - targets: ["127.0.0.1:12345"]  # The host address of the collection index. The IP and port information here is consistent with the monitoring plug-in configuration
```
### Step 3: Start the application

- Start the demo application with the following command

```shell
# Run under Linux
java -javaagent:${sermant-agent-x.x.x}/agent/sermant-agent.jar=appName=default -jar demo-0.0.1-SNAPSHOT.jar
```
```shell
# Run under Windows
java -javaagent:${sermant-agent-x.x.x}\agent\sermant-agent.jar=appName=default -jar demo-0.0.1-SNAPSHOT.jar
```
- Start Prometheus

### Verification

Open Prometheus (default is `http://127.0.0.1:9090`), query indicators. For example, query `heap_memory_used`. If the information can be queried, the plug-in will become effective.

The query effect is as follows:

<MyImage src="/docs-img/monitor.png"/>