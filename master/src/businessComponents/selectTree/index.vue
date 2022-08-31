<template>
  <el-tree-select
    v-model="product_module_id"
    :filter-node-method="filterNodeMethod"
    filterable
    :data="treeData"
    check-strictly
    ref="cascaderVal"
    :clearable="isClear"
    :teleported="false"
    :render-after-expand="false"
    :default-expanded-keys="[0]"
    @node-click="handleNodeClick"
    @clear="handleClearTree('delete')"
  />
</template>

<script lang="ts" setup>
import { getSettingModule } from "@/api/request-modules/product";
import { useStore } from "@/store";

import { ref, defineProps, onMounted, defineEmits, defineExpose, computed, watch } from "vue";

interface ModuleNode {
  value: number;
  label: string;
  level: number;
  parent_id: number;
  product_id: number;
  id?: number;
  name?: string;
  parent_name?: string;
  parent_path?: string;
  children?: Array<ModuleNode> | undefined;
}
interface filterModuleNode {
  label: string;
  level: number;
  parent_id: number;
  product_id: number;
  seq: number;
  value: number;
}

const props = defineProps({
  moduleId: {
    type: Number
  },
  isClear: {
    type: Boolean,
    default: () => true
  }
});
const cascaderVal = ref();

let emit = defineEmits(["change"]);
const productId = computed(() => store?.getters?.productId);

const product_module_id = !props.isClear ? computed(() => props.moduleId) : ref();
const store = useStore();

let treeList: ModuleNode[] = [];
const treeData = ref(treeList);

let m_id = -1;

// 监听项目id变化，需要更新数据
watch(
  () => productId.value,
  (newVal) => {
    newVal && getModuleData();
  }
);

const handleNodeClick = (node: Record<string, any>) => {
  emit("change", [node.value]);
};

const handleClearTree = (c?: string) => {
  if (c === "delete") {
    product_module_id.value = "";
    m_id = -1;
  } else if (props.isClear) {
    product_module_id.value = "";
  }

  if (m_id !== -1) product_module_id.value = Number(m_id);
  emit("change", []);
};

// 搜索组件中确定搜索后保存下来
const confirmSearch = (val: number[]) => {
  if (val && val.length) {
    m_id = val[0];
    product_module_id.value = Number(m_id);
  } else m_id = -1;
};

defineExpose({ handleClearTree, confirmSearch });

const getModuleData = () => {
  if (!productId.value) return;
  getSettingModule({ product_id: productId.value }).then(async (res: any) => {
    if (res.data) {
      treeList[0] = res?.data;
      treeData.value = [res?.data];
    }
  });
};

onMounted(() => {
  getModuleData();
});
const filterNodeMethod = (value: string, data: filterModuleNode) => {
  return data.label.includes(value);
};
</script>
<style scoped lang="less"></style>
