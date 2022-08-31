<template>
  <el-container class="layout-container">
    <Side />
    <el-container direction="vertical">
      <Header />
      <Main />
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Header, Side, Main } from "./index";
export default defineComponent({
  components: {
    Header,
    Side,
    Main
  }
});
</script>

<style>
.layout-container {
  overflow: hidden;
  height: 100%;
}
</style>
