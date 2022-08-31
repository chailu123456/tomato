<template>
  <el-dropdown
    ><el-icon class="drawer-icon-setting" :size="20"><Setting /></el-icon>
    <template #dropdown>
      <el-dropdown-menu class="drawer-icon-setting-menu">
        <el-dropdown-item disabled
          >设置弹框宽度<el-icon><Warning /></el-icon
        ></el-dropdown-item>
        <el-dropdown-item
          :class="{ 'drawer-icon-setting-active': widthPercent == n }"
          v-for="(n, index) in ['100%', '95%', '90%', '85%', '80%', '75%', '70%', '65%', '60%']"
          :key="index"
          @click="changeWidthPercent(n)"
        >
          {{ n }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { defineProps, defineEmits } from "vue";
import { Setting, Warning } from "@element-plus/icons";
export default {
  name: "SettingWidth"
};
</script>

<script lang="ts" setup>
defineProps({
  widthPercent: {
    type: String,
    default: () => {
      return "80%";
    }
  }
});
const emit = defineEmits(["change"]);
const changeWidthPercent = (percent: string) => {
  emit("change", percent);
};
</script>

<style lang="less" scoped>
.drawer-icon-setting {
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
  }
  .drawer-icon-setting-menu {
    position: relative;
  }
}
</style>

<style lang="less">
.rp-drawer-100 {
  position: fixed;
  inset: 0px;
  width: 100%;
  left: 0% !important;
}
.rp-drawer-95 {
  position: fixed;
  inset: 0px;
  width: 95%;
  left: 5% !important;
}
.rp-drawer-90 {
  position: fixed;
  inset: 0px;
  width: 90%;
  left: 10% !important;
}
.rp-drawer-85 {
  position: fixed;
  inset: 0px;
  width: 85%;
  left: 15% !important;
}
.rp-drawer-80 {
  position: fixed;
  inset: 0px;
  width: 80%;
  left: 20% !important;
}
.rp-drawer-75 {
  position: fixed;
  inset: 0px;
  width: 75%;
  left: 25% !important;
}
.rp-drawer-70 {
  position: fixed;
  inset: 0px;
  width: 70%;
  left: 30% !important;
}
.rp-drawer-65 {
  position: fixed;
  inset: 0px;
  width: 65%;
  left: 35% !important;
}
.rp-drawer-60 {
  position: fixed;
  inset: 0px;
  width: 60%;
  left: 40% !important;
}
.drawer-icon-setting-menu {
  .el-dropdown-menu__item {
    line-height: 26px !important;
  }
  .drawer-icon-setting-active {
    background-color: var(--el-dropdown-menuItem-hover-fill);
    color: var(--el-dropdown-menuItem-hover-color);
  }
}
</style>
