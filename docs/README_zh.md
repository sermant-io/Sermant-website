# 开发说明
[简体中文](README_zh.md) | [English](README.md)
## 如何使用
首先确保存在Node.js环境，可先从官网下载。[Node.js官网](https://nodejs.org/zh-cn/download/)
环境安装完成后可通过
```shell
node -v
npm -v
```
来查看是否安装成功。
之后进入根目录即SERMANT-WEBSITE目录，运行
```shell
npm install
```
安装项目所需依赖。
本地运行指令
```shell
npm run dev
```
项目打包
```shell
npm run build
```
## 结构
```
sermant-website
    └─docs
        ├─.vuepress
        │  ├─components (vue组件)
        │  ├─public (各种静态资源)
        │  │  ├─img (图片)
        │  │  └─user-story-logo (用户案例中的用户logo)
        │  ├─styles (全局样式)
        │  └─theme  (主题配置)
        │      ├─components
        │      └─styles
        ├─en (英文文档目录)
        │  ├─document
        │  │  ├─community (社区文档)
        │  │  ├─developer-guide (开发者指南)
        │  │  ├─faq (常见问题)
        │  │  ├─plugin (插件使用手册)
        │  │  └─user-guide (用户使用指南)
        │  ├─blog
        │  │  └─README.md (博客页)
        │  ├─QuickStart.md (快速开始指南)
        │  └─README.md (主页内容)
        └─zh (中文文档目录，结构与英文文档一样)
```
## markdown用法
文章中的url链接需要改成需要跳转位置的相对路径,可在路径后面添加标题来设置跳转到相应文档的相应标题处。其中标题中的特殊符号改写为"-"，标题末尾的特殊符号省略（如“？”需要去除），英文标题中的大写字母需要全部改写为小写字母。
```
../../about/question/flowcontrol.md#possible-causes-for-the-retry-rule-does-not-take-effect
```

文章中的图片需要使用MyImage标签。如下所示。
```
<MyImage src="/docs-img/sermant-rt-arch.png" />
```
src中的路径为图片路径，图片统一存放在.vuepress/public目录下，可在目录下新建图片目录，目前文档网站各个模块的md文件中的图片存放在.vuepress/public/docs-img中，路径只需要像示例一样书写即可。
## 主页（home）

可在zh及en文档目录下的第一个README.md文件中编辑主页内容，内容放置在slot-footer以及头部之间，使用markdown语法，内容会被填充到主页的footer上方位置。

## 博客（blog）

使用时进入到blog目录下，当需要发布一篇博客时，可在README.md中添加新的博客内容。
```yml
blogArr: 
    - name: 博客1
      description: '这里是描述'
      path: 'blogtest1'
      tags:
      - html
      - javascript
    - name: 博客2
      description: '这里是描述'
      path: 'blogtest2'
      tags:
      - html
      - javascript
```
name字段表示博客名称，description字段为描述信息，path为新创建的博客地址，tags下可添加自定义的标签，注意格式与上面保持一致即可。

## 【暂未开启】用户案例（story）
使用用户案例模块，可以先在story根目录下创建一个相应的用户案例文件夹(文件夹名称将会用作用户名)，并在新创建的文件夹下创建README\.md文件。(用户案例具体内容)，然后需要配置story根目录下的README.md文件,配置示例如下所示。
```yml
userArr: 
    - name: Huawei
      img: '/user-story-logo/huawei.gif'
      description: '这里是描述'
    - name: Huawei
      img: '/user-story-logo/huawei.gif'
      description: '这里是描述'
```
name字段为用户名称（同时也是用户案例相应的文件夹名称），img字段为用户头像路径，可将头像放置在public目录下的user-story-logo中，description为用户案例的相关描述信息。

## 文档 （document）
document根目录下存在一个README.md文件，可在该文件中编写整个模块的简介或者概览等信息。
然后可以创建多个文档信息，均为md类型文件，创建后可在其中编辑文档内容。编辑完后，为了能让这些文档信息能通过左侧侧边栏跳转，需要去.vuepress目录下的config.js中添加配置信息。在sidebar字段下添加相应内容，如下所示。
```javascript
sidebar: {
          "/zh/document/": ["", "one", "two"],
          "/zh/plugin/": [""],
          "/zh/blog/": [""],
        },
```
如自己新创建的一个文档叫one，则将文件名（不需要后缀）以数组的形式添加到"/zh/document/"属性后面，同时注意中英文的sidebar中都要进行这一步，否则可能造成中英文侧边栏不一致。

进阶用法：当层级较多时，可使用分组。
```
{
    title: "开始",
    path: "",
    collapsable: false,
    sidebarDepth: 1,
    children: ["", "QuickStart"],
},
```
使用对象来进行分组，title属性为分组组名，path为点击时跳转的路径，为空则不可以通过点击分组组名跳转，collapsable为分组是否可以收缩，设为false时不收缩，会显示分组组名下的所有组名，为true时可收缩，sidebarDepth属性为侧边栏标题深度，默认为1即可。

children属性为该分组下要显示的所有md文件，空字符串代表README.md文件，其中可继续进行嵌套，将字符串改为以上对象形式，可继续分级（但层数过多会导致侧边栏混乱，不推荐）。

侧边栏最终会显示md文件中的一级标题，若想要修改侧边栏显示的标题，直接修改md文件中的一级标题即可。由于侧边栏提取比较严格，md文件中的标题等级请严格从一级标题开始、每级递增不要跳级。当前设置会在点击某一篇侧边栏的md文件标题时，展开显示二级标题。若想提取更深层次标题，请修改配置.vuepress/config.js中的sidebarDepth属性。如下所示，1则会提取二级标题，2则会提取二级标题和三级标题，最大为2.
```
themeConfig: {
    logo: "/img/sermant-logo.png",
    displayAllHeaders: false,
    smoothScroll: true,
    sidebarDepth: 1,
    }
```
## 【暂未开启】关于 (about)
该模块中有四个子模块，可按照目录结构（在上方结构中有介绍），在相应目录下的README.md文件中编辑模块介绍信息。
其中比较特殊的是团队（team）模块,可以在其中添加团队成员信息,description字段为开发团队人员介绍信息，members为团队成员信息。可按以下示例进行编辑
```yml
members: 
    - name: xxx
      shortDesc: '简短介绍'
      avatar: '/user-story-logo/huawei.gif'
      location: '省份'
      blog: 'xx'
      github: 'xx'
```
name为团队成员名称，shortDesc为个人简短介绍（负责职位等），avatar为个人头像地址（可将头像存到public目录下），location可填写地区信息，blog和github可填写自己个人博客及github地址，这两个选项可以选填，不填的话就不会显示。