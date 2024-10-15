# 配置管理的UI模板

本文档主要针对Sermant Backend的配置管理功能，介绍如何开发配置管理的UI模板

## UI模板

### 功能介绍

Sermant Backend的配置管理功能依据UI模板进行配置查询、新增、修改时的页面渲染。

### 开发实例

配置管理的UI模板是以插件为维度的，每个插件的动态配置都对应一个UI模板。UI模板采用yaml格式，主要包含以下几部分：

#### 插件的基本信息

| **参数键**         | **说明**                             | **默认值** | **是否必须** |**备注**|
| ------------------ | ------------------------------------ | ---------- | ------------ |------------ |
|    name-zh   | 插件的中文名称                |   null     | 是         | |
| name-en        | 插件的英文名称                    | null  | 是           | |

#### Group和Key生成规则

Group和Key生成规则主要用于结合元素信息生成插件动态配置的Group和Key。

| **参数键**         | **说明**                             | **默认值** | **是否必须** |**备注**|
| ------------------ | ------------------------------------ | ---------- | ------------ |------------ |
|  groupRule   |  group的生成规则，如果由变量组成，如由应用名称、环境名称组成可以用app=${application}&environment=${environment}表示。变量名的key需要和元素名称保持一致  |   null     | 是         | |
|  keyRule       | key的生成规则，和Group生成规则的表示方式一样                    | null  | 是           | |

#### 插件UI模板的元素信息elements

UI模板的元素信息会在配置详情页面上渲染为input框，从而让用户填写。根据用户填写的值结合Group和Key的生成规则会动态生成插件动态配置的Group和Key。


| **参数键**         | **说明**                             | **默认值** | **是否必须** | **备注**|
| ------------------ | ------------------------------------ | ---------- | ------------ |------------ |
|  name   |  元素名称  |   null     | 是         ||
|  desc-zh| 元素的中文展示名称                    | null  | 是           | |
|  desc-en| 元素的英文展示名称                    | null  | 是           | |
|  values | 元素的可选项                    | null  | 需要用户手动填写时非必须           | values为数组格式，包含三个属性desc-zh: 可选项的中文展示名称，desc-en: 可选项的英文展示名称， name: 可选项的值 |
|  placeholder|   元素信息对应input框的占位信息              | null  | 否          | 包含两个属性desc-zh: 占位信息的中文展示内容，desc-en: 占位信息的英文展示内容|
|  required|   该元素信息是否必填              | null  | 是          | |
|  notice|   该元素信息的提示信息            | null  | 是          |包含两个属性desc-zh: 提示信息的中文展示内容，desc-en: 提示信息的英文展示内容 |

#### 插件的动态配置模板configTemplates

为了方便用户配置，配置详情页面会展示插件的动态配置模板，页面会根据动态配置模板信息去判断当前插件需要使用的是那一套动态配置模板（判断方式为通过正则表达式校验根据Key生成规则生成的key符合动态配置模板中那套模板的key）。

| **参数键**         | **说明**                             | **默认值** | **是否必须** | **备注**|
| ------------------ | ------------------------------------ | ---------- | ------------ |------------ |
|  key   |  动态配置key的匹配规则  |   null     | 是         ||
|  value   |  插件的动态配置模板  |   null     | 是         ||

#### 效果

以流控插件动态配置的UI模板为例，模板内容如下所示：

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

页面展示内容如下所示：

<MyImage src="/docs-img/flowcontrol-zh.png"></MyImage>