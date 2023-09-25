(window.webpackJsonp=window.webpackJsonp||[]).push([[79],{526:function(a,t,e){"use strict";e.r(t);var r=e(26),s=Object(r.a)({},(function(){var a=this,t=a._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[t("h1",{attrs:{id:"sermant-框架常见问题"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#sermant-框架常见问题"}},[a._v("#")]),a._v(" Sermant 框架常见问题")]),a._v(" "),t("p",[a._v("本文档主要说明在使用Sermant框架时遇到的常见问题。")]),a._v(" "),t("h2",{attrs:{id:"启动参数appname是什么参数"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#启动参数appname是什么参数"}},[a._v("#")]),a._v(" 启动参数appName是什么参数?")]),a._v(" "),t("ul",[t("li",[t("code",[a._v("appName")]),a._v("表示宿主应用的名称，多个实例"),t("code",[a._v("appName")]),a._v("可以相同，"),t("code",[a._v("实例id")]),a._v("不同。")])]),a._v(" "),t("h2",{attrs:{id:"sermant提供哪些方面的服务治理插件"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#sermant提供哪些方面的服务治理插件"}},[a._v("#")]),a._v(" Sermant提供哪些方面的服务治理插件?")]),a._v(" "),t("ul",[t("li",[a._v("Sermant有着很强的扩展性，除了框架本身提供的服务治理插件("),t("RouterLink",{attrs:{to:"/zh/document/plugin/flowcontrol.html"}},[a._v("限流降级功能介绍")]),a._v("，"),t("RouterLink",{attrs:{to:"/zh/document/plugin/service-registry.html"}},[a._v("服务注册功能介绍")]),a._v("等)之外， 开发者可以根据业务需求去开发插件包括(数据收集，链路等)。")],1)]),a._v(" "),t("h2",{attrs:{id:"如何同时挂载多个sermant"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#如何同时挂载多个sermant"}},[a._v("#")]),a._v(" 如何同时挂载多个Sermant？")]),a._v(" "),t("ul",[t("li",[a._v("如果宿主应用需要挂载多个Sermant时请按照以下步骤处理其他的Sermant。")])]),a._v(" "),t("blockquote",[t("p",[a._v("注：除非必要，否则不建议挂载多个Sermant")])]),a._v(" "),t("h3",{attrs:{id:"步骤一-使用shade插件重定向类路径"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#步骤一-使用shade插件重定向类路径"}},[a._v("#")]),a._v(" 步骤一：使用shade插件重定向类路径")]),a._v(" "),t("ul",[t("li",[a._v("修改sermant-agentcore-core、sermant-agentcore-implement、sermant-agentcore-premain、sermant-common的pom.xml文件。在打包时使用Shade插件进行类重定向。具体修改见下图（路径重定向后的前缀请根据您的项目进行指定）。")])]),a._v(" "),t("MyImage",{attrs:{src:"/docs-img/package.png"}}),a._v(" "),t("h3",{attrs:{id:"步骤二-修改premain-class路径"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#步骤二-修改premain-class路径"}},[a._v("#")]),a._v(" 步骤二：修改Premain-Class路径")]),a._v(" "),t("ul",[t("li",[a._v("在sermant-agentcore-premain的pom.xml文件中修改AgentPremain路径。（路径前缀请跟第一步保持一致，防止找不到AgentPremain类）")])]),a._v(" "),t("MyImage",{attrs:{src:"/docs-img/premain-classpath.png"}}),a._v(" "),t("h3",{attrs:{id:"步骤三-修改logger实例。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#步骤三-修改logger实例。"}},[a._v("#")]),a._v(" 步骤三：修改Logger实例。")]),a._v(" "),t("ul",[t("li",[a._v("修改AgentPremain类中获取日志Logger实例的方法参数，防止不同Sermant使用同一个Logger实例")])]),a._v(" "),t("MyImage",{attrs:{src:"/docs-img/sermant-log.png"}}),a._v(" "),t("ul",[t("li",[a._v("按照以上步骤修改之后，多个Sermant启动将不会产生冲突。")])]),a._v(" "),t("blockquote",[t("p",[a._v("注："),t("br"),a._v("\n1、不要用-D参数去修改Sermant的配置信息，否则会同时修改所有Sermant。"),t("br"),a._v("\n2、使用动态配置时，保证不同Sermant的group信息不一致，或者使用不一样的配置中心。否则所有Sermant会公用同一个动态配置。"),t("br"),a._v("\n3、如果不同Sermant加载同样的插件时，请按照步骤一的方式将插件的类路径进行重定向，防止冲突。")])])],1)}),[],!1,null,null,null);t.default=s.exports}}]);