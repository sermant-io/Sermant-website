<template>
  <div
    :class="{ base: true, 'sidebar-open': sidebarIsOpen }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <Navbar @toggle-sidebar="toggleSidebar" id="navbar"></Navbar>
    <Sidebar :items="[]" id="sidebar"> </Sidebar>
    <slot name="content"></slot>
  </div>
</template>
<style  scoped>
@media (max-width: 719px) {
  .base.sidebar-open .sidebar {
    transform: translateX(0);
  }
  .base aside {
    display: block;
  }
}
@media (min-width: 719px) {
  .base aside {
    display: none;
  }
}
</style>
<script>
import Navbar from "../theme/components/Navbar.vue";
import Sidebar from "@vuepress/theme-default/components/Sidebar.vue";
export default {
  name: "Base",
  components: {
    Navbar,
    Sidebar,
  },
  data() {
    return {
      sidebarIsOpen: false,
    };
  },
  computed: {
    
  },
  mounted() {
    const navbar = document.getElementById("navbar");
    const sidebar = document.getElementById("sidebar");
    window.addEventListener("click", (e) => {
      if (e.clientX > sidebar.clientWidth && e.clientY > navbar.clientHeight) {
        this.toggleSidebar(false);
      }
    });
  },
  methods: {
    toggleSidebar(to) {
      this.sidebarIsOpen = typeof to === "boolean" ? to : !this.sidebarIsOpen;
    },
    onTouchStart(e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
    },

    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true);
        } else {
          this.toggleSidebar(false);
        }
      }
    },
  },
};
</script>
