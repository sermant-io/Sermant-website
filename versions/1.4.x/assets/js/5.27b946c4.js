(window.webpackJsonp=window.webpackJsonp||[]).push([[5,8],{390:function(t,e,i){"use strict";i.d(e,"f",(function(){return l})),i.d(e,"c",(function(){return c})),i.d(e,"d",(function(){return u})),i.d(e,"e",(function(){return h})),i.d(e,"a",(function(){return d})),i.d(e,"b",(function(){return m}));i(400);var n=i(108);const s=/#.*$/,a=/\.(md|html)$/,r=/\/$/,o=/^[a-z]+:/i;let l=[];function c(t){return o.test(t)}function u(t){return/^mailto:/.test(t)}function h(t){return/^tel:/.test(t)}function d(t){if(c(t))return t;const e=t.match(s),i=e?e[0]:"",n=function(t){return decodeURI(t).replace(s,"").replace(a,"")}(t);return r.test(n)?t:n+".html"+i}const m=()=>new Promise((t,e)=>{n.a.get("https://api.github.com/repos/sermant-io/Sermant-website/git/trees/latest").then(i=>{const s=i.data.tree.find(t=>"versions.json"===t.path);n.a.get(s.url).then(e=>{l=JSON.parse(window.atob(e.data.content)).versions,t(l)}).catch(t=>{console.error(t),e()})}).catch(t=>{console.error(t),e()})})},391:function(t,e,i){},392:function(t,e,i){},393:function(t,e,i){},394:function(t,e,i){"use strict";var n=i(390),s={name:"NavLink",props:{item:{required:!0}},computed:{link(){return Object(n.a)(this.item.link)},exact(){return this.$site.locales?Object.keys(this.$site.locales).some(t=>t=>this.link):"/"===this.link},isNonHttpURI(){return Object(n.d)(this.link)||Object(n.e)(this.link)},isBlankTarget(){return"_black"===this.target},isInternal(){return!Object(n.c)(this.link)&&!this.isBlankTarget},target(){return this.isNonHttpURI?null:this.item.target?this.item.target:Object(n.c)(this.link)?"_blank":""},rel(){return this.isNonHttpURI||!1===this.item.rel?null:this.item.rel?this.item.rel:this.isBlankTarget?"noopener noreferrer":null}},methods:{focusoutAction(){this.$emit("focusout")}}},a=i(26),r=Object(a.a)(s,(function(){var t=this,e=t._self._c;return t.isInternal&&!t.item.isOutLink?e("RouterLink",{staticClass:"nav-link",attrs:{to:t.link,exact:t.exact},nativeOn:{focusout:function(e){return t.focusoutAction.apply(null,arguments)}}},[t._v("\n  "+t._s(t.item.text)+"\n")]):e("a",{staticClass:"nav-link external",attrs:{href:t.link,target:t.target,rel:t.rel},on:{focusout:t.focusoutAction}},[t._v("\n  "+t._s(t.item.text)+"\n  "),t.isBlankTarget?e("OutboundLink"):t._e()],1)}),[],!1,null,null,null);e.a=r.exports},395:function(t,e,i){"use strict";var n=i(406),s=i(394),a=i(390),r={name:"NavLinks",data:()=>({versionDropdown:null}),components:{NavLink:s.a,DropdownLink:n.a},computed:{userNav(){return this.$themeLocaleConfig.nav||this.themeConfig.nav||[]},nav(){const{locales:t}=this.$site;if(t&&Object.keys(t).length>1){const e=this.$page.path,i=this.$router.options.routes,n=this.$site.themeConfig.locales||{},s={text:this.$themeLocaleConfig.selectText||"Languages",ariaLabel:this.$themeLocaleConfig.ariaLabel||"Select language",items:Object.keys(t).map(s=>{const a=t[s],r=n[s]&&n[s].label||a.lang;let o;return a.lang===this.$lang?o=e:(o=e.replace(this.$localeConfig.path,s),i.some(t=>t.path===o)||(o=s)),{text:r,link:o}})};return[...this.userNav,s]}return this.userNav},userLinks(){return(this.nav||[]).map(t=>Object.assign(this.resolveNavLinkItem(t),{items:(t.items||[]).map(this.resolveNavLinkItem)}))},repoLink(){const{repo:t}=this.$site.themeConfig;return t?/^https?:/.test(t)?t:"https://github.com/"+t:null},repoLabel(){if(!this.repoLink)return;if(this.$site.themeConfig.repoLabel)return this.$site.themeConfig.repoLabel;const t=this.repoLink.match(/^https?:\/\/[^/]+/)[0],e=["Github","Gitlab","Bitbucket"];for(let i=0;i<e.length;i++){const n=e[i];if(new RegExp(n,"i").test(t))return n}return"Source"}},watch:{$route(){this.setVersions()}},mounted(){this.setVersions()},methods:{resolveNavLinkItem:t=>Object.assign(t,{type:t.items&&t.items.length?"links":"link"}),async setVersions(){if(0===a.f.length){if(!await Object(a.b)())return}const t=window.location.pathname;let e="Versions";let i=t.indexOf("/versions"),n=a.f[0]+"(latest)";if(-1===i)e=n;else{const n=i+"/versions".length+1,s=t.indexOf("/",n);let r=t.substring(n,s);a.f.some(t=>t===r)&&(e=r)}const s=[n,...a.f].filter(t=>t!==e&&t!==a.f[0]);this.versionDropdown={text:e,ariaLabel:"Select version",items:s.map(t=>{let e=t;const i=window.location.pathname,s=i.indexOf("/versions/"),a=s>=0?s+10:0,r=i.indexOf("/",a);return{text:e,link:(t===n?"":"/versions/"+t)+i.substring(r),isOutLink:!0}})}}}},o=(i(396),i(26)),l=Object(o.a)(r,(function(){var t=this,e=t._self._c;return t.userLinks.length||t.repoLink?e("nav",{staticClass:"nav-links"},[t._l(t.userLinks,(function(t){return e("div",{key:t.link,staticClass:"nav-item"},["links"===t.type?e("DropdownLink",{attrs:{item:t}}):e("NavLink",{attrs:{item:t}})],1)})),t._v(" "),e("div",{staticClass:"nav-item"},[t.versionDropdown?e("DropdownLink",{attrs:{item:t.versionDropdown}}):t._e()],1),t._v(" "),t.repoLink?e("a",{staticClass:"repo-link",attrs:{href:t.repoLink,target:"_blank",rel:"noopener noreferrer"}},[t._v("\n    "+t._s(t.repoLabel)+"\n    "),e("OutboundLink")],1):t._e()],2):t._e()}),[],!1,null,null,null);e.a=l.exports},396:function(t,e,i){"use strict";i(391)},397:function(t,e,i){"use strict";i(392)},398:function(t,e,i){"use strict";var n=i(402),s=i(404),a=i(407),r=i(395);function o(t,e){return t.ownerDocument.defaultView.getComputedStyle(t,null)[e]}var l={name:"Navbar",components:{SidebarButton:a.a,NavLinks:r.a,SearchBox:s.a,AlgoliaSearchBox:n.a},data:()=>({linksWrapMaxWidth:null}),computed:{algolia(){return this.$themeLocaleConfig.algolia||this.$site.themeConfig.algolia||{}},isAlgoliaSearch(){return this.algolia&&this.algolia.apiKey&&this.algolia.indexName}},mounted(){const t=parseInt(o(this.$el,"paddingLeft"))+parseInt(o(this.$el,"paddingRight")),e=()=>{document.documentElement.clientWidth<719?this.linksWrapMaxWidth=null:this.linksWrapMaxWidth=this.$el.offsetWidth-t-(this.$refs.siteName&&this.$refs.siteName.offsetWidth||0)};e(),window.addEventListener("resize",e,!1)}},c=(i(397),i(26)),u=Object(c.a)(l,(function(){var t=this,e=t._self._c;return e("header",{staticClass:"navbar"},[e("SidebarButton",{on:{"toggle-sidebar":function(e){return t.$emit("toggle-sidebar")}}}),t._v(" "),e("RouterLink",{staticClass:"home-link",attrs:{to:t.$localePath}},[t.$site.themeConfig.logo?e("img",{staticClass:"logo",attrs:{src:t.$withBase(t.$site.themeConfig.logo),alt:t.$siteTitle}}):t._e()]),t._v(" "),e("div",{staticClass:"links",style:t.linksWrapMaxWidth?{"max-width":t.linksWrapMaxWidth+"px"}:{}},[t.isAlgoliaSearch?e("AlgoliaSearchBox",{attrs:{options:t.algolia}}):!1!==t.$site.themeConfig.search&&!1!==t.$page.frontmatter.search?e("SearchBox"):t._e(),t._v(" "),e("NavLinks",{staticClass:"can-hide"})],1)],1)}),[],!1,null,null,null);e.a=u.exports},399:function(t,e,i){"use strict";i(393)},401:function(t,e,i){"use strict";i.r(e);var n=i(398),s=i(405),a={name:"Base",components:{Navbar:n.a,Sidebar:s.a},data:()=>({sidebarIsOpen:!1}),computed:{},mounted(){const t=document.getElementById("navbar"),e=document.getElementById("sidebar");window.addEventListener("click",i=>{i.clientX>e.clientWidth&&i.clientY>t.clientHeight&&this.toggleSidebar(!1)})},methods:{toggleSidebar(t){this.sidebarIsOpen="boolean"==typeof t?t:!this.sidebarIsOpen},onTouchStart(t){this.touchStart={x:t.changedTouches[0].clientX,y:t.changedTouches[0].clientY}},onTouchEnd(t){const e=t.changedTouches[0].clientX-this.touchStart.x,i=t.changedTouches[0].clientY-this.touchStart.y;Math.abs(e)>Math.abs(i)&&Math.abs(e)>40&&(e>0&&this.touchStart.x<=80?this.toggleSidebar(!0):this.toggleSidebar(!1))}}},r=(i(399),i(26)),o=Object(r.a)(a,(function(){var t=this._self._c;return t("div",{class:{base:!0,"sidebar-open":this.sidebarIsOpen},on:{touchstart:this.onTouchStart,touchend:this.onTouchEnd}},[t("Navbar",{attrs:{id:"navbar"},on:{"toggle-sidebar":this.toggleSidebar}}),this._v(" "),t("Sidebar",{attrs:{items:[],id:"sidebar"}}),this._v(" "),this._t("content")],2)}),[],!1,null,"7ddf006a",null);e.default=o.exports},425:function(t,e,i){},446:function(t,e,i){"use strict";i(425)},455:function(t,e,i){"use strict";i.r(e);var n={name:"DevelopmentTeam",components:{Base:i(401).default},data:()=>({memberInfo:[{text:"location",icon:"el-icon-location-outline"},{text:"blog",icon:"el-icon-reading"}]}),computed:{module(){return this.$frontmatter.module},description(){return this.$frontmatter.description},members(){return this.$frontmatter.members},blog(){return this.$frontmatter.blog}},methods:{}},s=(i(446),i(26)),a=Object(s.a)(n,(function(){var t=this,e=t._self._c;return e("Base",{scopedSlots:t._u([{key:"content",fn:function(){return[e("div",{staticClass:"module-box"},[e("h1",[t._v(t._s(t.module))])]),t._v(" "),e("div",{staticClass:"content-box"},[e("div",{staticClass:"team-description"},[t._v(t._s(t.description))]),t._v(" "),e("div",{staticClass:"member-box"},t._l(t.members,(function(i,n){return e("el-card",{key:n,staticClass:"card"},[e("div",{staticClass:"members"},[e("div",{staticStyle:{"padding-top":"0.5rem"}},[e("el-avatar",{attrs:{size:"large",src:t.$withBase(i.avatar)}})],1),t._v(" "),e("div",{staticClass:"member-description"},[e("div",[e("b",[t._v(t._s(i.name))])]),t._v(" "),e("div",[t._v(t._s(i.shortDesc))]),t._v(" "),e("div",[e("i",{staticClass:"el-icon-location-outline"}),t._v("\n                "+t._s(i.location)+"\n              ")]),t._v(" "),i.blog?e("div",[e("i",{staticClass:"el-icon-reading"}),t._v(" "),e("a",{attrs:{href:i.blog}},[t._v(t._s(t.blog))])]):t._e(),t._v(" "),i.github?e("div",[e("a",{attrs:{href:i.github}},[t._v("Github")])]):t._e()])])])})),1)])]},proxy:!0}])})}),[],!1,null,"c7e06156",null);e.default=a.exports}}]);