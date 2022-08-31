<!--
 * @Author: 宋绍华
 * @Date: 2022-05-11 10:59:13
 * @LastEditTime: 2022-06-08 01:36:07
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\components\projectNavSearch.vue
-->
<template>
  <el-popover :width="350" popper-class="projectNavSearch" placement="bottom-end" ref="popoverRef" :virtual-ref="buttonRef" trigger="click" virtual-triggering>
    <el-input v-trim @input="filterList" class="search-input" :prefix-icon="Search" v-model="val" :placeholder="placeholder"></el-input>
    <el-checkbox-group class="search-ck" v-model="checkList" @change="filterList">
      <el-checkbox v-for="item in statusList" :key="item.value" :value="item.value" :label="item.value">{{ item.label }}</el-checkbox>
    </el-checkbox-group>
    <ul class="search-ul" v-if="compList.length">
      <li class="search-ul-li" :class="{ 'search-ul-li-active': n.id === curId }" @click="selectItem(n)" v-for="(n, idx) in compList" :key="idx">
        {{ props.type === "iteration" ? n.full_name : n.name }}
      </li>
    </ul>
    <ul v-else class="empty">
      <span class="empty-text">无匹配数据</span>
    </ul>
  </el-popover>
</template>

<script lang="ts">
import { ref, defineProps, defineExpose, defineEmits, watch, PropType, nextTick } from "vue";
import { Search } from "@element-plus/icons-vue";
import { Iterate } from "@/composables/useBoardBase";
import { ProjectItem } from "@/composables/useCommon";

export type ProjectNavSearchType = "project" | "iteration";
export default {
  name: "projectNavSearch"
};
</script>

<script lang="ts" setup>
const props = defineProps({
  buttonRef: {
    type: HTMLSpanElement
  },
  placeholder: {
    type: String,
    default: "项目名称搜索"
  },
  type: {
    // 类型 项目 project，迭代 iteration
    type: String as PropType<ProjectNavSearchType>,
    default: "project"
  },
  list: {
    type: Array as PropType<Iterate[] | ProjectItem[]>,
    default: () => []
  },
  currentId: {
    // 当前项目id
    type: [Number, String],
    default: 0
  }
});

const emit = defineEmits(["onSelect"]);
// 迭代时进行中的状态
const iterDoing = [1, 2, 3, 4, 5, 8];
// ref
const popoverRef = ref();
// input val
const val = ref();
// 选择框
const checkList = ref([1, 2]);
// 1: 未开始 2: 进行中 3: 搁置 4：结项
const proStatusList = [
  {
    value: 1,
    label: "未开始"
  },
  {
    value: 2,
    label: "进行中"
  },
  {
    value: 3,
    label: "搁置"
  },
  {
    value: 4,
    label: "结项"
  }
];
// 1: 未开始 2: 进行中 3: 已发布 4：已搁置
const iterStatusList = [
  {
    value: 0,
    label: "未开始"
  },
  {
    value: -1,
    label: "进行中"
  },
  {
    value: 6,
    label: "已发布"
  },
  {
    value: 7,
    label: "已搁置"
  }
];
// 状态列表
const statusList = ref<{ value: number; label: string; color?: string }[]>(proStatusList);
const compList = ref<Iterate[] | ProjectItem[]>([]);
const curId = ref<number>();

watch(
  [() => props.currentId, () => props.list, () => props.type],
  ([newCurId, newList, newType]) => {
    if (newCurId) curId.value = newCurId;
    if (newList) {
      compList.value = newList;
    }
    if (newType === "project") {
      statusList.value = proStatusList;
    } else if (newType === "iteration") {
      if (checkList.value.includes(2)) {
        checkList.value = [-1, 0];
      }
      statusList.value = iterStatusList;
    }
    if (compList.value.length) {
      nextTick(() => {
        filterList();
      });
    }
  },
  {
    immediate: true,
    deep: true
  }
);

// 对外输出
defineExpose({
  popoverRef: popoverRef.value
});

// 选择item
const selectItem = (n: Iterate | ProjectItem) => {
  // 关掉popover
  popoverRef.value?.hide();
  curId.value = n.id;
  emit("onSelect", props.type, n);
};

const filterList = () => {
  const value = val.value?.trim();
  compList.value = props.list;
  const checks = checkList.value;
  // 这里合并数据是因为迭代进行包含几个状态，因此需要把其他状态也加进来
  const statusArr = props.type === "iteration" && checks.includes(-1) ? [...iterDoing, ...checks] : checks;
  // @ts-ignore
  const arr = compList.value.filter((item) => {
    const status = props.type === "project" ? item.state : item.status;
    return (!checks.length || statusArr.includes(status)) && (!value || (props.type === "iteration" ? item.full_name : item.name).includes(value));
  });

  compList.value = arr;
};
</script>
<style lang="less" scoped>
.search {
  &-input {
    margin-bottom: 5px;
  }

  &-ul {
    max-height: 300px;
    min-height: 200px;
    overflow-y: scroll;
    border-top: 1px solid #ddd;
    &-li {
      padding: 10px 0;
      cursor: pointer;

      &:hover,
      &-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary-light-3);
      }
    }
  }
}

.empty {
  font-size: 12px;
  color: #888;
  padding: 10px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>
