(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{465:function(a,t,e){"use strict";e.r(t);var s=e(26),n=Object(s.a)({},(function(){var a=this,t=a._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[t("h1",{attrs:{id:"quick-start"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#quick-start"}},[a._v("#")]),a._v(" Quick Start")]),a._v(" "),t("h2",{attrs:{id:"download-or-compile"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#download-or-compile"}},[a._v("#")]),a._v(" Download or Compile")]),a._v(" "),t("p",[a._v("Click "),t("a",{attrs:{href:"https://github.com/huaweicloud/Sermant/releases",target:"_blank",rel:"noopener noreferrer"}},[a._v("here"),t("OutboundLink")],1),a._v(" to download "),t("strong",[a._v("Sermant")]),a._v(" binary package. If you will to compile the project yourself, please follow the following steps.")]),a._v(" "),t("p",[a._v("Execute "),t("em",[a._v("maven")]),a._v(" command to package the "),t("strong",[a._v("Sermant")]),a._v(" project's "),t("a",{attrs:{href:"https://github.com/huaweicloud/Sermant-examples/tree/main/sermant-template",target:"_blank",rel:"noopener noreferrer"}},[a._v("demo module"),t("OutboundLink")],1),a._v(".")]),a._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-shell"}},[t("code",[a._v("mvn clean package "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-Dmaven.test.skip")]),a._v("\n")])])]),t("h2",{attrs:{id:"start-sermant"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#start-sermant"}},[a._v("#")]),a._v(" Start Sermant")]),a._v(" "),t("p",[t("strong",[a._v("Prepare and start zookeeper in advance")]),a._v(", start "),t("strong",[a._v("Sermant")]),a._v(" demo project:")]),a._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-shell"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# Run under Linux")]),a._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[a._v("java")]),a._v(" "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-cp")]),a._v(" sermant-template/demo-application/target/demo-application.jar "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("\n  -javaagent:sermant-agent-x.x.x/agent/sermant-agent.jar"),t("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v("appName"),t("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v("test "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("\n  com.huawei.example.demo.DemoApplication\n")])])]),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-shell"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# Run under Windows")]),a._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[a._v("java")]),a._v(" "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-cp")]),a._v(" sermant-template"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("demo-application"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("target"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("demo-application.jar ^\n  -javaagent:sermant-agent-x.x.x"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("agent"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("\\")]),a._v("sermant-agent.jar"),t("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v("appName"),t("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v("test ^\n  com.huawei.example.demo.DemoApplication\n")])])]),t("p",[a._v("Check whether the beginning of the demo-application log file contains the following content:")]),a._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[a._v("[INFO] Loading core library... \n[INFO] Building argument map... \n[INFO] Loading sermant agent... \n[INFO] Load sermant done. \n")])])]),t("p",[a._v("If the log is normally output as above, it means that the sermant is mounted successfully.")])])}),[],!1,null,null,null);t.default=n.exports}}]);