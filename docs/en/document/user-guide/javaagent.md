# JavaAgent Manual

Specify `sermant-agent.jar` via the -javaagent parameter when a Java program (Java class with a main function) is running.

```shell
-javaagent:sermant-agent.jar[=${options}]
```

Where `${options}` is the launch input parameter, which will be transferred as the parameter `agentArgs` to the `premain` method.

```java
public static void premain(String agentArgs, Instrumentation inst);
```

The format of the `agentArgs` parameter should look like `key1=value1,key2=value2[(,keyN=valueN)...]`, which splits key/value pairs with `','`, and splits between key and value with `'='` 'to form a `Map` structure.

Note that `agentArgs` must contain a key/value pair whose `key` is `appName`. So the *Java* command argument added at startup should look exactly like this:

```shell
-javaagent:sermant-agent.jar=appName=${appName}[,${otherOptions}]
```

Where `${appName}` represents the appName and `${otherOptions}` represents other parameters.

More *Java Agent* related content can be found in the official documentation for [java.lang.instrument](https://docs.oracle.com/javase/8/docs/api/java/lang/instrument/package-summary.html).

## Startup Parameters

The fixed contents of **startup parameters** are as follows:

|Key in Input Parameters|Key in Bootstrap Configuration|Key in Startup Parameters|Explanation|Default Value|NotNull|Notes|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|appName|app.name|appName|The name of host application|/|True|Must present in startup parameters|
|instanceName|instance.name|instanceName|The name of the specific instance|default|True|/|
|appType|app.type|appType|The type of host application|0|True|/|
|env|env|env|/|/|False|/|
|envTag|env.tag|envTag|/|/|False|/|
|business|business|business|/|/|False|/|
|subBusiness|sub.business|subBusiness|/|/|False|/|
|envSecret|env.secret|envSecret|/|/|False|/|
|accessKey|access.key|access.key|/|/|False|/|
|secretKey|secret.key|secret.key|/|/|False|/|
|masterAddress|master.address|master.address|/|/|False|/|
|/|/|agentPath|The directory of Entrance package|The directory of Entrance package|True|No need to configure|
|/|/|bootPath|/|/|True|Deprecated|
|/|/|pluginsPath|/|/|True|Deprecated|
|/|/|sermant.config.file|Unified Configuration File|Unified Configuration File|True|No need to configure|
|/|/|sermant.plugin.setting.file|Plugin Setup Configuration|Plugin Setup Configuration|True|No need to configure|
|/|/|sermant.plugin.package.dir|The directory of plugin package|The directory of plugin package|True|No need to configure|
|/|/|sermant.log.setting.file|The directory of log configuration file|The directory of log configuration file|True|No need to configure|

The `agentArgs` parameter allows you to configure more values for **startup parameters**.
