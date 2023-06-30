# Sermant Framework FAQs

This document mainly explains common problems encountered when using the Sermant framework.

## **What does the input parameter “appName” mean**

- The `appName` represents the name of the host application. Multiple instances can have the same `appName` and different `instanceName`.

## **What kind of service governance plugins does Sermant provide?**

- Sermant is extensible. Besides the service governance plugin provided by the framework itself ([Introduction to FlowControl](../plugin/flowcontrol.md), [Introduction to Service Registration](../plugin/service-registry.md)), developers can develop plugins including (data collection, link collection, etc.) according to business requirements.


## **How to mount multiple Sermants simultaneously??

- If the host application needs to mount multiple Sermants, please follow the following steps to handle other Sermants.

> Note: It is not recommended to mount multiple Sermants unless necessary


### Step 1: Use the hade plugin to redirect the class path

- Modify the pom.xml files for sermant agentcore core, sermant agentcore implementation, sermant agentcore premain, and sermant common. Use the Shade plugin for class redirection during packaging. Please refer to the following figure for specific modifications (please specify the prefix for path resetting backward based on your project)

<MyImage src="/docs-img/package.png"/>

### Step 2: Modify the Premain-Class path

- Modify the AgentPremain path in the pom.xml file of the sermant agentcore premain. (Please keep the path prefix consistent with the first step to prevent missing the AgentPremain class)

<MyImage src="/docs-img/premain-classpath.png"/>

### Step 3: Modify the Logger instance.

- Modify the method parameters for obtaining log Logger instances in the AgentPremain class to prevent different Servants from using the same Logger instance

<MyImage src="/docs-img/sermant-log.png"/>

- After modifying according to the above steps, multiple Sermant launches will not cause conflicts.

> Note:  
> 1. Do not use the - D parameter to modify the configuration information of the Sermant, otherwise all Sermants will be modified simultaneously.  
> 2. When using dynamic configuration, ensure that the group information of different Sermants is inconsistent, or use different configuration centers. Otherwise, all Sermants will share the same dynamic configuration.  
> 3. If different Sermants load the same plugin, please redirect the plugin's classpath according to step 1 to prevent conflicts.

