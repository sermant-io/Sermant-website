# Heartbeat


This document describes how the Sermant plugin uses the heartbeat function.

Heartbeat is one of the core services in [**Sermant** core module](https://github.com/sermant-io/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core). An instance of heartbeatService is obtained by:
```java
HeartbeatService heartbeatService = ServiceManager.getService(HeartbeatService.class);
```

The heartbeat service starts execution when it is initialized, and periodically sends the name, version and other information of each plugin to the backend server. Currently, plugin heartbeats report information like:

- `hostname`: The hostname of the sending client
- `ip`: The ip of the sending client
- `app`: Application name, as well as `appName` in startup parameters
- `appType`: Application type，as well as `appType` in startup parameters
- `heartbeatVersion`: Time of last heartbeat
- `lastHeartbeat`: Time of last heartbeat
- `version`: The version of the core package, as well as the `sermant-version` value of the core package `manifest` file
- `pluginInfoMap`: Current Sermant carried plugin information
  - `pluginName`: Plug-in name, which can be determined in the plug-in configuration file
  - `pluginVersion`: Plug-in version, which is the `Sermant-plugin-version` value of the `manifest` file in the plugin jar
  - `extInfo`: Additional content that the plug-in wants to report in the data that the plug-in reports

If you want to add additional content to the data reported by the plugin, you can call the following API:
```java
// use ExtInfoProvider to add additional content
heartbeatService.setExtInfo(new ExtInfoProvider() {
  @Override
  public Map<String, String> getExtInfo() {
    // do something
  }
});
```