module.exports = {
  extend: "@vuepress/theme-default",
  locales: {
    "/zh/": {
      lang: "zh-CN",
      title: "Sermant",
      description: "一种基于Java Agent的无代理服务网络解决方案",
    },
    "/en/": {
      lang: "en-US",
      title: "Sermant",
      description: "A proxyless service mesh solution based on Java Agent",
    },
  },
  themeConfig: {
    logo: "/img/sermant-logo.png",
    displayAllHeaders: true,
    smoothScroll: true,
    plugins: ["@vuepress/back-to-top"],
    locales: {
      "/zh/": {
        selectText: "选择语言",
        label: "简体中文",
        lastUpdated: "上次更新",
        nav: [
          { text: "文档", link: "/zh/document/" },
          { text: "插件生态", link: "/zh/plugin/" },
          { text: "用户案例", link: "/zh/story/" },
          { text: "博客", link: "/zh/blog/" },
          {
            text: "关于",
            items: [
              { text: "常见问题", link: "/zh/about/question/" },
              { text: "版本发布", link: "/zh/about/version/" },
              { text: "社区指南", link: "/zh/about/community/" },
              { text: "开发团队", link: "/zh/about/team/" },
            ],
          },
          { text: "Github", link: "https://github.com/huaweicloud/Sermant" },
        ],
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
      },
      "/en/": {
        selectText: "Languages",
        label: "English",
        ariaLabel: "Languages",
        lastUpdated: "Last Updated",
        nav: [
          { text: "Document", link: "/en/document/" },
          { text: "Plugin", link: "/en/plugin/" },
          { text: "User Story", link: "/en/story/" },
          { text: "Blog", link: "/en/blog/" },
          {
            text: "About",
            items: [
              { text: "Common Problem", link: "/en/about/question/" },
              { text: "Release Version", link: "/en/about/version/" },
              { text: "Community Guide", link: "/en/about/community/" },
              { text: "Development Team", link: "/en/about/team/" },
            ],
          },
          { text: "Github", link: "https://github.com/huaweicloud/Sermant" },
        ],
        sidebar: {
          "/en/document/": ["", "one", "two"],
          "/en/plugin/": [""],
          "/en/story/": [""],
          "/en/blog/": [""],
          "/en/about/question/": [""],
          "/en/about/version/": [""],
          "/en/about/community/": [""],
          "/en/about/team/": [""],
        },
      },
    },
  },
};
