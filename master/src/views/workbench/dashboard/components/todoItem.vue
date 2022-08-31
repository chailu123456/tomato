<!--
 * @Author: 宋绍华
 * @Date: 2022-06-22 14:36:50
 * @LastEditTime: 2022-06-22 15:29:39
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\workbench\dashboard\components\todoItem.vue
-->
<template>
  <div :key="data?.id" class="item" :style="getStyles(data?.type)">
    <span class="item-time">{{ data?.start_time }}</span
    >{{ data?.name }}
  </div>
</template>

<script lang="ts">
import { defineProps, PropType } from "vue";
export default {
  name: "todoItem"
};
</script>

<script lang="ts" setup>
interface TodoItem {
  id: number;
  name: string;
  start_time: string;
  status: number;
  type: number;
}

defineProps({
  data: {
    type: Object as PropType<TodoItem>,
    default: () => {
      return {};
    }
  }
});

const styles = [
  {
    bg: "rgba(255, 75, 75, 0.1)",
    border: "#ff777e",
    color: "#333"
  },
  {
    bg: "rgba(255, 222, 99, 0.1)",
    border: "#ffde63",
    color: "#333"
  },
  {
    bg: "rgba(34, 163, 119, 0.1)",
    border: "#22A377",
    color: "#333"
  },
  {
    bg: "rgba(211, 223, 221, 0.2)",
    border: "#C9D8D5",
    color: "#999"
  }
];
// type 1.过期 2.未开始 3.进行中 4.已完成
const getStyles = (type: number) => {
  if (type >= 1) {
    const { bg, border, color } = styles[type - 1];
    return {
      background: bg,
      color,
      "border-left": `4px solid ${border}`
    };
  }
};
</script>
<style lang="less" scoped>
.item {
  margin-bottom: 10px;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  &-time {
    margin-right: 20px;
  }
  &:hover {
    background-color: #f2f5f9;
  }
}
</style>
