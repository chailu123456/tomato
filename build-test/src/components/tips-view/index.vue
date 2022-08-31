<!--
 * @Author: 宋绍华
 * @Date: 2022-04-22 15:20:52
 * @LastEditTime: 2022-06-15 10:39:02
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\tips-view\index.vue
-->
<template>
  <el-popover placement="bottom-start" :width="400" trigger="hover">
    <template #reference>
      <el-icon class="el-icon-warning-outline"> <warning /> </el-icon>
    </template>
    <slot></slot>
  </el-popover>
</template>

<script lang="ts">
export default {
  name: "tips-view"
};
</script>

<script lang="ts" setup>
import { Warning } from "@element-plus/icons";
</script>

<style lang="less" scoped>
.el-icon-warning-outline {
  color: rgba(45, 153, 255);
  font-size: 15px;
  cursor: pointer;
  position: absolute;
  right: -18px;
  top: 4px;

  &:before {
    position: absolute;
    left: -20px;
    top: -13px;
  }
}

span {
  display: inline-block;
  width: 20px;
  height: 10px;
}

.green-block {
  color: #1f9f85;

  span {
    background: #1f9f85;
  }
}

.red-block {
  color: red;

  span {
    background: red;
  }
}

.yellow-block {
  color: #80ad0a;

  span {
    background: #80ad0a;
  }
}
</style>
