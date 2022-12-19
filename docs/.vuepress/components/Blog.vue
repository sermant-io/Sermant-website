<template>
  <Base>
    <template v-slot:content>
      <dir class="module-box">
        <h1>{{ module }}</h1>
      </dir>
      <div class="content">
        <el-card
          class="story-card"
          v-for="(item, index) in currentBlogArr"
          :key="index"
          shadow="hover"
          @click.native="goToDetail(item.path)"
        >
          <div class="card-content">
            <div class="description">
              <div class="name">{{ item.name }}</div>
              <p>{{ item.description }}</p>
            </div>
            <div class="tags">
              <el-tag v-for="(tag, index) in item.tags" :key="index">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-card>
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-size="10"
            layout="total, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
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
  height: 160px;
  margin: 20px auto;
  /* box-sizing: border-box; */
  cursor: pointer;
}

.tags .el-tag {
  margin-left: 1rem;
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

.block {
  width: 70%;
  margin: 0 auto;
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
    return {
      currentPage: 1,
      total: 0,
      currentBlogArr: [],
    };
  },
  computed: {
    blog() {
      return this.$frontmatter.blogArr;
    },
    module() {
      return this.$frontmatter.name;
    },
    goTo() {
      return this.$frontmatter.goTo;
    },
  },
  created() {},
  mounted() {
    this.total = Array.isArray(this.blog) ? this.blog.length : 0;
    this.loadBlog();
  },
  watch: {
    blog() {
      this.total = Array.isArray(this.blog) ? this.blog.length : 0;
      this.loadBlog();
    },
  },
  methods: {
    goToDetail(name) {
      if(name.indexOf("http")===0){
        window.open(name);
      }else{
        if (this.$router.currentRoute.path.indexOf("/zh/") !== -1) {
          this.$router.push(`/zh/blog/${name}/`);
        } else {
          this.$router.push(`/en/blog/${name}/`);
        }
      }
    },
    handleSizeChange() {
      this.loadBlog();
    },
    handleCurrentChange() {
      this.loadBlog();
    },
    loadBlog() {
      this.currentBlogArr = this.blog.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
};
</script>
