module.exports = {
  head: [
      [
        'link', { rel: 'icon', href: '/img/logo.svg'}
      ]
  ],
  extend: "@vuepress/theme-default",
  locales: {
    "/zh/": {
      lang: "zh-CN",
      title: "Sermant",
      description: "一种基于Java Agent的无代理服务网格解决方案",
    },
    "/en/": {
      lang: "en-US",
      title: "Sermant",
      description: "A Proxyless Service Mesh Solution Based on Java Agent",
    },
  },
  themeConfig: {
    logo: "/img/sermant-logo.png",
    displayAllHeaders: false,
    smoothScroll: true,
    sidebarDepth: 1,
    plugins: ["@vuepress/back-to-top"],
    locales: {
      "/zh/": {
        selectText: "选择语言",
        label: "简体中文",
        lastUpdated: "上次更新",
        nav: [
          { text: "文档", link: "/zh/document/" },
          { text: "插件生态", link: "/zh/plugin/" },
          { text: "博客", link: "/zh/blog/" },
          {
            text: "关于",
            items: [
              { text: "常见问题", link: "/zh/about/question/framework" },
              { text: "版本发布", link: "/zh/about/version/" },
              { text: "社区指南", link: "/zh/about/community/" },
            ],
          },
          { text: "Github", link: "https://github.com/huaweicloud/Sermant" },
        ],
        sidebar: {
          "/zh/document/": [
            {
              title: "开始",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: ["", "QuickStart"],
            },
            {
              title: "用户指南",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: [
                "UserGuide/",
                "UserGuide/agentcore",
                "UserGuide/entrance",
                "UserGuide/backend",
              ],
            },
            {
              title: "贡献者指南",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: ["CONTRIBUTING"],
            },
            {
              title: "FAQ",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: ["FAQ/framework", "FAQ/plugin"],
            },
          ],
          "/zh/plugin/": [
            "flowcontrol",
            "loadbalancer",
            "dynamic-config",
            {
              title: "注册",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "registry/",
                "registry/dubbo-registry-migiration",
                "registry/spring-cloud-registry-migiration",
              ],
            },
            "graceful",
            "router",
            "monitor",
          ],
          "/zh/blog/": [""],
          "/zh/about/question/": ["framework", "flowcontrol", "registry"],
          "/zh/about/version/": [""],
          "/zh/about/community/": [""],
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
          { text: "Blog", link: "/en/blog/" },
          {
            text: "About",
            items: [
              { text: "Common Problem", link: "/en/about/question/framework" },
              { text: "Release Version", link: "/en/about/version/" },
              { text: "Community Guide", link: "/en/about/community/" },
            ],
          },
          { text: "Github", link: "https://github.com/huaweicloud/Sermant" },
        ],
        sidebar: {
          "/en/document/": [
            {
              title: "Start",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: ["", "QuickStart"],
            },
            {
              title: "User Guide",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: [
                "UserGuide/",
                "UserGuide/agentcore",
                "UserGuide/entrance",
                "UserGuide/backend",
              ],
            },
            {
              title: "Contributor Guide",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: ["CONTRIBUTING"],
            },
            {
              title: "FAQ",
              path: "",
              collapsable: false,
              sidebarDepth: 1,
              children: ["FAQ/framework", "FAQ/plugin"],
            },
          ],
          "/en/plugin/": [
            "flowcontrol",
            "loadbalancer",
            "dynamic-config",
            {
              title: "Registry",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "registry/",
                "registry/dubbo-registry-migiration",
                "registry/spring-cloud-registry-migiration",
              ],
            },
            "graceful",
            "router",
            "monitor",
          ],
          "/en/blog/": [""],
          "/en/about/question/": ["framework", "flowcontrol", "registry"],
          "/en/about/version/": [""],
          "/en/about/community/": [""],
        },
      },
    },
  },
  configureWebpack:{
    node:{
      global:true,
      process:true
    }
  }
};
