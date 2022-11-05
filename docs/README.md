# 开发说明

## 如何使用
首先确保存在node环境，可先从官网下载。[nodejs中文官网](https://nodejs.org/zh-cn/download/)
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
        │  ├─public （各种静态资源）
        │  │  ├─img （图片）
        │  │  └─user-story-logo （用户案例中的用户logo）
        │  ├─styles （全局样式）
        │  └─theme  （主题配置）
        │      ├─components
        │      └─styles
        ├─en （英文文档目录）
        │  ├─about （关于）
        │  │  ├─community （社区指南）
        │  │  ├─question  （常见问题）
        │  │  ├─team  （开发团队）
        │  │  └─version （版本发布）
        │  ├─blog （博客）
        │  │  └─README.md(博客配置)
        │  │
        │  ├─document （文档）
        │  ├─plugin （插件生态）
        │  └─story （用户案例）
        │  └─README.md(主页内容及配置)   
        └─zh （中文文档目录，结构与英文文档一样）
```
## 主页（home）

可在zh及en文档目录下的第一个README.md文件中编辑主页内容，内容放置在slot-footer以及头部之间，使用markdown语法，内容会被填充到主页的footer上方位置。

## 博客（blog）

使用时进入到blog目录下，当需要发布一篇博客时，可新建一个文件夹（文件夹名称可自定义），并在该目录下新建README.md(博客内容)。并在blog根目录下的README.md中添加配置。
```yml
blogArr: 
    - name: 博客1
      description: '这里是描述'
      path: 'blogtest1'
      tags:
      - html
      - javascript
    - name: 博客1
      description: '这里是描述'
      path: 'blogtest1'
      tags:
      - html
      - javascript
```
name字段表示博客名称，description字段为描述信息，path为新创建的博客文件夹名称，tags下可添加自定义的标签，注意格式与上面保持一致即可。

## 用户案例（story）
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
          "/zh/story/": [""],
          "/zh/blog/": [""],
          "/zh/about/question/": [""],
          "/zh/about/version/": [""],
          "/zh/about/community/": [""],
          "/zh/about/team/": [""],
        },
```
如自己新创建的一个文档叫one，则将文件名（不需要后缀）以数组的形式添加到"/zh/document/"属性后面，同时注意中英文的sidebar中都要进行这一步，否则可能造成中英文侧边栏不一致。

## 插件生态 （plugin）
使用方法与文档相同，只不过配置时需要将对应信息放置在"/zh/plugin/"后面，同时也要注意中英文都需要进行配置。

## 关于 (about)
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