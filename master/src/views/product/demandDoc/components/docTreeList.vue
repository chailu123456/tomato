<template>
  <div class="doc-tree-list">
    <el-input v-model="filterText" :prefix-icon="Search" placeholder="搜索标题" />
    <el-tree
      ref="treeRef"
      class="filter-tree"
      @check="handleCheckBoxEventByText"
      show-checkbox
      node-key="id"
      :data="dataTree"
      :props="defaultProps"
      :default-expanded-keys="defaultExpandedKey"
      :filter-node-method="filterNode"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <i style="font-size: 14px; margin-right: 10px; margin-top: 2px" :class="backClass(data.type)"></i>

          <span>{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed, defineEmits, defineProps } from "vue";
import { ElTree } from "element-plus";
import { Search } from "@element-plus/icons";
import useDemandDoc, { DocTreeParams } from "@/composables/useDemandDoc";
import { store } from "@/store";

interface Tree {
  id: number;
  title: string;
  type: number;
  children?: Tree[];
}
const classIconArr = ["icon-rp", "icon-unknow", "icon-doc", "icon-html", "icon-link"];

const props = defineProps({
  treeDoc: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  },
  dialogShow: {
    type: Boolean,
    default: false
  },
  demandDocForm: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  }
});
const emit = defineEmits(["checkVal"]);

const defaultExpandedKey = ref<number[]>([]);

const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const dataTree = ref<Tree[]>([]);
const productId = computed(() => store?.getters?.productId);

const treeParams = ref<DocTreeParams>({
  product_id: productId.value,
  doc_id: props.treeDoc.id,
  filter_type: props.treeDoc.id ? 2 : 1,
  page_index: 1,
  page_size: 2000
});
const defaultProps = {
  children: "children",
  label: "title",
  value: "id"
};

const { getTreeDocList, getPlanRelativeDoc } = useDemandDoc();

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.title.includes(value);
};

// 返回icon样式
const backClass = (type: number) => {
  return `iconfont ${classIconArr[type - 1]}`;
};

const getTree = async () => {
  if (props.demandDocForm.planId) {
    const data = await getPlanRelativeDoc({ plan_id: props.demandDocForm.planId });
    if (data) {
      dataTree.value = data;
    } else {
      dataTree.value = [];
    }
  } else {
    const curProductId = computed(() => store.getters.productId);
    treeParams.value.product_id = curProductId.value;
    const data = await getTreeDocList(treeParams.value);
    if (data) {
      dataTree.value = data.data_list;

      defaultExpandedKey.value = data.selected_list || [];
      treeRef?.value.setCheckedKeys(defaultExpandedKey.value);
      setTimeout(() => {
        emit("checkVal", treeRef?.value.getCheckedKeys());
      }, 1000);
    } else {
      dataTree.value = [];
    }
  }
};

// 文字搜索时候点击的
const handleCheckBoxEventByText = async (checkedNodes: Record<string, any>) => {
  console.log(checkedNodes);

  // console.log(treeRef?.value.getCheckedNodes(), "---getCheckedNodes----");
  // console.log(treeRef?.value.getCheckedKeys(), "---getCheckedKeys----");
  emit("checkVal", treeRef?.value.getCheckedKeys());

  // treeRef?.value.setCheckedKeys([checkedNodes.id]);
};

watch(
  () => props.dialogShow,
  (newVal) => {
    if (newVal) {
      treeParams.value.doc_id = props.treeDoc.id || 0;
      treeParams.value.filter_type = props.treeDoc.id ? 2 : 1;
      getTree();
    } else {
      filterText.value = "";
    }
  }
);

onMounted(() => {
  getTree();
});
</script>
<style lang="less">
.doc-tree-list {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px;
  height: 360px;
  overflow: hidden;
  margin-bottom: 10px;
  .filter-tree {
    margin-top: 10px;
    height: 320px;
    overflow: scroll;
  }
  .icon-rp {
    color: #713cbe;
  }
  .icon-unknow {
    color: #1d2b80;
  }
}
</style>
