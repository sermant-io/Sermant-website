(window.webpackJsonp=window.webpackJsonp||[]).push([[66],{512:function(a,e,t){"use strict";t.r(e);var r=t(26),s=Object(r.a)({},(function(){var a=this,e=a._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[e("h1",{attrs:{id:"快速开始"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#快速开始"}},[a._v("#")]),a._v(" 快速开始")]),a._v(" "),e("p",[a._v("下面是一个简单的演示，新用户只需4个步骤即可使用Sermant")]),a._v(" "),e("h2",{attrs:{id:"准备工作"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#准备工作"}},[a._v("#")]),a._v(" 准备工作")]),a._v(" "),e("ul",[e("li",[e("a",{attrs:{href:"https://github.com/sermant-io/Sermant/releases/download/v1.4.0/sermant-1.4.0.tar.gz",target:"_blank",rel:"noopener noreferrer"}},[a._v("下载"),e("OutboundLink")],1),a._v(" Sermant\nRelease包（当前版本推荐1.4.0版本）")]),a._v(" "),e("li",[e("a",{attrs:{href:"https://github.com/sermant-io/Sermant-examples/releases/download/v1.4.0/sermant-examples-flowcontrol-demo-1.4.0.tar.gz",target:"_blank",rel:"noopener noreferrer"}},[a._v("下载"),e("OutboundLink")],1),a._v(" Demo二进制产物压缩包")]),a._v(" "),e("li",[e("a",{attrs:{href:"https://zookeeper.apache.org/releases#download",target:"_blank",rel:"noopener noreferrer"}},[a._v("下载"),e("OutboundLink")],1),a._v(" 并启动ZooKeeper")])]),a._v(" "),e("h2",{attrs:{id:"获取demo二进制产物"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#获取demo二进制产物"}},[a._v("#")]),a._v(" 获取Demo二进制产物")]),a._v(" "),e("p",[a._v("解压Demo二进制产物压缩包，即可得到"),e("code",[a._v("spring-provider.jar")]),a._v("。")]),a._v(" "),e("h2",{attrs:{id:"修改sermant配置"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#修改sermant配置"}},[a._v("#")]),a._v(" 修改Sermant配置")]),a._v(" "),e("p",[a._v("修改"),e("code",[a._v("${sermant-path}/sermant-agent-x.x.x/agent/config/config.properties")]),a._v("文件中"),e("code",[a._v("agent.service.heartbeat.enable")]),a._v("和"),e("code",[a._v("agent. service.gateway.enable")]),a._v("配置为true，以此来开启Sermant的心跳服务和网关服务，如下所示：")]),a._v(" "),e("div",{staticClass:"language-properties extra-class"},[e("pre",{pre:!0,attrs:{class:"language-properties"}},[e("code",[e("span",{pre:!0,attrs:{class:"token key attr-name"}},[a._v("agent.service.heartbeat.enable")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("=")]),e("span",{pre:!0,attrs:{class:"token value attr-value"}},[a._v("true")]),a._v("\n"),e("span",{pre:!0,attrs:{class:"token key attr-name"}},[a._v("agent.service.gateway.enable")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("=")]),e("span",{pre:!0,attrs:{class:"token value attr-value"}},[a._v("true")]),a._v("\n")])])]),e("blockquote",[e("p",[a._v("说明：${sermant-path}为Sermant Release包下载所在路径")])]),a._v(" "),e("h2",{attrs:{id:"启动backend"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#启动backend"}},[a._v("#")]),a._v(" 启动Backend")]),a._v(" "),e("p",[a._v("在"),e("code",[a._v("${sermant-path}/sermant-agent-x.x.x/server/sermant")]),a._v("目录执行以下命令：")]),a._v(" "),e("div",{staticClass:"language-shell extra-class"},[e("pre",{pre:!0,attrs:{class:"language-shell"}},[e("code",[e("span",{pre:!0,attrs:{class:"token function"}},[a._v("java")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-jar")]),a._v(" sermant-backend-x.x.x.jar\n")])])]),e("blockquote",[e("p",[a._v("说明：${sermant-path}为Sermant Release包下载所在路径")])]),a._v(" "),e("h2",{attrs:{id:"启动demo微服务"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#启动demo微服务"}},[a._v("#")]),a._v(" 启动Demo微服务")]),a._v(" "),e("p",[a._v("参考如下命令启动Demo微服务")]),a._v(" "),e("div",{staticClass:"language-shell extra-class"},[e("pre",{pre:!0,attrs:{class:"language-shell"}},[e("code",[e("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# linux mac")]),a._v("\n"),e("span",{pre:!0,attrs:{class:"token function"}},[a._v("java")]),a._v(" -javaagent:"),e("span",{pre:!0,attrs:{class:"token variable"}},[a._v("${sermant-path}")]),a._v("/sermant-agent-x.x.x/agent/sermant-agent.jar "),e("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-jar")]),a._v(" spring-provider.jar\n\n"),e("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# windows")]),a._v("\n"),e("span",{pre:!0,attrs:{class:"token function"}},[a._v("java")]),a._v(" -javaagent:"),e("span",{pre:!0,attrs:{class:"token variable"}},[a._v("${sermant-path}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("sermant-agent-x.x.x"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("agent"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("sermant-agent.jar "),e("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-jar")]),a._v(" spring-provider.jar\n")])])]),e("blockquote",[e("p",[a._v("说明：${sermant-path}为Sermant Release包下载所在路径")])]),a._v(" "),e("h2",{attrs:{id:"验证"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#验证"}},[a._v("#")]),a._v(" 验证")]),a._v(" "),e("p",[a._v("打开浏览器并导航到URL"),e("code",[a._v("http://localhost:8900")]),a._v("，如下图所示：")]),a._v(" "),e("MyImage",{attrs:{src:"/docs-img/backend_sermant_info.jpg"}})],1)}),[],!1,null,null,null);e.default=s.exports}}]);