<!--
 * @Author: 宋绍华
 * @Date: 2022-04-28 20:40:53
 * @LastEditTime: 2022-06-23 21:43:06
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\fullscreen\index.vue
-->
<template>
  <jsxNode />
</template>

<script lang="tsx" setup>
/**
 * 全屏播放公共组件
 * 用途：用于全屏播放table 数据，不带分页，不带form 表单
 * 用法：<FullScreen v-model:fullscreen="isFullScreen" /> 需要注意点，fullscreen 的样式是绝对定位，外部一定要设置相对定位
 *
 * <Table  :class="{ 'fullscreen-ele-global': isFullScreen }" /> table 上面需要绑定动态的样式，fullscreen-el-global 这个样式已经存在
 * 直接使用就好，不需要再添加多于的。
 *
 * examples:
 *
 *  <div>
 *    <Table  :class="{ 'fullscreen-ele-global': isFullScreen }" />
 *    <FullScreen v-model:fullscreen="isFullScreen" />
 *  </div>
 */
import { defineEmits, defineProps } from "vue";
import { listenFullScreen, toggleFullScreen } from "@/utils";
const emit = defineEmits(["update:fullscreen"]);
const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  }
});
const jsxNode = () => {
  return <span class="fullscreen-icon-global iconfont icon-fullscreen" onClick={onClick}></span>;
};
// 点击事件
const onClick = () => {
  emit("update:fullscreen", !props.fullscreen);
  toggleFullScreen();
  listenFullScreen((isClose: boolean) => {
    emit("update:fullscreen", isClose);
  });
};
</script>

<style lang="less" scoped>
.fullscreen-icon-global {
  position: absolute;
  top: 10px;
  right: 30px;
  font-size: 26px;
  color: #999;
  cursor: pointer;
}

:global(.fullscreen-ele-global) {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 100vh !important;
}

:global(.fullscreen-ele-global .page) {
  display: none;
}
:global(.fullscreen-ele-global .el-table) {
  height: 100vh !important;
  .version__color,
  .cell,
  .time-text__real,
  .overview-span {
    font-size: 17px;
  }
}
</style>
