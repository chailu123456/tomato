<template>
  <el-tree-select
    v-model="currValue"
    filterable
    :data="treeData"
    check-strictly
    ref="moduleSelectTreeRef"
    :teleported="true"
    :filter-method="filterNode"
    :render-after-expand="true"
    :default-expanded-keys="[0]"
    popper-class="module-select-tree"
    @visibleChange="visibleChange"
    @node-click="nodeTreeClick"
  >
    <template #default="{ node }">
      <div v-if="node.key === -1" class="module-manage-btn" @click.stop="showModuleManage">
        <img
          src="data:image/png;base64,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"
          style="width: 20px; height: 20px"
        />
        <span>{{ node.label }}</span>
      </div>
      <div class="node-select-item">
        <span class="module-item-name">{{ node.label }}</span>
      </div>
    </template>
  </el-tree-select>

  <module-manage-dialog v-model:moduleModal="moduleModal" @refreshSelect="refreshSelect"></module-manage-dialog>
</template>

<script lang="ts">
import { defineEmits, defineProps, computed, ref, watch, onMounted, PropType } from "vue";

import { useStore } from "@/store/index";
import { getModuleData } from "./index";
import type { ModuleNode } from "./index";
export default {
  name: "module-select"
};
</script>

<script lang="ts" setup>
const store = useStore();
const productId = computed(() => store?.getters?.productId);
const curProductInfo = computed(() => store?.getters?.productInfo);
const props = defineProps({
  value: {
    type: String,
    default: ""
  },
  list: {
    type: Array as PropType<ModuleNode[]>,
    default: () => []
  }
});
const emit = defineEmits(["update:value", "change", "updateUseCase"]);
const moduleModal = ref(false);
const treeData = ref<ModuleNode[]>([]);
const loading = ref(false);
const expandedKeys = ref<number[]>([]);
const moduleSelectTreeRef = ref();
const currValue = ref("");

// 点击后清空数据

onMounted(() => {
  // 如果有数据传入，就不需要请求接口了

  if (props.list.length) {
    treeData.value = props.list;
  } else {
    getData();
  }
  currValue.value = props.value;
});

watch(
  () => props.list,
  (newVal) => {
    treeData.value = newVal;
  },
  {
    deep: true
  }
);

const getData = async () => {
  loading.value = true;
  const data = await getModuleData({
    id: curProductInfo.value?.id,
    name: curProductInfo.value?.name
  });
  if (data?.length) {
    loading.value = false;
    treeData.value = [
      {
        value: -1,
        label: "管理模块",
        level: -1,
        id: -1,
        name: "管理模块"
      },
      data[0]
    ];
    const children = data[0].children as ModuleNode[];
    expandedKeys.value = [0];
  }
};

const showModuleManage = () => {
  moduleModal.value = true;
  moduleSelectTreeRef?.value.blur();
};

const refreshSelect = (id?: number, parentId?: number, parentName?: string) => {
  getData();
  emit("updateUseCase", id, parentId, parentName);
};

const nodeTreeClick = (data: ModuleNode) => {
  emit("update:value", data.name);
  emit("change", data);
};

const filterNode = (value: string, data: ModuleNode) => {
  if (!value) return true;
  return data?.name.indexOf(value) !== -1;
};

const visibleChange = (val: boolean) => {
  if (currValue.value === -1) currValue.value = props.value;
};

watch(
  () => props.value,
  (val) => {
    currValue.value = props.value;
    moduleSelectTreeRef?.value.filter(val);
  }
);

watch(
  () => productId.value,
  () => {
    getData();
  },
  {
    immediate: true
  }
);
</script>

<style lang="less">
.module-select-tree {
  width: 300px;
  .node-select-item {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
  }
  .el-tree-node__content {
    width: 100%;
    .el-tree-node__expand-icon {
      margin-left: 0;
      padding-left: 8px;
    }
    .el-select-dropdown__item {
      padding: 0;
      height: 40px;
      line-height: 40px;
    }
    .module-item-name {
      width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .el-tree-node:nth-of-type(1) {
    .module-manage-btn {
      height: 40px;
      line-height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-direction: row;
    }
  }
}

.module-select-popover {
  .module-list-container {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    width: 300px;
    .module-list-tree {
      width: 100%;
      margin-bottom: 10px;
      max-height: 400px;
      overflow-y: scroll;
    }

    .module-item-name {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
