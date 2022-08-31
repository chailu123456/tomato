<!--
 * @Author: 宋绍华
 * @Date: 2022-05-13 17:39:09
 * @LastEditTime: 2022-05-29 12:00:54
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\drawer\dynamic.vue
-->
<template>
  <div class="dynamic">
    <span class="dynamic-title">动态</span>
    <el-timeline>
      <el-timeline-item v-for="(item, index) in list" :key="item.info + index" center placement="top" :timestamp="item.create_time">
        <span class="rich-content" v-html="item.info"></span>
        <div class="rich-remark" v-if="item.remark?.trim()">
          <span class="rich-remark-title">备注：</span>
          <span v-html="item.remark"></span>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script lang="ts">
export default {
  name: "dynamic"
};
</script>

<script lang="ts" setup>
import { defineProps } from "vue";
import type { PropType } from "vue";

interface DynamicList {
  create_time: string;
  info: string;
  remark?: string;
}
defineProps({
  // 动态列表、时间线
  list: {
    type: Array as PropType<DynamicList[]>,
    default: () => []
  }
});
</script>
<style lang="less" scoped>
.dynamic {
  color: #666;
  :deep(img) {
    max-width: 100%;
  }
  &-title {
    margin-bottom: 10px;
    display: block;
  }
}

.rich-remark {
  display: flex;
  align-items: center;

  &-title {
    font-weight: bold;
  }
}

:global(.dynamic .el-timeline-item__wrapper) {
  top: 14px;
}
</style>
