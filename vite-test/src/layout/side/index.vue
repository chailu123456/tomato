<template>
  <el-aside class="side-wrapper" width="auto">
    <div class="side-wrapper__collapse" @click="foldOrUnfold">
      <i class="el-icon-s-fold" v-show="!isCollapse"></i>
      <i class="el-icon-s-unfold" v-show="isCollapse"></i>
    </div>
    <div class="side-wrapper__welcome">
      <div class="relative-wrapper">
        <i class="iconfont icon-tuichu" v-show="isCollapse" @click="handleLogout"></i>
        <div class="side-wrapper__container" :class="[isCollapse ? 'side-wrapper__welcome-out' : 'side-wrapper__welcome-in']">
          <h4>{{ currentDate }}:{{ user && user.name }}</h4>
          <p>欢迎登录番茄系统</p>
          <div class="side-wrapper__logout" @click="handleLogout">退出登录</div>
        </div>
        <!-- 消息通知模块 start -->
        <div class="side-wrapper__notice">
          <el-popover placement="right-end" :disabled="!notices" :width="600" v-model:visible="visible">
            <template #reference>
              <div>
                <span class="side-wrapper__notice-circle">{{ notices }}</span>
                <i class="el-icon-bell side-wrapper__notice-icon"></i>
              </div>
            </template>
            <Notices v-model:notices="notices" />
          </el-popover>
        </div>
        <!-- 消息通知模块 end -->
      </div>
    </div>

    <el-row class="tac">
      <el-col :span="24">
        <div class="logo-wrapper">
          <transition name="fade">
            <i class="iconfont icon-fanqielogo3x" v-show="!isCollapse"></i>
          </transition>
          <img class="logo-wrapper__collapse" src="../../assets/collapse-logo.png" alt="" v-show="isCollapse" />
        </div>
        <el-menu
          :uniqueOpened="true"
          :default-active="path"
          @open="handleOpen"
          @close="handleClose"
          text-color="#fff"
          active-text-color="rgba(31, 159, 133, 1"
          background-color="rgba(31, 159, 133, 1)"
          class="el-menu-vertical-collapse"
          :collapse="isCollapse"
          :router="true"
        >
          <el-submenu v-for="(item, i) in menu" :index="item.path" :key="i">
            <template #title>
              <i :class="item.meta.icon" class="iconfont iconfont-margin"></i>
              <span>{{ item.meta.title }}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item :index="item.path + '/' + route.path" v-for="(route, index) in item.children" :key="index">
                {{ route.meta.title }}
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-col>
    </el-row>
  </el-aside>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store/index";
import { clearSession } from "@/utils";
import Notices from "@/components/notices/index.vue";
export default defineComponent({
  components: {
    Notices
  },
  data() {
    return {
      notices: -1
    };
  },
  setup() {
    // 是否折疊起来
    let isCollapse = ref(false);
    const visible = ref(false);
    const handleOpen = () => {
      // console.log(1);
    };
    const handleClose = () => {
      // console.log(3);
    };
    const { getters } = useStore();
    const store = useStore();
    const router = useRouter();
    const path = computed(() => {
      document.title = `Tomato-项目管理工具-${router.currentRoute.value.meta.title}`;
      if (router.currentRoute.value.path === "/iteration/applyTest") return "/iteration/test";
      return router.currentRoute.value.path;
    });
    const menu = computed(() =>
      router
        .getRoutes()
        .find((router) => router.name === "layout")!
        .children.filter((v) => {
          let childrenList = v.children ? v.children : [];
          v.children = childrenList.filter((item) => item.meta?.hidden !== false);
          return v.meta?.hidden !== false;
        })
    );
    const foldOrUnfold = () => {
      isCollapse.value = !isCollapse.value;
    };
    const handleLogout = () => {
      clearSession("user");
      store.commit("USER", null);
      router.push({
        path: "/"
      });
    };

    const currentDate = computed(() => {
      const timeRang: Record<string, any> = {
        早上好: { min: 5, max: 12 },
        中午好: { min: 12, max: 14 },
        下午好: { min: 14, max: 18 },
        晚上好: [
          { min: 0, max: 5 },
          { min: 18, max: 25 }
        ]
      };
      const date = +new Date().getHours();
      function getText() {
        for (let key in timeRang) {
          if (Array.isArray(timeRang[key])) {
            for (let i = 0; i < timeRang[key].length; i++) {
              if (isRang(timeRang[key][i])) {
                return key;
              }
            }
          } else {
            if (isRang(timeRang[key])) {
              return key;
            }
          }
        }
      }
      function isRang(rule: Record<string, any>) {
        if (date >= rule.min && date < rule.max) {
          return true;
        }
      }
      return getText();
    });
    return {
      path,
      user: computed(() => getters.user),
      currentDate,
      handleOpen,
      handleClose,
      menu,
      foldOrUnfold,
      isCollapse,
      handleLogout,
      visible
      // t
    };
  }
});
</script>

<style lang="less" scoped>
.side-wrapper {
  position: relative;
  user-select: none;
  background: rgba(31, 159, 133, 1);
  .logo-wrapper {
    width: 100%;
    height: 100px;
    color: #fff;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .side-wrapper__collapse {
    cursor: pointer;
    color: #fff;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    &:hover {
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    i {
      font-size: 20px;
    }
  }
  .side-wrapper__welcome {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 134px;

    .side-wrapper__container {
      overflow: hidden;
      border-radius: 10px;
      background: #fff;
      position: relative;
      height: 100%;
      .side-wrapper__logout {
        cursor: pointer;
        font-size: 14px;
        margin: 25px auto 10px;
        width: 80%;
        height: 36px;
        background: #1f9f85;
        color: #fff;
        text-align: center;
        border-radius: 10px;
        line-height: 36px;
        &:hover {
          opacity: 0.8;
          transition: opacity 0.2s;
        }
      }
    }
    .relative-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    h4 {
      // padding-top: 10px;
      text-align: center;
      line-height: 10px;
      font-size: 14px;
    }
    p {
      text-align: center;
      line-height: 5px;
      font-size: 12px;
      color: #85899c;
    }
  }
  .side-wrapper__welcome-out {
    transition: all 0.2s;
    opacity: 0;
  }
  .side-wrapper__welcome-in {
    transition: all 1.2s;
    opacity: 1;
  }
  .side-wrapper__notice {
    position: absolute;
    bottom: -70px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    cursor: pointer;
    &-circle {
      position: relative;
      z-index: 2;
      margin-left: 20px;
      margin-bottom: -8px;
      width: 30px;
      height: 30px;
      background-color: red;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #fff;
    }
    &-icon {
      font-size: 25px;
      color: #fff;
    }
  }
  .icon-tuichu {
    z-index: 9;
    position: absolute;
    font-size: 20px;
    color: #fff;
    bottom: 0;
    left: 50%;
    font-size: 20px;
    transform: translateX(-50%);
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .iconfont-margin {
    margin-right: 10px;
  }
  .icon-fanqielogo3x {
    font-size: 50px;
  }
  .logo-wrapper__collapse {
    width: 50px;
  }
}
</style>
