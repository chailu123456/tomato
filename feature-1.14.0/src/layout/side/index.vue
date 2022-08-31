<template>
  <el-aside class="side-wrapper" width="auto">
    <div class="side-wrapper__collapse"></div>
    <el-row class="tac">
      <el-col :span="24">
        <div class="logo-wrapper">
          <!-- <i class="iconfont logo-top icon-fanqielogo3x"></i> -->
          <img style="width: 40px; margin-top: -10px" src="@/assets/rp_logo.png" alt="" />
          <!-- <i class="iconfont logo-bottom icon-fanqielogo3x"></i> -->
        </div>
        <el-menu
          :default-active="path"
          text-color="#fff"
          active-text-color="rgb(255, 255, 255)"
          background-color="rgba(31, 159, 133, 1)"
          class="el-menu-vertical-collapse"
          :router="true"
        >
          <el-menu-item v-for="(item, i) in menu" :index="item.path" :key="i">
            <template #title>
              <el-tooltip popper-class="atooltip" effect="dark" :content="item.meta.title" placement="right">
                <i :class="item.meta.icon" class="iconfont iconfont-margin"></i>
              </el-tooltip>
            </template>
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
  </el-aside>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store/index";
import { clearSession } from "@/utils";

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const path = computed(() => {
      clearSession("jumpUrl");
      document.title = `番茄-${router.currentRoute.value.meta.title}`;
      return `/${router.currentRoute.value.path.split("/")[1]}`;
    });
    const menu = computed(() => {
      const menuArr = router
        .getRoutes()
        .find((router) => router.name === "layout")!
        .children.filter((v) => {
          let childrenList = v.children ? v.children : [];
          v.children = childrenList.filter((item) => item.meta?.hidden !== false);
          return v.meta?.hidden !== false;
        });
      // 判断有无权限访问配置模块，过滤掉路由configure
      if (store.state.permission) {
        if (!store.state.permission.config_operation) {
          menuArr.forEach((item, index) => {
            if (item.name === "configure") menuArr.splice(index, 1);
          });
        }
      }
      return menuArr;
    });

    return {
      path,
      menu
    };
  }
});
</script>

<style lang="less" scoped>
.side-wrapper {
  position: relative;
  width: 50px !important;
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
    flex-wrap: wrap;
    .logo-top {
      position: absolute;
      top: 14px;
      left: 8px;
      font-size: 32px;
    }
    .logo-bottom {
      position: absolute;
      margin-top: 26px;
      left: -22px;
      font-size: 24px;
    }
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
    // font-weight: 700;
  }
  .iconfont {
    font-size: 20px;
    color: #fff;
  }
  .icon-fanqielogo3x {
    font-size: 40px;
  }
  .icon-gongzuotai2 {
    font-size: 17px;
  }
  .icon-wendang {
    font-size: 21px;
  }
  .icon-gongzuotai1 {
    font-size: 24px;
  }
  .icon-shezhi2 {
    font-size: 24px;
    position: absolute;
    left: 12px;
    font-weight: 700;
  }

  :deep(.is-active) {
    background-color: rgba(0, 0, 0, 0.2) !important;
  }
  :deep(.is-active i) {
    color: #fff;
  }
  .el-menu-vertical-collapse {
    width: 100%;
    background: #1f9f85;
  }
  :deep(.el-menu-item) {
    padding-left: 16px !important;
    &:hover {
      background-color: rgba(0, 0, 0, 0.2) !important;
    }
  }
  :deep(.el-menu-item:nth-child(2)) {
    padding-left: 15px !important;
  }
  :deep(.el-menu-item:nth-child(3)) {
    padding-left: 15px !important;
  }
  :deep(.el-menu-item:nth-child(4)) {
    padding-left: 14px !important;
  }
}
</style>
<style lang="less">
.atooltip.el-tooltip__popper[x-placement^="right"] .popper__arrow {
  // border-top-color: pink;
  opacity: 0.3;
}
.atooltip.el-tooltip__popper[x-placement^="right"] .popper__arrow:after {
  // border-top-color: pink;
  opacity: 0.3;
}
.atooltip {
  opacity: 0.6;
}
</style>
