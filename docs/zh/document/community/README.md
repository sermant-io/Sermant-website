# 版本发布

## 当前版本

完整版本发布记录可以在 [github](https://github.com/sermant-io/Sermant)查阅。

## 发布周期

- Sermant目前计划每三个月发布一个特性版本，特性版本的版本号采用**X.X.0**的格式。每个特性版本都会包含最新的功能，并且每个特性版本的维护周期为一年。
- Sermant目前计划每一个月左右发布一个补丁版本，补丁版本的版本号为**X.X.X**（版本号第三位不为0）。小版本中发现有影响功能的问题时，Sermant社区将会及时进行修复，并发布补丁版本。

## 版本约定

### 快照版本

快照版本并不会出现在Sermant的发布页中，其将在Maven中心仓中版本号以 **X.X.X-SNAPSHOT**为后缀。快照版本是用来在稳定版本发布前实验新特性，开发者在开发阶段可以使用快照版本来使用Sermant的最新特性，并帮助发现Sermant新特性的问题。

### 稳定版本

稳定版本会出现在Sermant的[发布页](https://github.com/sermant-io/Sermant/releases)中，其在Maven中新仓中以**X.X.X**为后缀。稳定版本是经过测试后发布的，每一个版本一经发布后将不会再进行改动，如有新增或更改，将会在下一个稳定版本中体现。

## 版本发布准备
### 清单核查
<table style="background-color:white">
    <tr>
        <td>发布阶段</td>
        <td>受检组件</td>
        <td>检查项</td>
        <td>执行措施</td>
    </tr>
    <tr>
        <td rowspan="11" style="background-color:white">版本发布前</td>
        <td rowspan="4" style="background-color:white">用户使用手册</td>
        <td style="background-color:white">是否需要新增用户使用手册</td>
        <td style="background-color:white">若需要，新增用户使用手册</td>
    </tr>
    <tr>
        <td style="background-color:white">Sermant Agent框架功能和使用是否发生变化</td>
        <td style="background-color:white">若变化，修改Sermant Agent的使用手册</td>
    </tr>
    <tr>
        <td style="background-color:white">Sermant Backend功能和使用是否发生变化</td>
        <td style="background-color:white">若变化，修改Sermant Backend的使用手册</td>
    </tr>
    <tr>
        <td style="background-color:white">Sermant Inject功能和使用是否发生变化</td>
        <td style="background-color:white">若变化，修改Sermant Inject的使用手册</td>
    </tr>
    <tr>
        <td rowspan="2" style="background-color:white">插件使用手册</td>
        <td style="background-color:white">是否新增插件</td>
        <td style="background-color:white">若新增，添加新增插件的使用手册</td>
    </tr>
    <tr>
        <td style="background-color:white">已发布插件的功能和使用是否发生变化</td>
        <td style="background-color:white">若变化，修改对应的插件使用手册</td>
    </tr>
    <tr>
        <td rowspan="2" style="background-color:white">开发者指南文档</td>
        <td style="background-color:white">框架是否新增新的能力</td>
        <td style="background-color:white">若新增，添加相应新能力的文档</td>
    </tr>
    <tr>
        <td style="background-color:white">框架已有能力是否变化</td>
        <td style="background-color:white">若变化，修改相应能力文档</td>
    </tr>
    <tr>
        <td style="background-color:white">版本升级兼容性</td>
        <td style="background-color:white">版本升级兼容性文档修改</td>
        <td style="background-color:white">修改版本升级兼容性文档适配新版本</td>
    </tr>
    <tr>
        <td style="background-color:white">性能基准测试报告</td>
        <td style="background-color:white">新增插件的性能测试</td>
        <td style="background-color:white">性能基准测试文档增加新增插件的性能测试报告</td>
    </tr>
    <tr>
        <td style="background-color:white">安全测试</td>
        <td style="background-color:white">安全漏洞排查</td>
        <td style="background-color:white">若存在安全漏洞，需全部修复</td>
    </tr>
    <tr>
        <td rowspan="4" style="background-color:white">版本发布</td>
        <td style="background-color:white">Maven仓库发布</td>
        <td style="background-color:white">新版本分支代码是否完整</td>
        <td style="background-color:white">新版本分支应合并全部新版本的提交代码</td>
    </tr>
    <tr>
        <td rowspan="2" style="background-color:white">Sermant Release</td>
        <td style="background-color:white">Sermant Release包发布</td>
        <td style="background-color:white">基于新版本分支代码发布Sermant Release包</td>
    </tr>
    <tr>
        <td style="background-color:white">Release Note </td>
        <td style="background-color:white">完成版本发布的Release Note</td>
    </tr>
    <tr>
        <td style="background-color:white">Sermant-example Release</td>
        <td style="background-color:white">Sermant-example Release包发布</td>
        <td style="background-color:white">Sermant-example仓跟随版本发布Demo二进制产物包</td>
    </tr>
    <tr>
        <td rowspan="2" style="background-color:white">版本发布后</td>
        <td style="background-color:white">官网、Github文档</td>
        <td style="background-color:white">推荐的Sermant Release软件包版本</td>
        <td style="background-color:white">更新推荐使用的Sermant Release软件包版本为最新版本</td>
    </tr>
    <tr>
        <td style="background-color:white">版本发布文章</td>
        <td style="background-color:white">发布版本发布文章</td>
        <td style="background-color:white">发布版本发布文章并在交流群分享</td>
    </tr>
</table>

### 测试流程
版本发布前，新版本特性会经过严格的测试活动以保证Sermant的高质量和稳定性，具体的测试流程如下所示：

1. 版本新特性功能、安全、性能和可靠性测试设计与评审
2. 测试
3. 问题修复与闭环
4. 测试报告评审，评审通过后发布新版本