(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{475:function(t,a,s){"use strict";s.r(a);var n=s(26),e=Object(n.a)({},(function(){var t=this,a=t._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"logging-function"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#logging-function"}},[t._v("#")]),t._v(" Logging Function")]),t._v(" "),a("p",[t._v("This article describes how to use the logging system provided by Sermant in your development.")]),t._v(" "),a("h2",{attrs:{id:"function-introduction"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#function-introduction"}},[t._v("#")]),t._v(" Function Introduction")]),t._v(" "),a("p",[t._v("Log is an indispensable ability in program development, through the log can quickly find out the state of the program running and the problems encountered. "),a("strong",[t._v("Sermant")]),t._v(" log system is built on "),a("strong",[t._v("JUL")]),t._v("&"),a("strong",[t._v("logback")]),t._v(", which provides a complete, flexible configuration log tool to avoid class conflicts for plugin development.")]),t._v(" "),a("blockquote",[a("p",[t._v("Note: Based on Sermant's class isolation strategy, the log system constructs the log through JUL interface and outputs the log through logback engine. This is due to the "),a("a",{attrs:{href:"https://github.com/qos-ch/slf4j/tree/master/jul-to-slf4j",target:"_blank",rel:"noopener noreferrer"}},[t._v("jul-to-slf4j"),a("OutboundLink")],1),t._v(" bridging capability, based on which you don't have to worry about logging configuration and output conflicts with the enhanced application.")])]),t._v(" "),a("h2",{attrs:{id:"development-examples"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#development-examples"}},[t._v("#")]),t._v(" Development Examples")]),t._v(" "),a("p",[t._v("This development example is based on the project created in the  "),a("RouterLink",{attrs:{to:"/en/document/developer-guide/"}},[t._v("Create your first plugin")]),t._v("  document.")],1),t._v(" "),a("p",[t._v("Find "),a("code",[t._v("template\\template-plugin")]),t._v(" under "),a("code",[t._v("com.huaweicloud.sermant.template.TemplateDeclarer")]),t._v(" class, in which define a private static constants "),a("code",[t._v("LOGGER")]),t._v(", used in the class of log structure:")]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("final")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("Then we are in for "),a("code",[t._v("main")]),t._v(" method "),a("RouterLink",{attrs:{to:"/en/document/developer-guide/bytecode-enhancement.html#Interceptor"}},[t._v("Interceptor")]),t._v(" "),a("code",[t._v("before")]),t._v(" and "),a("code",[t._v("after")]),t._v(" method through "),a("code",[t._v("java.util.logging.Logger::info")]),t._v(" interface added "),a("code",[t._v("INFO")]),t._v(" level of execution This will allow us to see the interceptor execution in the log:")],1),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[t._v("@Override")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExecuteContext")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("before")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExecuteContext")]),t._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("throws")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Exception")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("info")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Say good morning before good afternoon!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("out"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("println")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Good morning!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[t._v("@Override")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExecuteContext")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("after")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExecuteContext")]),t._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("throws")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Exception")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("info")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Say good night after good afternoon!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("out"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("println")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Good night!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("Once the development is complete, follow the "),a("RouterLink",{attrs:{to:"/en/document/developer-guide/#Packaged-build"}},[t._v("Packaged build")]),t._v(" process used to create the first plugin, run "),a("strong",[t._v("mvn package")]),t._v(" in the root directory of the project, and run "),a("code",[t._v("cd agent/")]),t._v(" in it with "),a("strong",[t._v("Sermant")]),t._v(" to run the test app. Run "),a("strong",[t._v("java -javaagent:sermant-agent.jar -jar Application.jar")])],1),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[t._v("$ "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("java")]),t._v(" -javaagent:sermant-agent.jar "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[t._v("-jar")]),t._v(" Application.jar\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("xxxx-xx-xxTxx:xx:xx.xxx"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Loading god library into BootstrapClassLoader.\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("xxxx-xx-xxTxx:xx:xx.xxx"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Building argument map by agent arguments.\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("xxxx-xx-xxTxx:xx:xx.xxx"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Loading core library into SermantClassLoader.\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("xxxx-xx-xxTxx:xx:xx.xxx"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Loading sermant agent, artifact is: default\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("xxxx-xx-xxTxx:xx:xx.xxx"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Load sermant done, artifact is: default\nGood morning"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("\nGood afternoon"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("\nGood night"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("\n")])])]),a("p",[t._v("The execution logic defined in the plug-in has been enhanced into the test application. Next, take a look at the logs generated while the program is running:")]),t._v(" "),a("ol",[a("li",[a("p",[t._v("Enter the log directory by running "),a("code",[t._v("cd logs/sermant/core/app/${yyyy-mm-dd}/")]),t._v(", where "),a("code",[t._v("${yyyy-mm-dd}")]),t._v(" refers to the directory name generated by the runtime based on the date.")])]),t._v(" "),a("li",[a("p",[t._v("Open the log file "),a("code",[t._v("sermant-0.log")]),t._v(" to check the log content. We can see that the log we constructed has taken effect, and we can see the trigger time, log level, class, method, line of code, thread and other information in the log, which is easy to understand the running state of the program.")])])]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[t._v("xxxx-xx-xx xx:xx:xx.xxx "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("com.huaweicloud.sermant.template.TemplateDeclarer"),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("before:33"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("main"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Say good morning before good afternoon"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("\nxxxx-xx-xx xx:xx:xx.xxx "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("INFO"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("com.huaweicloud.sermant.template.TemplateDeclarer"),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("after:40"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("main"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" Say good night after good afternoon"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("\n")])])]),a("h2",{attrs:{id:"api-configuration"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#api-configuration"}},[t._v("#")]),t._v(" API & Configuration")]),t._v(" "),a("h3",{attrs:{id:"api"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#api"}},[t._v("#")]),t._v(" API")]),t._v(" "),a("h4",{attrs:{id:"get-logging-tools"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#get-logging-tools"}},[t._v("#")]),t._v(" Get Logging Tools")]),t._v(" "),a("ul",[a("li",[t._v("Get the logging tool object for constructing logs in development. The log instance is a "),a("code",[t._v("java.util.logging.Logger")]),t._v(" instance, which has been initialized and bridged to the logback logging engine in the "),a("strong",[t._v("Sermant")]),t._v(" framework.")])]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("h4",{attrs:{id:"logging"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#logging"}},[t._v("#")]),t._v(" Logging")]),t._v(" "),a("p",[t._v("Developers can use the following logging interfaces to record various levels ("),a("code",[t._v("TRACE")]),t._v(", "),a("code",[t._v("DEBUG")]),t._v(", "),a("code",[t._v("INFO")]),t._v(", "),a("code",[t._v("WARN")]),t._v(", "),a("code",[t._v("ERROR")]),t._v(") of execution to achieve different levels of monitoring.")]),t._v(" "),a("ul",[a("li",[t._v("Record "),a("strong",[t._v("TRACE")]),t._v(" level logs to trace detailed program execution flow. This level is off by default, but it needs to be configured if needed.")])]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("finest")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"TRACE MESSAGE"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("ul",[a("li",[t._v("Logging at the "),a("strong",[t._v("DEBUG")]),t._v(" level, used to record details at key points in the application, possibly containing method arguments or return values, which can be used to learn more about the application during debugging. This level is off by default, but it needs to be configured if needed.")])]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("fine")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"DEBUG MESSAGE"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("ul",[a("li",[t._v("Logging "),a("strong",[t._v("INFO")]),t._v(" level logs, used to record some critical information about the program execution, often to indicate where the program has entered or the state of the execution, often not like the detailed information recorded in "),a("strong",[t._v("DEBUG")]),t._v(" level logs.")]),t._v(" "),a("li")]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("info")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"INFO MESSAGE"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("ul",[a("li",[t._v("Log at the "),a("strong",[t._v("WARN")]),t._v(" level to log some warning messages. Some special states are entered during the running of the logger. Although they will not affect the running of the program, they are worth noting.")])]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("warning")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"WARN MESSAGE"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("ul",[a("li",[t._v("the record level of the "),a("strong",[t._v("ERROR")]),t._v(" log, to record the ERROR in the operation of the program, used to provide information to facilitate the development and maintenance personnel to understand the causes of ERROR.")])]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("java"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("util"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("logging"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")])]),t._v("Logger")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("LoggerFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getLogger")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOGGER")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("severe")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"ERROR MESSAGE"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("h3",{attrs:{id:"configuration"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#configuration"}},[t._v("#")]),t._v(" Configuration")]),t._v(" "),a("p",[t._v("The logging system provided by "),a("strong",[t._v("Sermant")]),t._v(" is based on the logback logging engine and follows logback's logging configuration style, based on the "),a("RouterLink",{attrs:{to:"/en/document/developer-guide/#Project-structure"}},[t._v("Project structure")]),t._v(" created in the first plugin, by modifying the "),a("code",[t._v("config/logback.xml")]),t._v(" to customize the logging logic.")],1),t._v(" "),a("h4",{attrs:{id:"log-output-configuration"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#log-output-configuration"}},[t._v("#")]),t._v(" Log Output Configuration")]),t._v(" "),a("table",[a("thead",[a("tr",[a("th",[t._v("Configuration Items")]),t._v(" "),a("th",[t._v("Description")]),t._v(" "),a("th",[t._v("Example Configuration")])])]),t._v(" "),a("tbody",[a("tr",[a("td",[t._v("log.home_dir")]),t._v(" "),a("td",[t._v("Used to specify the final log output path.")]),t._v(" "),a("td",[a("code",[t._v("${sermant_log_dir:-./logs/sermant/core}")])])]),t._v(" "),a("tr",[a("td",[t._v("log.app_name")]),t._v(" "),a("td",[t._v("The filename prefix used to specify the log file.")]),t._v(" "),a("td",[a("code",[t._v("{sermant_app_name:-sermant}")])])]),t._v(" "),a("tr",[a("td",[t._v("log.maxHistory")]),t._v(" "),a("td",[t._v("Used to specify the maximum duration (in days) of the log file.")]),t._v(" "),a("td",[a("code",[t._v("${sermant_log_max_history:-30}")])])]),t._v(" "),a("tr",[a("td",[t._v("log.level")]),t._v(" "),a("td",[t._v("Used to specify the minimum level of log output, configurable "),a("code",[t._v("trace")]),t._v("、"),a("code",[t._v("debug")]),t._v("、"),a("code",[t._v("info")]),t._v("、"),a("code",[t._v("warn")]),t._v("、"),a("code",[t._v("error")]),t._v("。")]),t._v(" "),a("td",[a("code",[t._v("${sermant_log_level:-trace}")])])]),t._v(" "),a("tr",[a("td",[t._v("log.maxSize")]),t._v(" "),a("td",[t._v("Used to specify the maximum capacity of a single log file.")]),t._v(" "),a("td",[a("code",[t._v("${sermant_log_max_size:-5MB}")])])]),t._v(" "),a("tr",[a("td",[t._v("log.totalSize")]),t._v(" "),a("td",[t._v("Used to specify the maximum total capacity of the log file.")]),t._v(" "),a("td",[a("code",[t._v("${sermant_log_total_size:-20GB}")])])]),t._v(" "),a("tr",[a("td",[t._v("log.pattern")]),t._v(" "),a("td",[t._v("Used to specify the format of the output log.")]),t._v(" "),a("td",[a("code",[t._v("%d{yyyy-MM-dd HH:mm:ss.SSS} [%le] [%C] [%M:%L] [%thread] %m%n")])])])])]),t._v(" "),a("blockquote",[a("p",[t._v("Note: All configuration values support reading the configuration from an environment variable, simply configure it as "),a("code",[t._v("${environment variable name:-default value}")]),t._v(". The format of the output log is configured in "),a("a",{attrs:{href:"#Log-Format-Configuration"}},[t._v("Log Format Configuration")]),t._v(".")])]),t._v(" "),a("h4",{attrs:{id:"log-format-configuration"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#log-format-configuration"}},[t._v("#")]),t._v(" Log Format Configuration")]),t._v(" "),a("p",[t._v("Log the default configuration for "),a("code",[t._v("%d{yyyy-MM-dd HH:mm:ss.SSS} [%le] [%C] [%M:%L] [%thread] %m%n")]),t._v(" identification meaning which can be configured as follows:")]),t._v(" "),a("table",[a("thead",[a("tr",[a("th",[t._v("Configuring Identity")]),t._v(" "),a("th",[t._v("Description")])])]),t._v(" "),a("tbody",[a("tr",[a("td",[t._v("%d")]),t._v(" "),a("td",[t._v("Used to specify the date format for log output.")])]),t._v(" "),a("tr",[a("td",[t._v("%C")]),t._v(" "),a("td",[t._v("Use to specify the full class name of the class in which the log output occurred.")])]),t._v(" "),a("tr",[a("td",[t._v("%F")]),t._v(" "),a("td",[t._v("The filename used to specify the log output class in which the log occurs.")])]),t._v(" "),a("tr",[a("td",[t._v("%M")]),t._v(" "),a("td",[t._v("The name of the method used to specify the log output for which the log occurred.")])]),t._v(" "),a("tr",[a("td",[t._v("%L")]),t._v(" "),a("td",[t._v("Line number used to specify the log output in the class where the log occurred.")])]),t._v(" "),a("tr",[a("td",[t._v("%thread")]),t._v(" "),a("td",[t._v("Used to specify the log output thread on which the log occurred.")])]),t._v(" "),a("tr",[a("td",[t._v("%m")]),t._v(" "),a("td",[t._v("Used to specify that the log outputs the information specified when the log was constructed.")])]),t._v(" "),a("tr",[a("td",[t._v("%n")]),t._v(" "),a("td",[t._v("Newline characters")])])])])])}),[],!1,null,null,null);a.default=e.exports}}]);