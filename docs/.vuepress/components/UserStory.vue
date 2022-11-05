<template>
  <Base>
    <template v-slot:content>
      <dir class="module-box">
        <h1>{{ userStory }}</h1>
      </dir>
      <div class="content">
        <el-card
          class="story-card"
          v-for="(item, index) in userArr"
          :key="index"
          shadow="hover"
          @click.native="goToDetail(item.name)"
        >
          <div class="card-content">
            <div class="img-box">
              <img :src="$withBase(item.img)" alt="User Logo" />
            </div>
            <div class="description">
              <div class="name">{{ item.name }}</div>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </template>
  </Base>
</template>
<style scoped>
.module-box {
  width: 70%;
  margin: 4rem auto 0;
  border-bottom: 1px solid #ebeef5;
}
.content {
  margin-top: 45px;
}

.story-card {
  width: 70%;
  height: 140px;
  margin: 20px auto;
  box-sizing: border-box;
  cursor: pointer;
}

.card-content {
  display: flex;
  align-items: center;
}
.card-content .description {
  margin-left: 20px;
}
.img-box {
  width: 110px;
  height: 100px;
  border-right: 1px solid #ebeef5;
}
img {
  width: 80px;
  height: 80px;
  margin: 10px 20px 10px 10px;
}
.base .name {
  font-size: 20px;
  font-weight: bold;
}
</style>
<script>
import Base from "./Base.vue";
export default {
  name: "UserStory",
  components: {
    Base,
  },
  data() {
    return {};
  },
  computed: {
    userArr() {
      return this.$frontmatter.userArr;
    },
    userStory() {
      return this.$frontmatter.name;
    },
  },
  mounted() {},
  methods: {
    goToDetail(name) {
      if (this.$router.currentRoute.path.indexOf("/zh/") !== -1) {
        this.$router.push(`/zh/story/${name}/`);
      }else{
        this.$router.push(`/en/story/${name}/`);
      }
    },
  },
};
</script>
