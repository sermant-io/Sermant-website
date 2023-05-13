<template>
  <span class="nav-item" v-if="options && options.length > 0">
    Versions:
    <select v-model="selected" @change="onChange">
      <option v-for="option in options" :value="option.value">
        {{ option.text }}
      </option>
    </select>
  </span>
</template>

<script>
export default {
  data() {
    return {
      selected: undefined,
      options: []
    };
  },
  mounted: function() {
    this.$axios.get(
        'https://api.github.com/repos/huaweicloud/Sermant-website/git/trees/version-support',
    ).then((response)=>{
      const versionNode = response.data.tree.find(e => {
        return e.path === 'versions.json';
      })
      this.$axios.get(versionNode.url).then((res) => {
        this.options = eval("(" + window.atob(res.data.content) + ")").versions.map(v => {
          return {value: v, text: v};
        })
        if (this.options.length === 0) {
          return;
        }
        this.options.unshift({value: 'latest', text: 'latest'});
        const path = window.location.pathname;
        if (path.startsWith('/versions/')) {
          const start = 10;
          const end = path.indexOf('/', start);
          this.selected = path.substring(start, end);
        } else {
          this.selected = 'latest';
        }
      }).catch(err=>console.error(err));
    }).catch(err=>console.error(err));
  },
  methods: {
    onChange(event) {
      const path = window.location.pathname;
      const versionIdx = path.indexOf('/versions/');
      const startIdx = versionIdx >= 0 ? versionIdx + 10 : 0;
      const endIdx = path.indexOf('/', startIdx);
      const versionPath = this.selected === 'latest' ? '' : `/versions/${this.selected}`;
      window.location.pathname = versionPath + path.substring(endIdx);
    }
  }
};
</script>