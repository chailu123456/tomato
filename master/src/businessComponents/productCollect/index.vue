<!--
 * @Author: 宋绍华
 * @Date: 2022-07-13 09:08:14
 * @LastEditTime: 2022-08-16 11:57:07
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\businessComponents\productCollect\index.vue
-->
<template>
  <div class="collect">
    <el-cascader
      popper-class="collect-popper-class"
      :options="list"
      :show-all-levels="false"
      collapse-tags
      :props="props2"
      v-model="currentVal"
      @visible-change="visibleChange"
      @remove-tag="removeTag"
      ref="cascader"
    >
      <template #default="{ data }">
        <div :class="{ 'collect-item': data.isLast }">{{ data.name }}</div>
      </template>
    </el-cascader>
  </div>
</template>

<script lang="ts" setup>
import useBoardBase, { TeamProductItem } from "@/composables/useBoardBase";
import { setSession } from "@/utils/sesssion";
import { ElMessage } from "element-plus";
import { isEqual } from "lodash";
import { ref, defineEmits, PropType, defineProps, watch, defineExpose, onMounted } from "vue";
const emit = defineEmits(["onChange"]);
const props = defineProps({
  list: {
    type: Array as PropType<TeamProductItem[]>,
    default: () => []
  },
  propVal: {
    type: Array as PropType<number[]>,
    default: () => []
  }
});
const props2 = {
  multiple: true,
  // checkStrictly: true,
  label: "name",
  value: "id",
  children: "list"
};

const currentVal = ref<number[]>();
const { getGroupIds, boardBaseRt, useInitGetProductList } = useBoardBase();
const cascader = ref();
let timer: ReturnType<typeof setTimeout>;
defineExpose({
  currentVal,
  cascader
});
watch(
  () => props.propVal,
  (newVal) => {
    if (newVal) {
      currentVal.value = newVal;
    }
  },
  {
    deep: true,
    immediate: true
  }
);

// 获取当前选中节点ids
const getNodeIds = () => {
  const nodes = cascader.value?.getCheckedNodes();
  if (Array.isArray(nodes) && nodes.length) {
    return nodes.map((item) => item.value || item.data.id);
  }
  return [];
};

// 设置最新的ids
const setNewIds = () => {
  const nodes = getNodeIds();
  // 如果不存在，给一个默认值
  boardBaseRt.currentGroupIds = nodes.length ? nodes : [boardBaseRt.teamProductList[0].id];
  boardBaseRt.currentProIds = getGroupIds(nodes.length ? nodes : [boardBaseRt.teamProductList[0].id]);
};

const compareIds = (ids: number[]) => {
  return isEqual(ids, boardBaseRt.currentProIds);
};

// 面板消失触发事件
const visibleChange = (val: boolean) => {
  if (val) return;
  // 如果当前没有选中项目，默认之前一个项目
  if (!getNodeIds().length) {
    // currentVal.value = boardBaseRt.currentGroupIds;
    cascader.value.togglePopperVisible(true);

    return ElMessage.warning("至少选中一个项目");
  }
  const ids = getGroupIds(getNodeIds());
  boardBaseRt.currentGroupIds = getNodeIds();
  // 设置最新的ids
  setSession("selectedProductIds", boardBaseRt.currentGroupIds.toString());

  const isEqual = compareIds(ids);
  if (!isEqual) {
    emit("onChange", ids);
  }
};
// 移出tag事件
const removeTag = (val: number[]) => {
  // 去重后的数组
  const dedupIds = [...new Set(currentVal.value?.flat(1))];
  // 获取删除后的数组
  const curIds = dedupIds?.filter((i) => i !== val[0]);

  boardBaseRt.currentGroupIds = getNodeIds();
  // 获取数组ids
  const ids = getGroupIds(curIds ?? []);

  emit("onChange", ids);
};

onMounted(async () => {
  const hasIds = !!getNodeIds().length;
  await useInitGetProductList(hasIds);
  if (hasIds) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      setNewIds();
    }, 500);
  }
});
</script>

<style lang="less" scoped>
:global(.collect .el-cascader) {
  min-width: 220px;
  margin-bottom: 10px;
}

:global(.collect .el-cascader .el-tag__close) {
  display: none;
}

.collect {
  &-item {
    &:before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 8px;
      height: 1px;
      background-color: #ddd;
      width: 90%;
    }
  }
}

:global(.collect-popper-class .el-cascader-menu__wrap.el-scrollbar__wrap) {
  height: 304px;
}
</style>
