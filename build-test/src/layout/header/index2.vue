<!--
 * @Author: 宋绍华
 * @Date: 2022-05-10 15:00:13
 * @LastEditTime: 2022-05-17 20:36:01
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\index2.vue
-->
<template>
  <header class="header">
    <!-- 项目切换 -->
    <ProjectNav />
    <!-- 路由展示 -->
    <RouterNav />
    <!-- 工具栏 -->
    <ToolNav />
  </header>
</template>

<script lang="ts">
import ProjectNav from "./components/projectNav.vue";
import RouterNav from "./components/routerNav.vue";
import ToolNav from "./components/toolNav.vue";
export default {
  name: "header",
  components: {
    ProjectNav,
    RouterNav,
    ToolNav
  }
};
</script>

<script lang="ts" setup></script>
<style lang="less" scoped>
.header {
  height: 42px;
  line-height: 42px;
  background-color: #fff;
  display: flex;
  padding: 0 10px;
  align-items: center;
  justify-content: space-between;
}
</style>
