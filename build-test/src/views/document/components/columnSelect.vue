<!--
 * @Author: 宋绍华
 * @Date: 2022-04-07 20:59:01
 * @LastEditTime: 2022-04-14 16:11:45
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\document\components\columnSelect.vue
-->
<template>
  <div :class="$style.columnSelect">
    <span :class="$style.columnSelectSpan">所有分类</span>
    <el-cascader popper-class="columnSelectCascader" :options="list" v-model="curVal" debounce @change="onChange" :props="props1" clearable filterable />
  </div>
</template>

<script lang="ts">
import { ColumnItemInter } from "@/composables/useDocument";
import { ref, useCssModule, defineEmits, withDefaults, defineProps, computed } from "vue";
export default {
  name: "column-select"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["change"]);
const props = withDefaults(
  defineProps<{
    trees: ColumnItemInter;
    columnVal: string;
  }>(),
  {
    columnVal: ""
  }
);
const $style = useCssModule();
const curVal = ref(typeof props.columnVal === "string" ? props.columnVal.split(",").map((i) => parseInt(i)) : [parseInt(props.columnVal)]);
// 配置cascader的配置
const props1 = {
  checkStrictly: true,
  value: "id",
  label: "name"
  // lazy: true
};
// select list
const list = computed(() => {
  return props.trees;
});

const onChange = (val: any) => {
  emit("change", val);
};
</script>
<style lang="less" module>
.columnSelect {
  &Span {
    margin-right: 10px;
    display: block;
    margin-bottom: 7px;
  }
}
:global(.columnSelectCascader .el-cascader-node) {
  max-width: 200px;
}
</style>
