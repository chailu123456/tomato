<!--
 * @Author: 宋绍华
 * @Date: 2022-01-13 14:46:21
 * @LastEditTime: 2022-01-18 21:11:08
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\demandPool\components\priorityPopup.vue
-->
<template>
  <el-dropdown trigger="click" @command="onCommand">
    <div class="el-dropdown-link">
      <p
        class="index-priority"
        :style="{
          fontSize: '12px',
          color: PRIORITY[item.level - 1]?.color ? PRIORITY[item.level - 1].color : '#dd0101'
        }"
      >
        {{ item.level ? PRIORITY[item.level - 1].value : "-" }}
      </p>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :command="n" :style="{ color: n.color }" v-for="n in filterPriority" :disabled="item.status === 999" :key="n.id">{{
          n.value
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
export default {
  name: "PriorityPopup"
};
</script>

<script lang="ts" setup>
import { defineProps, computed, defineEmits, withDefaults } from "vue";
import { RequireListItem, PRIORITYINTER } from "@/types/interface";
import { PRIORITY } from "@/utils/contantOptions";

const props = withDefaults(
  defineProps<{
    item: RequireListItem;
  }>(),
  {}
);
const emit = defineEmits(["changePriority"]);

// 过滤下当前值
const filterPriority = computed(() => PRIORITY);

// 切换优先级
const onCommand = (val: PRIORITYINTER) => {
  emit("changePriority", val, props.item);
};
</script>

<style lang="less" scoped>
.el-dropdown-link {
  cursor: pointer;
}

.index-priority {
  position: relative;
  display: block;
  &::before {
    content: "";
    width: 0;
    height: 0;
    border-top: 5px solid #605353;
    border-right: 4px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 4px solid transparent;
    position: absolute;
    right: -15px;
    top: 70%;
    transform: translateY(-50%);
  }
}
</style>
