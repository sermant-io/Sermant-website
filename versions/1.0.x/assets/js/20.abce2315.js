(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{466:function(e,t,a){"use strict";a.r(t);var r=a(26),n=Object(r.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"introduction"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#introduction"}},[e._v("#")]),e._v(" Introduction")]),e._v(" "),t("h2",{attrs:{id:"what-is-sermant"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#what-is-sermant"}},[e._v("#")]),e._v(" What is Sermant?")]),e._v(" "),t("p",[t("strong",[e._v("Sermant")]),e._v(" is a proxyless service mesh technology based on JavaAgent. It uses JavaAgent to provide enhanced service governance functions for host applications to solve the problem of service governance in large-scale microservice scenarios.")]),e._v(" "),t("h2",{attrs:{id:"architecture"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#architecture"}},[e._v("#")]),e._v(" Architecture")]),e._v(" "),t("p",[e._v("Sermant's purpose also includes building a plugin-development ecosystem to help developers develop the service governance function more easily while not interfering the business code. The Sermant architecture is depicted as follows.")]),e._v(" "),t("MyImage",{attrs:{src:"/docs-img/sermant-product-arch.png"}}),e._v(" "),t("p",[e._v("As described above, Sermant's JavaAgent has two layers of functions.")]),e._v(" "),t("ul",[t("li",[e._v("Framework core layer. The core layer provides Sermant's basic framework capability, in order to ease the plugin development. The function of this layer includes heart beat, data transmit, dynamic configuration, etc.")]),e._v(" "),t("li",[e._v("Plugin service layer. The plugin provides actual governance service for the application. The developer can either develop simple plugin by directly leveraging framework core service, or can develop complex plugin by developing plugin's own complex service-governance function.")])]),e._v(" "),t("p",[e._v("Sermant's JavaAgent widely adopts class isolation technology in order to eliminate the class load conflicts between framework code, plugin code, and application code.")]),e._v(" "),t("p",[e._v("A microservice architecture using Sermant has the following three components, which is depicted in the following diagram.")]),e._v(" "),t("MyImage",{attrs:{src:"/docs-img/sermant-rt-arch.png"}}),e._v(" "),t("ul",[t("li",[e._v("Sermant JavaAgent: dynamically instrument the application for the service governance capability.")]),e._v(" "),t("li",[e._v("Sermant Backend: provide the connection and the pre-processing service for the JavaAgents' all uploaded-data.")]),e._v(" "),t("li",[e._v("Dynamic configuration center: Providing the instructions by dynamically update the config to the listening JavaAgent. Dynamic configuration center is not directly provided by Sermant project. The projects currently support servicecomb-kie, etc.")])])],1)}),[],!1,null,null,null);t.default=n.exports}}]);