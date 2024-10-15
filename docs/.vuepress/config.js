module.exports = {
  base: `${process.env.VERSIONS_PATH || "/"}`,
  head: [
    [
      'link', { rel: 'icon', href: '/img/logo.svg' }
    ]
  ],
  plugins: ["@vuepress/back-to-top"],
  extend: "@vuepress/theme-default",
  locales: {
    "/zh/": {
      lang: "zh-CN",
      title: "Sermant",
      description: "基于Java字节码增强技术的云原生无代理服务网格",
    },
    "/en/": {
      lang: "en-US",
      title: "Sermant",
      description: "A Proxyless Service Mesh based on Bytecode Enhancement",
    },
  },
  themeConfig: {
    logo: "/img/sermant-logo.png",
    displayAllHeaders: false,
    smoothScroll: true,
    sidebarDepth: 1,
    locales: {
      "/zh/": {
        selectText: "Languages",
        label: "简体中文",
        lastUpdated: "上次更新",
        nav: [
          { text: "文档", link: "/zh/document/" },
          { text: "博客", link: "/zh/blog/" },
          { text: "Github", link: "https://github.com/sermant-io/Sermant" },
        ],
        sidebar: {
          "/zh/document/": [
            {
              title: "开始",
              path: "",
              collapsable: true,
              sidebarDepth: 2,
              children: ["", "QuickStart"],
            },
            {
              title: "用户使用手册",
              path: "",
              collapsable: true,
              sidebarDepth: 2,
              children: [
                "user-guide/",
                "user-guide/sermant-agent",
                "user-guide/sermant-backend",
                "user-guide/sermant-injector",
                "user-guide/configuration-center",
                "user-guide/sermant-xds"
              ],
            },
            {
              title: "插件使用手册",
              path: "",
              collapsable: true,
              sidebarDepth: 2,
              children: [
                "plugin/",
                "plugin/dynamic-config",
                "plugin/springboot-registry",
                "plugin/register-migration",
                "plugin/flowcontrol",
                "plugin/graceful",
                "plugin/removal",
                "plugin/loadbalancer",
                "plugin/router",
                "plugin/tag-transmission",
                "plugin/monitor",
                "plugin/visibility",
                "plugin/mq-consume-prohibition",
                "plugin/database-write-prohibition",
              ],
            },
            {
              title: "开发者指南",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "developer-guide/",
                "developer-guide/bytecode-enhancement",
                "developer-guide/package-structure",
                "developer-guide/plugin-configuration",
                "developer-guide/dynamic-config-func",
                "developer-guide/sermant-xds-service",
                "developer-guide/sermant-httpserver-service",
                "developer-guide/heartbeat-func",
                "developer-guide/trace-tracking-func",
                "developer-guide/log-func",
                "developer-guide/third-party-copyright",
                "developer-guide/version-manage",
                "developer-guide/config-manage"
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
                "community/vulnerability",
                "community/sig",
              ],
            },
            {
              title: "FAQ",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "faq/",
                "faq/upgrade",
                "faq/performance",
                "faq/development-debug",
                "faq/framework",
                "faq/flowcontrol",
                "faq/registry",
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
          { text: "Github", link: "https://github.com/sermant-io/Sermant" },
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
                "user-guide/sermant-backend",
                "user-guide/sermant-injector",
                "user-guide/configuration-center",
                "user-guide/sermant-xds"
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
                "plugin/springboot-registry",
                "plugin/register-migration",
                "plugin/flowcontrol",
                "plugin/graceful",
                "plugin/removal",
                "plugin/loadbalancer",
                "plugin/router",
                "plugin/monitor",
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
                "developer-guide/bytecode-enhancement",
                "developer-guide/package-structure",
                "developer-guide/plugin-configuration",
                "developer-guide/dynamic-config-func",
                "developer-guide/sermant-xds-service",
                "developer-guide/heartbeat-func",
                "developer-guide/trace-tracking-func",
                "developer-guide/log-func",
                "developer-guide/third-party-copyright",
                "developer-guide/version-manage",
                "developer-guide/config-manage"
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
                "community/vulnerability",
                "community/sig"
              ],
            },
            {
              title: "FAQ",
              path: "",
              collapsable: true,
              sidebarDepth: 1,
              children: [
                "faq/",
                "faq/framework",
                "faq/script",
                "faq/registry",
                "faq/flowcontrol",
              ],
            },
          ],
          "/en/blog/": [""],
        },
      },
    },
  },
  configureWebpack: {
    node: {
      global: true,
      process: true
    }
  }
};
