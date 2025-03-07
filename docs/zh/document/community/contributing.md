# 社区贡献

欢迎来到Sermant开源社区！我们非常高兴你对我们的项目感兴趣，无论你是新手还是经验丰富的开发者，我们都鼓励你参与贡献，包括但不限于代码提交、文档校正和优化、布道文章等。本指南将帮助你了解如何参与贡献。

## 为什么参与开源贡献

- 学习微服务治理领域的最新技术和最佳实践

- 提升代码质量和协作能力

- 获取社区认可和职业发展机会

Sermant社区为开源贡献者制定了[社区贡献者激励计划](community-Incentive-program.md)来激发广大开发者的参与热情，共同推动我们社区的持续发展和创新。

## 贡献类型

- **代码贡献**：修复Bug、实现新特性、优化性能
- **文档改进**：完善官网文档、翻译、添加示例
- **测试**：编写单元测试、集成测试
- **博客**：发布布道文章
- **设计**：官网UI设计、优化
- **社区支持**：答疑

以上是我们列出的贡献类型，但并不仅仅局限在这些，我们欢迎任何对社区发展有益的开源贡献。

## 代码&文档贡献指导

### 开始之前

#### 行为守则

请务必阅读并遵守我们的[行为准则](https://github.com/sermant-io/Sermant/tree/develop/CODE_OF_CONDUCT.md)。

#### 开源贡献协议

Sermant社区采用DCO ([Developer Certificate of Origin](https://developercertificate.org/)) 作为开源贡献协议，如果您想参与社区贡献，需要按照以下步骤进行。

#### 注册GitHub账号

如果您没有GitHub账号，需要登录GitHub并使用电子邮件地址进行注册。电子邮件地址用于对DCO进行签名并配置SSH公钥。

#### 签署DCO

DCO ([Developer Certificate of Origin](https://developercertificate.org/))是一种轻量级的开源贡献协议，供开源贡献者证明他们有权授予项目使用他们的代码。

使用Git CLI提交代码commit时，可以使用[-s参数](https://git-scm.com/docs/git-commit)添加签名。使用示例如下：

```shell
$ git commit -s -m 'This is my commit message'
```

签名会作为被提交commit信息的一部分，格式为：

```
This is my commit message

Signed-off-by: Full Name <email>
```

> - 如果您使用IntelliJ IDEA提交代码，可以在Commit Change工具框中勾选`Sign-off commit`选项，即可在每次提交时附上签名信息。具体操作请参考[IntelliJ IDEA 使用文档](https://www.jetbrains.com/help/idea/commit-changes-dialog.html#2ddf66ea)。
> - 如果您使用Visual Studio Code提交代码，可以在Settings中勾选`Git: Always Sign Off`选项，即可在每次提交时附上签名信息。具体操作请参考[Visual Studio Code相关说明](https://github.com/microsoft/vscode/issues/83096)。



请确认**每次提交commit时都正确按照以上方式添加签名签署DCO**，否则您提交的代码将不会被接纳合入至我们的开源仓库。

### 贡献流程

Sermant 欢迎任何开源贡献者成为社区的不同角色，包括contributor、member、approver和 maintainer。为了完成这一点，社区提供了[贡献者激励计划](community-Incentive-program.md)，并需要贡献者积极参与社区共建。

接下来将介绍如何以 Sermant 方式进行代码贡献，我们以Sermant的[主仓库](https://github.com/sermant-io/Sermant)为例，[Sermant-websit](https://github.com/sermant-io/Sermant-website)和[Sermant-example](https://github.com/sermant-io/Sermant-examples)的贡献流程和主仓库一致。

#### 打开/提取Issue以进行准备

如果你发现文档中的错字，发现代码中的错误，或者想要新功能，或者想要提出建议，你可以在 [GitHub](https://github.com/sermant-io/Sermant/issues/new) 上提Issue。

如果您只想直接贡献，您可以选择带有下面标签的Issue:

-   [Contribution Welcome](https://github.com/sermant-io/Sermant/labels/contribution%20welcome): 急需的问题，但目前人手不足。

-   [good first issue](https://github.com/sermant-io/Sermant/labels/good%20first%20issue): 适合社区新人。

请注意，任何 PR 都必须与有效Issue相关联。否则 PR 将被拒绝。

#### 开始你的贡献

现在，如果您想贡献，请创建一个新的pr请求合入你的代码。

我们使用`develop`分支作为开发分支，往社区的develop分支工作流程如下。

1. 在GitHub上**fork**[Sermant仓库](https://github.com/sermant-io/Sermant)到你的个人仓库

2. 克隆您fork的Sermant仓库代码到本地

   ```
   git clone ${您fork的Sermant仓库地址}
   ```

3. 每次贡献前，请先在您的fork仓库同步最新的Sermant仓库的develop分支，如下图所示，点击红框的同步选项

   <MyImage src="/docs-img/community/sync-fork.png"></MyImage>

4. 本地仓库develop分支同步fork仓库的最新代码

   ```
   git fetch origin
   git checkout develop
   git merge origin/develop
   ```

5. 基于develop分支创建新的分支用于代码开发，建议每次贡献基于develop创建不同的分支，分支名称不做具体要求

   ```
   git checkout -b develop-${待开发代码功能的描述} develop
   ```

6. 在本地新分支进行修改

   在本地新分支对代码进行修改。对于修改的代码我们有如下基本要求：

    - 新增文件添加Sermant的Copyright，具体内容如下所示，添加Copyright时请确认第一行的年份是否正确，需和该文件最新的创建或修改年份保持一致，您也可以在[Intellij IDEA设置自动为新增文件添加Copyright](contributing.md#如何在intellij-idea设置自动为新增文件添加copyright？)：

      ```
      Copyright (C) 2025 Sermant Authors. All rights reserved.
       
        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
       
            http://www.apache.org/licenses/LICENSE-2.0
       
        Unless required by applicable law or agreed to in writing, software
        distributed under the License is distributed on an "AS IS" BASIS,
        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        See the License for the specific language governing permissions and
        limitations under the License.
      ```

    - 新增代码符合Sermant社区的Clean Code要求, 您可在[Intellij IDEA配置Sermant社区的checkstyle规则](contributing.md#如何在intellij-idea设置sermant社区的checkstyle规则？)。

    - 新引入依赖需添加该依赖的License文件，首先在Sermant仓库的`LICENSES/vendor`目录下检查是否存在以引入依赖的`groupId`和`artifactId`为名的文件夹，若不存在，则分别以`groupId`和`artifactId`创建父子文件夹，并在`artifactId`为名的文件夹下添加该依赖的License文件。

    - 本次修改请检查是否涉及官网文档修改，若涉及请修改官网相应文档，文档修改请参考[官网文档贡献指导](contributing.md#官网文档贡献指导)。

    - 每个pr的commit记录应只有一个

    - 本次修改在提交pr前，请自验通过。

7. 在新分支提交你的修改

   ```
   git status
   git add .
   git commit -s -m "你的提交信息"
   ```

8. 将新分支推送到您的远端个人仓库

   ```
   git push -u origin develop-${待开发代码功能的描述}
   ```

9. 在Github创建对**Sermant主仓库develop分支** 的pr请求

   创建拉取请求时，具体流程和要求如下:
    - 创建对Sermant主仓库develop分支的pr请求，请遵循[pull request模版](https://github.com/sermant-io/Sermant/tree/develop/.github/PULL_REQUEST_TEMPLATE.md)。

    - 请确保pr关联到社区的issue。
    - 每个pr的代码严格控制在1000行（包含UT）以下，建议不超过500行。
    - 新增代码的UT覆盖率需要达到70%

   如果您的 PR 包含较大的更改，例如组件重构或新组件，请写详细的设计和使用文档。

> 如果您使用Intellij IDEA开发代码，建议使用其自带的版本控制工具，可以可视化操作，更简单快捷，具体使用请参考[IntelliJ IDEA GIT使用文档](https://www.jetbrains.com/help/idea/using-git-integration.html)。

#### 代码审查

当您的代码pr提交后，将会有社区人员审查代码，请根据社区人员提出的review意见进行修改，当review意见处理完成后，请在该条review意见下回复`done`, 以确保社区人员知道您已处理该问题。我们同时欢迎任意身份的开源贡献者参与代码审查。

您提交的代码应符合Clean Code要求:

- Readability -  API 应该有 Javadoc，合理添加注释，同时代码风格应与现有风格保持一致。

- Elegance - 新的方法、类或组件应该设计得很好。

- Testability - 单元测试用例应该覆盖 70% 的新代码。

- Maintainability - 代码可维护性好.

#### 测试

Sermant有多种类型的测试。测试代码的位置随类型的不同而变化，成功运行测试所需的环境也是如此:

* 单元测试:这些测试可以确认一个特定的函数的行为是预期的。单元测试源代码可以在给定包内的相应源代码附近找到。这些都很容易由任何开发人员在本地运行。
* 集成测试:这些测试用例涵盖Sermant组件与应用程序之间的交互。

对于每个pr，相关的自动化集成测试用例将会执行，在合入代码之前，请确保您的pr已经通过所有执行的测试用例。

### 官网文档贡献指导

官网文档贡献整体流程如[开始之前]()和[贡献流程](contributing.md#贡献流程)所示，本节用于描述文档贡献的具体指导事项：

1、当前版本的文档修改请提交至[Sermant-websit](https://github.com/sermant-io/Sermant-website)仓库的latest分支，下一版本特性的相关文档请提交至[Sermant-websit](https://github.com/sermant-io/Sermant-website)仓库的develop分支。

2、官网文档的文档结构描述、开发指导、本地部署自验请参考[文档开发指南](../../../README_zh.md)。

## FAQ

### 创建pr后，出现代码冲突如何解决？

创建pr后，您和其他人的提交同时修改了同一份文件，就可能出现冲突，当出现冲突时，请执行以下操作解决文件冲突：

1. 在您的fork仓库同步最新的Sermant仓库目标合入分支的代码，以Sermant仓库的develop分支为例，如下图所示，点击红框的同步选项

   <MyImage src="/docs-img/community/sync-fork.png"></MyImage>

2. 本地仓库develop分支同步fork仓库的最新代码

   ```
   git fetch origin
   git checkout develop
   git merge origin/develop
   ```

3. 将develop分支rebase到您的开发分支

   ```
   git checkout ${您的开发分支}
   git rebase develop
   ```

4. 手动修改冲突的文件

5. 完成rebase

   ```
   git add .
   git git rebase --continue
   ```

> 如果您使用Intellij IDEA开发代码，建议使用其自带的版本控制工具，可以可视化操作，更简单快捷，具体使用请参考[IntelliJ IDEA GIT使用文档](https://www.jetbrains.com/help/idea/using-git-integration.html)。

### 如何在Intellij IDEA设置自动为新增文件添加Copyright？

如下图所示，在Intellij IDEA Settings中设置自动为新增文件添加Copyright：

<MyImage src="/docs-img/community/copyright-setting-1.png"></MyImage>

<MyImage src="/docs-img/community/copyright-setting-2.png"></MyImage>

<MyImage src="/docs-img/community/copyright-setting-3.png"></MyImage>

### 如何在Intellij IDEA设置Sermant社区的checkstyle规则？

如下图所示，在Intellij IDEA Settings中设置Sermant社区的checkstyle规则：

<MyImage src="/docs-img/community/checkstyle-1.png"></MyImage>

<MyImage src="/docs-img/community/checkstyle-2.png"></MyImage>

<MyImage src="/docs-img/community/checkstyle-3.png"></MyImage>

## 社区支持

我们致力于为贡献者提供支持：

- **定期会议**：举办线上的社区例会，讨论项目进度和贡献者问题
- **线下沙龙**：线下邀请用户、贡献者参与Sermant社区举办的活动
- **文档资源**：提供详细的贡献指南、贡献激励说明
- **物质奖励**：为优秀贡献者提供带有Sermant logo的官方礼物，比如T恤、帆布包等

## 社区期望

Sermant是一个社区项目，由社区推动，努力促进健康，友好和富有成效的环境。社区的目标是构建一个插件开发生态系统，以帮助开发人员在不干扰应用程序源代码的情况下更轻松地实现服务治理功能。

- 查看 [Community Membership](https://github.com/sermant-io/Sermant/blob/develop/community-membership.md) 获取各种社区角色的相关描述。

