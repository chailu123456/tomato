<!--
 * @Author: 宋绍华
 * @Date: 2021-10-30 16:26:32
 * @LastEditTime: 2022-05-28 14:50:39
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\index.vue
-->
<template>
  <el-container class="layout-container">
    <Side />
    <el-container direction="vertical">
      <Header2 />
      <Main class="main-content" />
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Header2, Side, Main } from "./index";

export default {
  components: {
    Header2,
    Side,
    Main
  }
};
</script>

<script lang="ts" setup>
import { onMounted } from "vue";
import { store } from "@/store";

onMounted(() => {
  store?.dispatch("GETPRODUCTLIST");
});
</script>
<style>
.layout-container {
  overflow: hidden;
  height: 100%;
}
</style>
