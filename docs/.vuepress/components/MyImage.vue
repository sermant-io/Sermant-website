<template>
  <el-image :src="$withBase(src)" :preview-src-list="[$withBase(src)]"></el-image>
</template>
<script>
export default {
  props: ["src"],
};
</script>
