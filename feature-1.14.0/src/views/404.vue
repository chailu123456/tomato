<template>
  <el-result title="" subTitle="很抱歉，您访问的页面不存在，如果你对此存在疑惑，请联系管理员">
    <template #icon>
      <el-image src="https://www.17sucai.com/preview/32325/2021-05-10/404/images/404.png"></el-image>
    </template>
    <template #extra>
      <router-link to="/">
        <el-button type="primary" size="medium">返回首页</el-button>
      </router-link>
    </template>
  </el-result>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "page-not-found"
});
</script>
