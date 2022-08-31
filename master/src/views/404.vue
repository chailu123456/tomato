<!--
 * @Author: 宋绍华
 * @Date: 2021-10-30 16:26:32
 * @LastEditTime: 2022-04-29 12:24:27
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\404.vue
-->
<template>
  <el-result title="" subTitle="很抱歉，您访问的页面不存在，如果你对此存在疑惑，请联系管理员">
    <template #icon>
      <img style="width: 600px" src="../assets/404.png" alt="404" />
    </template>
    <template #extra>
      <router-link to="/">
        <el-button type="primary">返回首页</el-button>
      </router-link>
    </template>
  </el-result>
</template>

<script lang="ts">
export default {
  name: "page-not-found"
};
</script>
