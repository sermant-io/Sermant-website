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
          { text: "博客", link: "/zh/blog/" },
          { text: "Github", link: "https://github.com/huaweicloud/Sermant" },
        ],
        sidebar: {
          "/zh/document/": [
            {
              title: "开始",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: ["", "QuickStart"],
            },
            {
              title: "用户使用手册",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "user-guide/",
                "user-guide/sermant-agent",
                "user-guide/backend",
                "user-guide/configuration-center",
                "user-guide/injector",
              ],
            },
            {
              title: "插件使用手册",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "plugin/",
                "plugin/dynamic-config",
                "plugin/flowcontrol",
                "plugin/graceful",
                "plugin/loadbalancer",
                "plugin/monitor",
                "plugin/router",
                "plugin/registry/",
                "plugin/registry/springboot-registry",
                "plugin/registry/spring-cloud-registry-migiration",
                "plugin/registry/dubbo-registry-migiration",
                "plugin/visibility",
              ],
            },
            {
              title: "开发者指南",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "developer-guide/",
                "developer-guide/dev-complex-plugin",
                "developer-guide/third-party-copyright",
                "developer-guide/version-manage",
              ],
            },
            {
              title: "加入社区",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "community/",
                "community/contributing",
              ],
            },
            {
              title: "FAQ",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "FAQ/",
                "FAQ/framework",
                "FAQ/registry",
                "FAQ/flowcontrol",
              ],
            },
          ],
          "/zh/blog/": [""],
        },
      },
      "/en/": {
        selectText: "Languages",
        label: "English",
        ariaLabel: "Languages",
        lastUpdated: "Last Updated",
        nav: [
          { text: "Document", link: "/en/document/" },
          { text: "Blog", link: "/en/blog/" },
          { text: "Github", link: "https://github.com/huaweicloud/Sermant" },
        ],
        sidebar: {
          "/en/document/": [
            {
              title: "Start",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: ["", "QuickStart"],
            },
            {
              title: "User Guide",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "user-guide/",
                "user-guide/sermant-agent",
                "user-guide/backend",
                "user-guide/configuration-center",
                "user-guide/injector",
              ],
            },
            {
              title: "Plugin Guide",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "plugin/",
                "plugin/dynamic-config",
                "plugin/flowcontrol",
                "plugin/graceful",
                "plugin/loadbalancer",
                "plugin/monitor",
                "plugin/router",
                "plugin/registry/",
                "plugin/registry/springboot-registry",
                "plugin/registry/spring-cloud-registry-migiration",
                "plugin/registry/dubbo-registry-migiration",
                "plugin/visibility",
              ],
            },
            {
              title: "Developer Guide",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "developer-guide/",
                "developer-guide/dev-complex-plugin",
                "developer-guide/third-party-copyright",
                "developer-guide/version-manage",
              ],
            },
            {
              title: "Community Guide",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "community/",
                "community/contributing",
              ],
            },
            {
              title: "FAQ",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "FAQ/",
                "FAQ/framework",
                "FAQ/registry",
                "FAQ/flowcontrol",
              ],
            },
          ],
          "/en/blog/": [""],
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
