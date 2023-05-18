<template>
  <nav
      v-if="userLinks.length || repoLink"
      class="nav-links"
  >
    <!-- user links -->
    <div
        v-for="item in userLinks"
        :key="item.link"
        class="nav-item"
    >
      <DropdownLink
          v-if="item.type === 'links'"
          :item="item"
      />
      <NavLink
          v-else
          :item="item"
      />

    </div>
    <div class="nav-item">
      <DropdownLink
          v-if="versionDropdown"
          :item="versionDropdown"
      />
    </div>

    <!-- repo link -->
    <a
        v-if="repoLink"
        :href="repoLink"
        class="repo-link"
        target="_blank"
        rel="noopener noreferrer"
    >
      {{ repoLabel }}
      <OutboundLink/>
    </a>
  </nav>
</template>

<script>
import DropdownLink from '@theme/components/DropdownLink.vue'
import NavLink from '@theme/components/NavLink.vue'
import {versions,getVersions} from "../../util"
export default {
  name: 'NavLinks',
  data() {
    return {
      versionDropdown: null
    }
  },
  components: {
    NavLink,
    DropdownLink
  },

  computed: {
    userNav() {
      return this.$themeLocaleConfig.nav || this.themeConfig.nav || []
    },

    nav() {
      const {locales} = this.$site
      if (locales && Object.keys(locales).length > 1) {
        const currentLink = this.$page.path
        const routes = this.$router.options.routes
        const themeLocales = this.$site.themeConfig.locales || {}
        const languageDropdown = {
          text: this.$themeLocaleConfig.selectText || 'Languages',
          ariaLabel: this.$themeLocaleConfig.ariaLabel || 'Select language',
          items: Object.keys(locales).map(path => {
            const locale = locales[path]
            const text = themeLocales[path] && themeLocales[path].label || locale.lang
            let link
            // Stay on the current page
            if (locale.lang === this.$lang) {
              link = currentLink
            } else {
              // Try th stay on the same page
              link = currentLink.replace(this.$localeConfig.path, path)
              // fallback th homepage
              if (!routes.some(route => route.path === link)) {
                link = path
              }
            }
            return {text, link}
          })
        }
        return [...this.userNav, languageDropdown]
      }
      return this.userNav
    },

    userLinks() {
      let links = this.nav || [];
      return (links).map(link => {
        return Object.assign(this.resolveNavLinkItem(link), {
          items: (link.items || []).map(this.resolveNavLinkItem)
        })
      })
    },

    repoLink() {
      const {repo} = this.$site.themeConfig
      if (repo) {
        return /^https?:/.test(repo)
            ? repo
            : `https://github.com/${repo}`
      }
      return null
    },

    repoLabel() {
      if (!this.repoLink) return
      if (this.$site.themeConfig.repoLabel) {
        return this.$site.themeConfig.repoLabel
      }

      const repoHost = this.repoLink.match(/^https?:\/\/[^/]+/)[0]
      const platforms = ['Github', 'Gitlab', 'Bitbucket']
      for (let i=0;i < platforms.length; i++) {
        const platform = platforms[i]
        if (new RegExp(platform, 'i').test(repoHost)) {
          return platform
        }
      }

      return 'Source'
    }
  },
  watch: {
    $route() {
      this.setVersions();
    }
  },
  mounted() {
    this.setVersions();
  },
  methods: {
    resolveNavLinkItem(linkItem) {
      return Object.assign(linkItem, {
        type: linkItem.items && linkItem.items.length ? 'links' : 'link'
      })
    },
    async setVersions() {
      if(versions.length===0){
        const tmp = await getVersions();
        if (!tmp) {
          return;
        }
      }
      const currentPath = window.location.pathname;
      let versionText = 'Versions';
      const versionKey = '/versions';
      let startIndex = currentPath.indexOf(versionKey);
      if (startIndex === -1) {
        versionText = 'latest';
      } else {
        const numStartIndex = startIndex + versionKey.length + 1;
        const numEndIndex = currentPath.indexOf('/', numStartIndex);
        let temVersion = currentPath.substring(numStartIndex, numEndIndex);
        if (versions.some(version => version === temVersion)) {
          versionText = temVersion
        }
      }
      const tmpVersionArr = ['latest', ...versions].filter((tmpV) => {
        return tmpV !== versionText;
      })
      this.versionDropdown = {
        text: versionText,
        ariaLabel: 'Select version',
        items: tmpVersionArr.map((version) => {
          let text = version;
          const path = window.location.pathname;
          const versionIdx = path.indexOf('/versions/');
          const startIdx = versionIdx >= 0 ? versionIdx + 10 : 0;
          const endIdx = path.indexOf('/', startIdx);
          const versionPath = version === 'latest' ? '' : `/versions/${version}`;
          let link = versionPath + path.substring(endIdx);
          return {text, link, isOutLink: true}
        })
      };
    }
  }
}
</script>

<style lang="stylus">
.nav-links
  display inline-block

  a
    line-height  1.4rem
    color inherit

    &:hover, &.router-link-active
      color $accentColor

  .nav-item
    position relative
    display inline-block
    margin-left 1.5rem
    line-height 2rem

    &:first-child
      margin-left 0

  .repo-link
    margin-left 1.5rem

@media (max-width: $MQMobile)
  .nav-links
    .nav-item, .repo-link
      margin-left 0

@media (min-width: $MQMobile)
  .nav-links a
    &:hover, &.router-link-active
      color $textColor

  .nav-item > a:not(.external)
    &:hover, &.router-link-active
      margin-bottom  -2px
      border-bottom 2px solid lighten($accentColor, 8%)
</style>