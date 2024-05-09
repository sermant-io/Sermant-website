# 参与社区

欢迎来到Sermant！本文档是关于如何为 Sermant 做出贡献的指南。

如果您发现不正确或遗漏的内容，请留下意见/建议

## 开始之前

### 行为守则

请务必阅读并遵守我们的[行为准则](https://github.com/sermant-io/Sermant/tree/develop/CODE_OF_CONDUCT.md)。

### 开源贡献协议

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

## 贡献

Sermant 欢迎任何角色的新参与者，包括用户、贡献者、提交者和 PMC。

我们鼓励新人积极加入 Sermant 项目，从用户角色到提交者角色，甚至 PMC 角色。为了做到这一点，新人需要积极参与 Sermant 项目。以下段落介绍如何以 Sermant 方式进行贡献。

#### 打开/提取Issue以进行准备

如果你发现文档中的错字，发现代码中的错误，或者想要新功能，或者想要提出建议，你可以在 [GitHub](https://github.com/sermant-io/Sermant/issues/new) 上提Issue。

如果您只想直接贡献，您可以选择下面的Issue:

-   [Contribution Welcome](https://github.com/sermant-io/Sermant/labels/contribution%20welcome): 急需的问题，但目前手头不足。
    
-   [good first issue](https://github.com/sermant-io/Sermant/labels/good%20first%20issue): 适合新人，新人可以拿一个热身。
    

我们非常重视文档和与其他项目的集成，例如 Spring Cloud、Kubernetes、Dubbo 等。我们很高兴在这些方面解决任何问题。

请注意，任何 PR 都必须与有效问题相关联。否则 PR 将被拒绝。

#### 开始你的贡献

现在，如果您想贡献，请创建一个新的拉取请求。

我们使用`develop`分支作为开发分支，说明这是一个不稳定的分支。

此外，我们的分支模型符合 一个成功的 [Git](https://nvie.com/posts/a-successful-git-branching-model/) 分支模型。我们强烈建议新人在创建 PR 之前先阅读上述文章。

现在，如果您准备好创建 PR，以下是贡献者的工作流程：

1.  Fork to your own
    
2.  Clone fork to local repository
    
3.  Create a new branch and work on it
    
4.  Keep your branch in sync
    
5.  Commit your changes (make sure your commit message concise)
    
6.  Push your commits to your forked repository
    
7.  Create a pull request to **develop** branch.
    

创建拉取请求时:

1. Please follow [the pull request template](https://github.com/sermant-io/Sermant/tree/develop/.github/PULL_REQUEST_TEMPLATE.md).
   
2. Please create the request to **develop** branch.
   
3. Please make sure the PR has a corresponding issue.
   
4. If your PR contains large changes, e.g. component refactor or new components, please write detailed documents about its design and usage.
   
5. Note that a single PR should not be too large. If heavy changes are required, it's better to separate the changes to a few individual PRs.
   
6. After creating a PR, one or more reviewers will be assigned to the pull request.
   
7. Before merging a PR, squash any fix review feedback, typo, merged, and rebased sorts of commits. The final commit message should be clear and concise.
   

如果您的 PR 包含较大的更改，例如组件重构或新组件，请写详细的设计和使用文档。

### 代码审查指南

提交者将轮流审查代码，以确保在合并前至少由一名提交者及时审查所有 PR。如果我们不做我们的工作（有时我们会丢东西）。和往常一样，我们欢迎志愿者进行代码审查。

一些原则:

- Readability - 重要的代码应该有据可查。 API 应该有 Javadoc。代码风格应与现有风格保持一致。
  
- Elegance - 新的函数、类或组件应该设计得很好。
  
- Testability - 单元测试用例应该覆盖 80% 的新代码。
  
- Maintainability - 代码可维护性好.

### 测试

Sermant有多种类型的测试。测试代码的位置随类型的不同而变化，成功运行测试所需的环境也是如此:

* 单元测试:这些测试可以确认一个特定的函数的行为是预期的。单元测试源代码可以在给定包内的相应源代码附近找到。这些都很容易由任何开发人员在本地运行。
* 集成测试:这些测试用例涵盖Sermant组件与应用程序之间的交互。

持续的集成将在每个pr上运行。

### 社区期望

Sermant是一个社区项目，由社区推动，努力促进健康，友好和富有成效的环境。社区的目标是构建一个插件开发生态系统，以帮助开发人员在不干扰应用程序源代码的情况下更轻松地实现服务治理功能。

- 查看 [Community Membership](https://github.com/sermant-io/Sermant/blob/develop/community-membership.md) 获取各种社区角色的相关描述。



