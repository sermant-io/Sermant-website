# UI Template for Configuration Management

This document mainly focuses on the configuration management feature of Sermant Backend, explaining how to develop the UI template for configuration management.

## UI Template

### Feature Introduction

The configuration management feature of Sermant Backend is based on the UI template for rendering pages when querying, adding, or modifying configurations.

### Development Example

The UI template for configuration management is based on plugins, where each dynamic configuration of a plugin corresponds to a UI template. The UI template is in YAML format and mainly includes the following parts:

#### Basic Information of the Plugin

| **Parameter Key** | **Description** | **Default Value** | **Required** | **Note** |
| ----------------- | --------------- | ----------------- | ------------ | -------- |
| name-zh | Chinese name of the plugin | null | Yes | |
| name-en | English name of the plugin | null | Yes | |

#### Group and Key Generation Rules

Group and Key generation rules are used to generate the Group and Key of dynamic configurations based on element information.

| **Parameter Key** | **Description** | **Default Value** | **Required** | **Note** |
| ----------------- | --------------- | ----------------- | ------------ | -------- |
| groupRule | Rule for generating the group, if composed of variables such as application name and environment name, it can be represented as app=${application}&environment=${environment}. The key names of variables should match the element names | null | Yes | |
| keyRule | Rule for generating the key, similar to the representation of Group generation rule | null | Yes | |

#### Element Information of the Plugin UI Template

The element information of the UI template will be rendered as input boxes on the configuration details page for user input. Based on the values filled in by the user and the generation rules of Group and Key, the dynamic Group and Key of the plugin will be generated.

| **Parameter Key** | **Description** | **Default Value** | **Required** | **Note** |
| ----------------- | --------------- | ----------------- | ------------ | -------- |
| name | Element name | null | Yes | |
| desc-zh | Chinese display name of the element | null | Yes | |
| desc-en | English display name of the element | null | Yes | |
| values | Options for the element | null | Not mandatory when user input is not required | values are in array format, containing three attributes: desc-zh for the Chinese display name of the option, desc-en for the English display name of the option, and name for the value of the option |
| placeholder | Placeholder information for the element corresponding to the input box | null | No | Contains two attributes: desc-zh for the Chinese display content of the placeholder and desc-en for the English display content of the placeholder |
| required | Whether the element information is required | null | Yes | |
| notice | Information to prompt the element | null | Yes | Contains two attributes: desc-zh for the Chinese display content of the prompt and desc-en for the English display content of the prompt |

#### Dynamic Configuration Templates of the Plugin

For user convenience in configuration, the configuration details page will display the dynamic configuration templates of the plugin. The page will determine which set of dynamic configuration templates the current plugin needs to use based on the dynamic configuration template information (determined by validating the key generated according to the Key generation rule using regular expressions to match the key in the dynamic configuration template).

| **Parameter Key** | **Description** | **Default Value** | **Required** | **Note** |
| ----------------- | --------------- | ----------------- | ------------ | -------- |
| key | Matching rule for dynamic configuration key | null | Yes | |
| value | Dynamic configuration template of the plugin | null | Yes | |

#### Example

Taking the UI template for dynamic configuration of the flow control plugin as an example, the template content is as follows:


```yaml
plugin:
  name-zh: 流控插件
  name-en: flowcontrol
groupRule:
  - service=${service}
  - app=${application}&environment=${environment}&service=${service}
  - app=${application}&environment=${environment}
keyRule:
  - servicecomb.${ruleType}.${sceneName}
elements:
  - name: ruleType
    desc-zh: 规则类型
    desc-en: Rule Type
    values:
      - desc-zh: 流量匹配规则
        desc-en: Traffic Matching Rule
        name: matchGroup
      - desc-zh: 限流规则
        desc-en: Rate Limiting Rule
        name: rateLimiting
      - desc-zh: 熔断规则
        desc-en: Circuit Breaker Rule
        name: circuitBreaker
      - desc-zh: 隔离规则
        desc-en: Bulkhead Rule
        name: bulkhead
      - desc-zh: 错误注入
        desc-en: Fault Injection Rule
        name: faultInjection
      - desc-zh: 重试
        desc-en: Retry Rule
        name: retry
      - desc-zh: 系统级流控
        desc-en: System Level Flow Control
        name: system
    placeholder:
      desc-zh: 请选择规则类型
      desc-en: Please select a rule type
    required: true
    notice:
      desc-zh: 流控插件支持的规则类型
      desc-en: Rule types supported by the flow control plugin
  - name: sceneName
    desc-zh: 规则场景名称
    desc-en: Scene Name
    placeholder:
      desc-zh: 请输入场景名称
      desc-en: Please enter the scene name
    required: true
    notice:
      desc-zh: 流量匹配规则和具体流控规则的场景名称一致时流控规则才会生效
      desc-en: The flow control rule will only take effect when the scene name matches the traffic matching rule
  - name: application
    placeholder:
      desc-zh: 请输入应用名称
      desc-en: Please enter the application name
    required: true
    notice:
      desc-zh: 该配置对应sermant配置文件中的service.meta.application
      desc-en: This configuration corresponds to the service.meta.application  in the sermant configuration file
  - name: environment
    placeholder:
      desc-zh: 请输入环境名称
      desc-en: Please enter the environment name
    required: false
    notice:
      desc-zh: 该配置对应sermant配置文件中的service.meta.environment
      desc-en: This configuration corresponds to the service.meta.environment in the sermant configuration file
  - name: service
    desc-zh: service
    desc-en: service
    placeholder:
      desc-zh: 请输入服务名称
      desc-en: Please enter the service name
    required: true
    notice:
      desc-zh: 微服务的名称，由微服务配置文件的dubbo.application.name、spring.applicaton.name确定
      desc-en: The name of the microservice is determined by the dubbo.application.name and spring.application.name in the microservice configuration file
configTemplates:
  - key: servicecomb.matchGroup.*
    value: "matches:\n  - apiPath:\n      exact: /degrade\n    headers:\n      key:\n        exact: value\n    method:\n      - GET\n    name: degrade"
  - key: servicecomb.rateLimiting.*
    value: "limitRefreshPeriod: 1000\nrate: 2"
  - key: servicecomb.circuitBreaker.*
    value: "failureRateThreshold: 90\nminimumNumberOfCalls: 3\nslidingWindowSize: 10S\nslidingWindowType: time\nslowCallRateThreshold: 80"
  - key: servicecomb.bulkhead.*
    value: "maxConcurrentCalls: 5\nmaxWaitDuration: 10S"
  - key: servicecomb.faultInjection.*
    value: "type: abort\npercentage: 100\nfallbackType: ReturnNull\nforceClosed: false\nerrorCode: 503"
  - key: servicecomb.retry.*
    value: "waitDuration: 2000\nretryStrategy: FixedInterval\nmaxAttempts: 2\nretryOnResponseStatus:\n  - 500"
  - key: servicecomb.system.*
    value: "systemLoad: 5\ncpuUsage: 0.6\nqps: 1000\naveRt: 100\nthreadNum: 200"
```

The page display content is as follows:

<MyImage src="/docs-img/flowcontrol-en.png"></MyImage>