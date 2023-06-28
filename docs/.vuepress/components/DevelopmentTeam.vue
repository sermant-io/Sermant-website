<template>
  <Base>
    <template v-slot:content>
      <div class="module-box">
        <h1>{{ module }}</h1>
      </div>
      <div class="content-box">
        <div class="team-description">{{ description }}</div>
        <div class="member-box">
          <el-card v-for="(item, index) in members" :key="index" class="card">
            <div class="members">
              <div style="padding-top: 0.5rem">
                <el-avatar size="large" :src="$withBase(item.avatar)"></el-avatar>
              </div>
              <div class="member-description">
                <div>
                  <b>{{ item.name }}</b>
                </div>
                <div>{{ item.shortDesc }}</div>
                <div>
                  <i class="el-icon-location-outline"></i>
                  {{ item.location }}
                </div>
                <div v-if="item.blog">
                  <i class="el-icon-reading"></i>
                  <a :href="item.blog">{{ blog }}</a>
                </div>
                <div v-if="item.github">
                  <a :href="item.github">Github</a>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </template>
  </Base>
</template>
<style scoped>
.module-box {
  margin: 4rem auto 1rem;
  width: 70%;
  border-bottom: 1px solid #ebeef5;
}

.content-box {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 900px;
}

.card {
  margin: 0 auto 2rem;
}

.team-description {
  position: sticky;
  top: 4rem;
  max-height: 300px;
  min-width: 300px;
  max-width: 500px;
  margin-bottom: 2rem;
  margin: 0 auto 1rem;
  padding: 1rem;
}

.members {
  min-width: 500px;
  max-width: 700px;
  display: flex;
}
.member-description {
  min-width: 500px;
  margin-left: 1rem;
}
.member-description div {
  margin: 1rem;
}

.member-box {
  padding-left: 1rem;
}

@media (max-width: 719px) {
  .content-box {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .team-description {
    position: relative;
    top: 0;
  }

  .member-box {
    margin: 0 auto;
    padding-left: 0;
  }
}
@media (max-width: 500px) {
  .members {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
<script>
import Base from "./Base.vue";
export default {
  name: "DevelopmentTeam",
  components: {
    Base,
  },
  data() {
    return {
      memberInfo: [
        {
          text: "location",
          icon: "el-icon-location-outline",
        },
        {
          text: "blog",
          icon: "el-icon-reading",
        },
      ],
    };
  },
  computed: {
    module() {
      return this.$frontmatter.module;
    },
    description() {
      return this.$frontmatter.description;
    },
    members() {
      return this.$frontmatter.members;
    },
    blog() {
      return this.$frontmatter.blog;
    },
  },
  methods: {},
};
</script>
