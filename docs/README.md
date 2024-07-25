# Development Guide
[简体中文](README_zh.md) | [English](README.md)

## How to deploy
First, ensure that the Node.js environment exists. You can download it from the official website. After [Node.js](https://nodejs.org/en/download/) is installed, you can use
```shell
node -v
npm -v
```
to check whether the installation is successful. Then go to the root directory, the SERMANT-WEBSITE directory, run
```shell
npm install
```
to install project required dependencies. Local deploy instruction is
```shell
npm run dev
```
Project packaging instruction is
```shell
```
## Structure
```
sermant-website
    └─docs
        ├─.vuepress
        │  ├─components (vue component)
        │  ├─public (static resources)
        │  │  ├─img （pictures）
        │  │  └─user-story-logo （user logos of user story）
        │  ├─styles （global style）
        │  └─theme  （theme configuration）
        │      ├─components
        │      └─styles
        ├─en （english document directory）
        │  ├─document
        │  │  ├─community (community documents)
        │  │  ├─developer-guide (development documents)
        │  │  ├─faq (frequently asked questions)
        │  │  ├─plugin (plugin documents)
        │  │  └─user-guide (user documents)
        │  ├─blog
        │  │  └─README.md (blogs)
        │  ├─QuickStart.md
        │  └─README.md (homepage)
        └─zh (same as en)
```
## Markdown usage
The url links in the article need to be changed to the relative path of the desired jump location, and the title can be added after the path to set the jump to the corresponding title of the corresponding document. The special symbol in the title is changed to "-", and the special symbol at the end of the title is omitted (such as "?"). All uppercase letters in the English title need to be changed to lowercase letters.
```
../../about/question/flowcontrol.md#possible-causes-for-the-retry-rule-does-not-take-effect
```

Images in the article need to be tagged 'MyImage'. As shown below.
```
<MyImage src="/docs-img/sermant-rt-arch.png" />
```
The path in src is the image path, and the images are stored in the .vuepress/public directory. You can create an image directory under the directory.

## Homepage

The home page content can be edited in the first README.md file in the zh and en document directories. The content is placed between slot-footer and the header using Markdown syntax. The content is populated above footer on the home page.

## Blog

Enter the blog directory, when you need to publish a blog, you can add blog content in the README.md.
```yml
blogArr: 
    - name: blog1
      description: 'This is description'
      path: 'blogtest1'
      tags:
      - html
      - javascript
    - name: blog2
      description: 'This is description'
      path: 'blogtest2'
      tags:
      - html
      - javascript
```
The name field indicates the name of the blog, the description field indicates the description information, and the path indicates the address of the newly created blog. You can add user-defined tag to tags. Note that the format of the tags is consistent with that above.

## 文档 （document）
There is a README.md file in the document root where you can write information such as an introduction or overview of the entire module.
You can then create multiple document information, all of which are md files, in which you can edit the document content. After editing, in order to make the documentation information jump through the left sidebar, you need to go to the .vuepress directory config.js to add configuration information. Add the appropriate content under the sidebar field, as shown below.
```javascript
sidebar: {
          "/en/document/": ["", "one", "two"],
          "/en/plugin/": [""],
          "/en/blog/": [""],
        },
```
If you create a new document called one, add the file name (without suffix) to the "/zh/document/" property in the form of an array. At the same time, note that this step should be carried out in the sidebar in both English and Chinese, otherwise it may cause inconsistency between the Chinese and English sidebars.

Advanced usage: Groups can be used when there are more levels.
```
{
    title: "begin",
    path: "",
    collapsable: false,
    sidebarDepth: 1,
    children: ["", "QuickStart"],
},
```
Use the object to group, title attribute is the group name and path is the path to be jumped when you click. If empty, you cannot click the group name to jump. Collapsable refers to whether the group can be shrunk; if set to false, all group names in the group name will be collapsable, and if true, all group names in the group name can be shrunk. The sidebarDepth property is the depth of the sidebar title. The default value is 1.

The children attribute is all the md files to be displayed under this group, and the empty string represents the README.md file, where nesting can continue. The string can be changed to the above object form, and the grading can continue (but too many layers can cause confusion in the sidebar and is not recommended).

The sidebar will eventually display the Level 1 title in the md file. If you want to change the title displayed in the sidebar, you can directly modify the level 1 title in the md file. Due to the strict extraction of the sidebar, the title level in the md file should strictly start with the first-level title, and do not skip each level. The current setting expands to show secondary headings when you click on the md file title in a sidebar. To extract deeper titles, modify the sidebarDepth in the configuration file .vuepress/config.js. As shown below, 1 will extract the second-level title, and 2 will extract the second-level title and third-level title, with a maximum of 2.
```
themeConfig: {
    logo: "/img/sermant-logo.png",
    displayAllHeaders: false,
    smoothScroll: true,
    sidebarDepth: 1,
    }
```
