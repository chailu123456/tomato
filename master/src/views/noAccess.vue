<!--
 * @Author: 宋绍华
 * @Date: 2022-07-28 14:34:40
 * @LastEditTime: 2022-08-18 10:52:45
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\noAccess.vue
-->
<template>
  <el-result title="" subTitle="很抱歉，内容不存在或没有权限访问此数据，如果您对此存在疑惑，请联系项目负责人">
    <template #icon>
      <img style="width: 500px" src="../assets/no-access.png" alt="no access" />
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
  name: "page-not-access"
};
</script>

<script lang="ts" setup>
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
import { onMounted } from "vue";

onMounted(() => {
  store.commit(MutationType.updateProductId, 0);
});
</script>
