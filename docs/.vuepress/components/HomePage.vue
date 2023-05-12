<template>
  <Base>
    <template v-slot:content>
      <div class="home-page">
        <div class="content-box">
          <div :class="{ 'logo-box': true, move }">
            <img :src="$withBase('/img/sermant-logo.png')" alt="Sermant" width=500px height=100px />
          </div>
          <div class="content">
            <p>{{ $description }}</p>
          </div>
          <div class="button-box">
            <el-button
                type="danger"
                @click="goToDocument"
                icon="el-icon-reading"
                round
                style="width:140px"
            >
              {{ quickStart }}
            </el-button>
            <el-button
                type="blogs"
                @click="goToBlogs"
                icon="el-icon-document"
                style="width:140px"
                round
            >
              {{ blogs }}
            </el-button>
            <div class="github-box" @click="goToGithub">
              <div class="img-box">
                <svg
                    t="1664449732894"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="2540"
                    width="200"
                    height="200"
                >
                  <path
                      d="M512 73.142857q119.428571 0 220.285714 58.857143T892 291.714286 950.857143 512q0 143.428571-83.714286 258T650.857143 928.571429q-15.428571 2.857143-22.857143-4t-7.428571-17.142858q0-1.714286 0.285714-43.714285t0.285714-76.857143q0-55.428571-29.714286-81.142857 32.571429-3.428571 58.571429-10.285715t53.714286-22.285714 46.285714-38 30.285714-60T792 489.142857q0-68-45.142857-117.714286 21.142857-52-4.571429-116.571428-16-5.142857-46.285714 6.285714t-52.571429 25.142857l-21.714285 13.714286q-53.142857-14.857143-109.714286-14.857143t-109.714286 14.857143q-9.142857-6.285714-24.285714-15.428571T330.285714 262.571429 281.714286 254.857143q-25.714286 64.571429-4.571429 116.571428-45.142857 49.714286-45.142857 117.714286 0 48.571429 11.714286 85.714286t30 60 46 38.285714 53.714285 22.285714 58.571429 10.285715q-22.285714 20.571429-28 58.857143-12 5.714286-25.714286 8.571428t-32.571428 2.857143-37.428572-12.285714T276.571429 728q-10.857143-18.285714-27.714286-29.714286t-28.285714-13.714285l-11.428572-1.714286q-12 0-16.571428 2.571428t-2.857143 6.571429 5.142857 8 7.428571 6.857143l4 2.857143q12.571429 5.714286 24.857143 21.714285t18 29.142858l5.714286 13.142857q7.428571 21.714286 25.142857 35.142857t38.285714 17.142857 39.714286 4 31.714286-2l13.142857-2.285714q0 21.714286 0.285714 50.571428t0.285714 31.142857q0 10.285714-7.428571 17.142858t-22.857143 4q-132.571429-44-216.285714-158.571429T73.142857 512q0-119.428571 58.857143-220.285714T291.714286 132 512 73.142857zM239.428571 703.428571q1.714286-4-4-6.857142-5.714286-1.714286-7.428571 1.142857-1.714286 4 4 6.857143 5.142857 3.428571 7.428571-1.142858z m17.714286 19.428572q4-2.857143-1.142857-9.142857-5.714286-5.142857-9.142857-1.714286-4 2.857143 1.142857 9.142857 5.714286 5.714286 9.142857 1.714286z m17.142857 25.714286q5.142857-4 0-10.857143-4.571429-7.428571-9.714285-3.428572-5.142857 2.857143 0 10.285715t9.714285 4z m24 24q4.571429-4.571429-2.285714-10.857143-6.857143-6.857143-11.428571-1.714286-5.142857 4.571429 2.285714 10.857143 6.857143 6.857143 11.428571 1.714286z m32.571429 14.285714q1.714286-6.285714-7.428572-9.142857-8.571429-2.285714-10.857142 4t7.428571 8.571428q8.571429 3.428571 10.857143-3.428571z m36 2.857143q0-7.428571-9.714286-6.285715-9.142857 0-9.142857 6.285715 0 7.428571 9.714286 6.285714 9.142857 0 9.142857-6.285714z m33.142857-5.714286q-1.142857-6.285714-10.285714-5.142857-9.142857 1.714286-8 8.571428t10.285714 4.571429 8-8z"
                      p-id="2541"
                  ></path>
                </svg>
              </div>
              <div class="star-label">Stars</div>
              <div class="star">{{ githubStars }}</div>
            </div>
          </div>
          <div class="feature-box">
            <Content slot-key="feature1"></Content>
            <Content slot-key="feature2"></Content>
            <Content slot-key="feature3"></Content>
          </div>
        </div>
        <div class="footer">
          <div style="background: #EEEEEE">
            <div class="contact-box">
              <Content slot-key="Vision"></Content>
              <Content slot-key="Disclaimer"></Content>
              <div>
                <Content slot-key="Contact"></Content>
                <div class="wechat-QR-box">
                  <img :src="$withBase('/img/contact-wechat.jpg')" alt="Contact" width=120px height=120px/>
                </div>
              </div>
            </div>
          </div>
          <Content class="content-footer" slot-key="footer"></Content>
        </div>
      </div>
    </template>
  </Base>
