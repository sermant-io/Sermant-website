# monitor

This document is mainly used for the instructions of [monitor module](https://github.com/huaweicloud/Sermant/tree/develop/sermant-plugins/sermant-monitor)

## Functions

The resource monitoring module is used to monitor the use of CPU, memory, disk IO, network IO and other hardware resources of the server where the host application is located. The host application Java virtual machine has microservice use, and microservice public indicators are collected.

The monitoring module relies on prometheus to collect indicators. prometheus periodically calls the httpServer service of the java agent to obtain the indicator information registered by the plug-in and store it for display.



## Parameter configuration

```yaml
monitor.Config:                 # Monitoring service configuration
  Enable start service: false   # Monitoring service startup switch
  Address: 127.0.0.1            # Address of the host service (HTTPS is recommended)
  Port: 12345                   # Host service port information
  ReportType: PROMETHEUS        # Monitoring indicator reporting method currently only supports HTTPS
  UserName:                     # Authorization information -- Authorization user name
  Password:                     # Authorization information -- authorized user password -- AES encryption -- see AESUtil
  Key:                          # KEY used for authorized user password encryption
```

### Description of the monitor module

*Use Background*

This service includes three collection sub services, namely Linux resource monitoring and collection, JVM resource monitoring and collection, and microservice monitoring and collection

- The Linux resource monitoring and collection function requires the host application to be deployed in the Linux environment.
- The JVM memory monitoring and collection function requires the host application to use OpenJDK or the JDK version based on OpenJDK
- Microservice monitoring mainly collects the indicator information of Dubbo service and Spring Cloud service



*Function description*

- **Linux's resource monitoring and collection**: Obtain the system CPU, memory, disk IO, and network IO resource usage data by executing the Linux command, and register to the default registrar of prometheus.

```shell
    #CPU
    cat /proc/stat
    #MEMORY
    cat /proc/meminfo
    #DISK
    cat /proc/diskstats
    #NETWORK
    cat /proc/net/dev
    #CPU CORE
    lscpu
```

- **Collection content**

```shell
    #CPU
    double cpu_user;   // User mode time proportion
    double cpu_sys;    // Proportion of system time
    double cpu_wait;   // Percentage of waiting time
    double cpu_idle;   // Percentage of idle time
    double cpu_cores;  // Number of CPU physical cores
```

```shell
    #Memory usage
    double memory_total;   // Total memory size
    double memory_swap;    // SwapCached corresponding to cat/proc/meminfo instruction
    double memory_cached;  // Cached corresponding to cat/proc/meminfo instruction
    double memory_buffer;  // Buffers corresponding to cat/proc/meminfo instruction
    double memory_used;    // Memory size used
```

```shell
    #Memory usage
    double memory_total;   // Total memory size
    double memory_swap;    // SwapCached corresponding to cat/proc/meminfo instruction
    double memory_cached;  // Cached corresponding to cat/proc/meminfo instruction
    double memory_buffer;  // Buffers corresponding to cat/proc/meminfo instruction
    double memory_used;    // Memory size used
```

```shell
    #Disk IO
    double disk_readBytesPerSec;   // Number of bytes read per second in the collection cycle
    double disk_writeBytesPerSec;  // Number of bytes per second in the collection cycle
    double disk_ioSpentPercentage; // Percentage of time spent on IO in the acquisition cycle
```

```shell
    #network
    double network_readBytesPerSec;    // Number of bytes read per second in the collection cycle
    double network_writeBytesPerSec;   // Number of bytes per second in the collection cycle
    double network_readPackagePerSec;  // Number of packets read per second in the collection cycle
    double network_writePackagePerSec; // Number of packets written per second in the collection cycle
```

- **JVM Monitoring Collection**: Get JVM indicators from java.lang.management.ManagementFactory regularly

```shell
    #JVM memory
    double heap_memory_init;                    // Heap memory initialization value
    double heap_memory_max;                     // Maximum heap memory
    double heap_memory_Used;                    // The heap memory has been used
    double heap_memory_Committed                // The heap memory has been committed
    double non_heap_memory_init;                // Non heap memory initialization value
    double non_heap_memory_max;                 // Maximum non heap memory
    double non_heap_memory_Used;                // Non heap memory is used
    double non_heap_memory_Committed;           // Non heap memory has been committed
    double code_cache_init;                     // Code buffer initialization value
    double code_cache_max;                      // Maximum code buffer
    double code_cache_Used                      // The code buffer has been used
    double code_cache_Committed                 // The code cache has been committed
    double meta_sapce_init;                     // Metaspace initialization value
    double meta_sapce_max;                      // Metaspace maximum
    double meta_sapce_Used;                     // Metaspace used
    double meta_sapce_Committed;                // Metaspace has been committed
    double compressed_class_space_init;         // Compression class space initialization value
    double compressed_class_space_max;          // Maximum compression class space
    double compressed_class_space_Used;         // The compressed class space has been used
    double compressed_class_space_Committed;    // The compressed class space has been committed
    double eden_init;                           // Initialization value of eden area memory
    double eden_max;                            // Maximum memory in eden area
    double eden_Used;                           // The eden memory has been used
    double eden_Committed;                      // The eden memory has been committed
    double survivor_init;                       // Initialized value of survivor area memory
    double survivor_max;                        // Maximum value of survivor area memory
    double survivor_Used;                       // The memory in the survivor area has been used
    double survivor_Committed                   // The memory in the survivor area has been committed
    double old_gen_init;                        // Memory initialization value in the old age
    double old_gen_max;                         // Memory maximum in old age
    double old_gen_Used;                        // The old memory has been used
    double old_gen_Committed;                   // The memory of the old era has been committed
```

```shell
    #thread
    double thread_live;     // Active thread
    double thread_peak;     // Thread Peak
    double thread_daemon;   // Daemon thread
```

```shell
    #GC
    double new_gen_count; // GC times of young generation
    double new_gen_spend; // Time consuming of GC of young generation
    double old_gen_count; // GC frequency of the elderly generation
    double old_gen_spend; // Time consumption of GC of the elderly generation
```

```shell
    #Other JVM indicators
    double cpu_used;        // CPU usage by JVM
    double start_time;      // JVM started time, milliseconds
```



- **Microservice monitoring collection**: intercepts the service request of the host service and calculates the public request index of the host service

```shell
    #Microservice
    double qps;                 // Requests per second
    double tps;                 // Number of request processing per second
    double avg_response_Time    // Average response time
```

## Operation and result validation
1. Modify the current monitoring configuration of plug-in config -- config yaml。 Modify the IP ports and switches for external services

```yaml
monitor.Config:                 # Monitoring service configuration
  Enable start service: false   # External service switch -- When the switch is true, prometheus can call the service port to obtain indicator information
  Address: 127.0.0.1            # Modify to host service IP (HTTPS address is recommended)
  Port: 12345                   # Modified to provide external service port
```

2. Modify the configuration file of prometheus In the sketch_ Add the corresponding job information under configs (according to the content configured in step 1)

3. The host application mounts the java agent to start.

4. Start prometheus. You can view the indicator information on the prometheus page