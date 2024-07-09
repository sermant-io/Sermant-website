(window.webpackJsonp=window.webpackJsonp||[]).push([[31],{477:function(e,t,a){"use strict";a.r(t);var n=a(26),s=Object(n.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"plugin-structure"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#plugin-structure"}},[e._v("#")]),e._v(" Plugin Structure")]),e._v(" "),t("p",[e._v("A "),t("strong",[e._v("Sermant")]),e._v(" plugin can contain the following modules：")]),e._v(" "),t("ul",[t("li",[t("code",[e._v("plugin main mpdule (plugin)")]),e._v(", this module is mainly used to declare bytecode enhancement logic and plug-in service interface definition.")]),e._v(" "),t("li",[t("code",[e._v("plugin service module (service)")]),e._v(", this module is used to provide the plug-in service interface implementation for the plugin package.")])]),e._v(" "),t("p",[e._v("Before we start, we need to make a clear convention to avoid class conflicts, in the "),t("code",[e._v("plugin main module (plugin)")]),e._v(", developers can only use the native Java apis and the apis in the "),t("a",{attrs:{href:"#Sermant-Agentcore-Module"}},[e._v("Sermant-Agentcore Module")]),e._v(". they cannot rely on or use any third-party dependencies other than "),t("code",[e._v("byte-buddy")]),e._v(". If you need to use other third-party dependencies according to business requirements, you can only define the functional interface in the "),t("code",[e._v("plugin main module (plugin)")]),e._v(", and write the interface implementation in the "),t("code",[e._v("plugin service module (service)")]),e._v(", and follow the above conventions in development, in order to make better use of the class isolation capabilities provided by "),t("strong",[e._v("Sermant")]),e._v(".")]),e._v(" "),t("h4",{attrs:{id:"sermant-agentcore-module"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#sermant-agentcore-module"}},[e._v("#")]),e._v(" Sermant-Agentcore Module")]),e._v(" "),t("blockquote",[t("p",[t("a",{attrs:{href:"https://github.com/sermant-io/Sermant/tree/develop/sermant-agentcore/sermant-agentcore-core",target:"_blank",rel:"noopener noreferrer"}},[e._v("Sermant - Agent core Module"),t("OutboundLink")],1),e._v(" is the core module of Sermant Agent, which provides encapsulation of core capabilities such as bytecode enhancement capability, class isolation capability, plug-in capability, and basic services of service governance.")])]),e._v(" "),t("h2",{attrs:{id:"plugin-main-module"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#plugin-main-module"}},[e._v("#")]),e._v(" Plugin Main Module")]),e._v(" "),t("p",[e._v("The plugin master module is the main implementation of the plugin, and the developer needs to declare the plugin's "),t("strong",[e._v("enhanced logic")]),e._v(" in this module. For "),t("strong",[e._v("enhancement logic")]),e._v("  development, refer to the "),t("RouterLink",{attrs:{to:"/en/document/developer-guide/bytecode-enhancement.html"}},[e._v("Bytecode Enhancement")]),e._v(" section. To avoid class conflicts, do not introduce third-party dependencies into the main module of the plugin.")],1),e._v(" "),t("h2",{attrs:{id:"plugin-service-module"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#plugin-service-module"}},[e._v("#")]),e._v(" Plugin Service Module")]),e._v(" "),t("p",[t("strong",[e._v("Plugin Service Module")]),e._v(" Compared to "),t("strong",[e._v("Plugin Main Module")]),e._v("：")]),e._v(" "),t("ul",[t("li",[e._v("Used to write "),t("a",{attrs:{href:"#Plugin-Service"}},[e._v("plugin service")]),e._v(" where it is not possible to declare the "),t("strong",[e._v("enhanced logic")]),e._v(" required by the plugin.")]),e._v(" "),t("li",[e._v("You are free to add any third-party dependencies you need, and you need to build dependent jar packages when you package your build.")]),e._v(" "),t("li",[e._v("Its corresponding "),t("a",{attrs:{href:"#Plugin-Main-Module"}},[e._v("plugin main module")]),e._v(" needs to be introduced in its pom in the form of "),t("code",[e._v("provided")]),e._v(".")])]),e._v(" "),t("h2",{attrs:{id:"plugin-service"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#plugin-service"}},[e._v("#")]),e._v(" Plugin Service")]),e._v(" "),t("p",[t("strong",[e._v("Plugin Services")]),e._v(" are mainly divided into two parts:")]),e._v(" "),t("p",[t("strong",[e._v("Service Interface Definition")]),e._v(" is used in the "),t("a",{attrs:{href:"#Plugin-Main-Module"}},[e._v("plugin main module")]),e._v(" to describe the capabilities provided by the service. When defining the plug-in service of a plugin, you need to inherit the plugin service base interface "),t("a",{attrs:{href:"https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/service/PluginService.java",target:"_blank",rel:"noopener noreferrer"}},[e._v("io.sermant.core.plugin.service.PluginService"),t("OutboundLink")],1),e._v(",. This interface provides the "),t("code",[e._v("start()")]),e._v(" method to be called when "),t("strong",[e._v("Sermant")]),e._v(" is started, and the "),t("code",[e._v("stop()")]),e._v(" method to be called when the JVM is stopped.")]),e._v(" "),t("p",[t("strong",[e._v("Service interface implementation")]),e._v(" In the "),t("a",{attrs:{href:"#Plugin-Service-Module"}},[e._v("plugin service module")]),e._v(", in the "),t("a",{attrs:{href:"#Plugin-Main-Module"}},[e._v("plugin main module")]),e._v(" can be loaded through the "),t("strong",[e._v("SPI")]),e._v(" mechanism and use the interface implementation of the plugin service.")]),e._v(" "),t("h3",{attrs:{id:"development-examples"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#development-examples"}},[e._v("#")]),e._v(" Development Examples")]),e._v(" "),t("p",[e._v("This development example is based on a project created in the "),t("RouterLink",{attrs:{to:"/en/document/developer-guide/"}},[e._v("Create your First Plugin")]),e._v(" documentation.")],1),e._v(" "),t("blockquote",[t("p",[e._v("Note：The plugin service interface and its implementation described in this example already exist in the template project and can be used directly without repeated creation. This example describes the creation process in detail to help developers understand the development process more easily.")])]),e._v(" "),t("p",[e._v("When developing a plugin service, we first need to define the interface of the plugin service in "),t("a",{attrs:{href:"#Plugin-Main-Module"}},[e._v("plugin main module")]),e._v(", which is the index when using the plugin service. In engineering "),t("code",[e._v("template\\template-plugin")]),e._v(" created under "),t("code",[e._v("com.huaweicloud.sermant.template.EchoService")]),e._v(" interface, and in which define "),t("code",[e._v("echo")]),e._v(" interface methods:")]),e._v(" "),t("div",{staticClass:"language-java extra-class"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("public")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("interface")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("EchoService")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("extends")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("PluginService")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("void")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("echo")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("String")]),e._v(" string"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("p",[e._v("Once the interface is defined, an implementation of the above interface needs to be provided in the "),t("a",{attrs:{href:"#Plugin-Service-Module"}},[e._v("Plugin Service Module")]),e._v(" to execute the actual logic. Create "),t("code",[e._v("com.huaweicloud.sermant.template.EchoServiceImpl")]),e._v(" class in "),t("code",[e._v("template\\template-service")]),e._v(", which need implement "),t("code",[e._v("com.huaweicloud.sermant.template.EchoService")]),e._v(" interface, and implement "),t("code",[e._v("echo")]),e._v(" method in the interface defined：")]),e._v(" "),t("div",{staticClass:"language-java extra-class"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("public")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("class")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("EchoServiceImpl")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("implements")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("EchoService")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[e._v("@Override")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("public")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("void")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("echo")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("String")]),e._v(" string"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// Respond to a greeting")]),e._v("\n        string "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" string"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("replaceAll")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[e._v('"[\\\\pP+~$`^=|<>～｀＄＾＋＝｜＜＞￥×]"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[e._v('""')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[e._v('"ECHO: "')]),e._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v(" string "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[e._v('" to you!"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("p",[e._v("Finally, when developing a plug-in service, don't forget to add the plugin service's "),t("strong",[e._v("SPI")]),e._v(" configuration, add the "),t("code",[e._v("META-INF/services")]),e._v(" directory to the "),t("code",[e._v("resources")]),e._v(" directory under"),t("code",[e._v("template\\template-service")]),e._v(" in the project, then create "),t("strong",[e._v("SPI")]),e._v(" file named "),t("code",[e._v("io.sermant.core.plugin.service.PluginService")]),e._v(" in it，and add the class name of the plugin service implementation class to it.")]),e._v(" "),t("div",{staticClass:"language-java extra-class"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[t("span",{pre:!0,attrs:{class:"token class-name"}},[t("span",{pre:!0,attrs:{class:"token namespace"}},[e._v("com"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("huaweicloud"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("sermant"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("template"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")])]),e._v("EchoServiceImpl")]),e._v("\n")])])]),t("p",[e._v("Next, find the "),t("code",[e._v("com.huaweicloud.sermant.template.TemplateDeclarer")]),e._v(" class under project "),t("code",[e._v("template\\template-plugin")]),e._v(", use the already developed plugin service in the "),t("code",[e._v("before")]),e._v(" method of the "),t("RouterLink",{attrs:{to:"/en/document/developer-guide/bytecode-enhancement.html#Interceptor"}},[e._v("interceptor")]),e._v(" of the "),t("code",[e._v("main")]),e._v(" method, get the plugin service through the "),t("a",{attrs:{href:"https://github.com/sermant-io/Sermant/blob/develop/sermant-agentcore/sermant-agentcore-core/src/main/java/io/sermant/core/plugin/service/PluginServiceManager.java",target:"_blank",rel:"noopener noreferrer"}},[e._v("io.sermant.core.plugin.service.PluginServiceManager"),t("OutboundLink")],1),e._v(" plugin service manager and use:")],1),e._v(" "),t("blockquote",[t("p",[e._v("Note："),t("code",[e._v("io.sermant.core.plugin.service.PluginServiceManager::getPluginService(Class clazz)")]),e._v(" can obtain the instance of plugin service implementation based on Java "),t("strong",[e._v("SPI")]),e._v(" mechanism through plugin service interface.")])]),e._v(" "),t("div",{staticClass:"language-java extra-class"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("public")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("ExecuteContext")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("before")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("ExecuteContext")]),e._v(" context"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("throws")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Exception")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[e._v('"Good morning!"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("PluginServiceManager")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("getPluginService")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("EchoService")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("class")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("echo")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[e._v('"Good morning!"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("return")]),e._v(" context"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("p",[e._v("After the development is completed, you can refer to the process of "),t("RouterLink",{attrs:{to:"/en/document/developer-guide/#Packaged-Build"}},[e._v("packaging and building")]),e._v(" when creating the first plugin, execute "),t("strong",[e._v("mvn package")]),e._v(" in the root directory of the project, and execute "),t("code",[e._v("cd agent/")]),e._v(" in the root directory after completion, and carry Sermant to test application, and execute "),t("strong",[e._v("java -javaagent:sermant-agent.jar -jar Application.jar")]),e._v(".")],1),e._v(" "),t("div",{staticClass:"language-java extra-class"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[e._v("$ java "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("javaagent"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("sermant"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("agent"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("jar "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("jar "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Application")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("jar\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("xxxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xxTxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("xxx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),t("span",{pre:!0,attrs:{class:"token constant"}},[e._v("INFO")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Loading")]),e._v(" god library into "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("BootstrapClassLoader")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("xxxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xxTxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("xxx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),t("span",{pre:!0,attrs:{class:"token constant"}},[e._v("INFO")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Building")]),e._v(" argument map by agent arguments"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("xxxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xxTxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("xxx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),t("span",{pre:!0,attrs:{class:"token constant"}},[e._v("INFO")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Loading")]),e._v(" core library into "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("SermantClassLoader")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("xxxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xxTxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("xxx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),t("span",{pre:!0,attrs:{class:"token constant"}},[e._v("INFO")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Loading")]),e._v(" sermant agent"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" artifact is"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("default")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("xxxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("-")]),e._v("xxTxx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v("xx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("xxx"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),t("span",{pre:!0,attrs:{class:"token constant"}},[e._v("INFO")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Load")]),e._v(" sermant done"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" artifact is"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("default")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Good")]),e._v(" morning"),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("!")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token constant"}},[e._v("ECHO")]),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Good")]),e._v(" morning "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("to")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token namespace"}},[e._v("you")]),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("!")]),e._v("\n")])])]),t("p",[e._v("As you can see, the call was answered and the plugin service we created is already in effect. If you need to develop a new plugin service, follow the development example above.")])])}),[],!1,null,null,null);t.default=s.exports}}]);