</template>
<style scoped>
.home-page {
  height: 100%;
}
.home-page .el-button--danger {
  border-color: #cc2229;
  background-color: #cc2229;
}

.home-page .el-button--danger:hover {
  border-color: #ff0a14;
  background-color: #ff0a14;
}

.content-box {
  padding: 120px 0 20px;
  box-sizing: border-box;
  height: calc(100% - 367px);
  min-height: 745px;
}

.footer {
  background: rgb(238, 238, 238);
  padding-bottom: 16px;
}

.content {
  margin: 0 auto;
  width: 37rem;
  font-size: 24px;
  display: flex;
  justify-content: center;
  margin-top: 7rem;
}

.content-footer {
  margin: 0 auto;
  font-size: 16px;
  text-align: center;
  border-top: 1px solid #d2d6e1;
  background: #EEEEEE
}

.logo-box {
  opacity: 0;
  transition: all 1s;
  width: 496px;
  height: 107px;
  margin: 0 auto;
}

.logo-box > img {
  object-fit: scale-down;
}

.move {
  transform: translate(0, 100px);
  opacity: 1;
}

.button-box {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 35rem;
  margin: 0.8rem auto;
}

.button-box > button {
  margin-left: 0px !important;
}

.github-box {
  width: 140px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #505e86;
  box-sizing: border-box;
  border-radius: 20px;
  padding: 5px;
  color: black;
  background-color: #dde2ef73;
  cursor: pointer;
}

.github-box:hover {
  background-color: #bbbbbb73;
}

.github-box .img-box {
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
}

.github-box .star {
  margin-right: 7px;
}

svg {
  width: 30px;
  height: 30px;
}

.feature-box {
  display: flex;
  justify-content: space-between;
  width: 64rem;
  margin: 2rem auto 0.8rem;
}

.feature-box > div {
  margin: 0 45px 20px;
}

.contact-box {
  display: flex;
  justify-content: space-around;
  width: 64rem;
  margin: 2rem auto 0rem;
  text-align: left;
  font-size: 12px;
  color: #24292F
}

.contact-box > div {
  margin: 0 45px 0px;
}

.wechat-QR-box {
  text-align: center;
}

.el-button--blogs, .el-button--blogs:focus, .el-button--blogs.is-active, .el-button--blogs:active {
  background: #505e86;
  color: #FFFFFF
}

@media (max-width: 1100px) {
  .feature-box {
    flex-direction: column;
    width: auto;
  }
}

@media screen and (min-width: 720px) and (max-width: 1100px) {
  .contact-box {
    flex-direction: column;
    width: auto;
    text-align: left;
  }

  .content-box {
    min-height: 1000px;
  }
}

@media (max-width: 1100px) {
  .wechat-QR-box {
    flex-direction: column;
    width: auto;
    text-align: left;
  }
}

@media (max-width: 719px) {
  .logo-box {
    width: 19.84rem;
    height: 4.28rem;
  }

  .logo-box > img {
    width: 19.84rem;
    height: 4.28rem;
  }

  .contact-box {
    flex-direction: column;
    width: auto;
    text-align: left;
  }

  .content {
    width: 20rem;
  }

  .content-box {
    min-height: 1080px;
  }

  .button-box {
    width: 23rem;
    flex-wrap: wrap;
  }

  .github-box {
    margin-top: 20px;
  }
}
</style>
<script>
import Base from "./Base.vue";

export default {
  name: "HomePage",
  components: {
    Base,
  },
  data() {
    return {
      githubStars: 0,
      move: false,
    };
  },
  created() {
    this.getGithubStars();
  },
  mounted() {
    this.move = true;
  },
  computed: {
    quickStart() {
      return this.$frontmatter.quickStart;
    },
    blogs() {
      return this.$frontmatter.blogs;
    },
  },
  methods: {
    goToDocument() {
      if (this.$router.currentRoute.path.indexOf("/zh/") !== -1) {
        this.$router.push("/zh/document/");
      } else {
        this.$router.push("/en/document/");
      }
    },
    goToBlogs() {
      if (this.$router.currentRoute.path.indexOf("/zh/") !== -1) {
        this.$router.push("/zh/blog/");
      } else {
        this.$router.push("/en/blog/");
      }
    },
    goToGithub() {
      window.open("https://github.com/huaweicloud/Sermant");
    },
    getGithubStars() {
      this.$axios
          .get("https://api.github.com/repos/huaweicloud/sermant")
          .then((res) => {
            this.githubStars = res.data.stargazers_count || 0;
          })
          .catch((err) => {
            console.log(err);
          });
    },
  },
};
</script>