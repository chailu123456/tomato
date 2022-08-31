<template>
  <el-dialog v-model="visibleTree" title="关联需求文档" width="30%" :before-close="beforeClose">
    <div class="doc-tree-list" :before-close="beforeClose">
      <el-input v-model="filterText" :prefix-icon="Search" placeholder="搜索标题" />
      <el-tree
        ref="treeRef"
        class="filter-tree"
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
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visibleTree', false)">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed, defineEmits, defineProps } from "vue";
import { ElTree } from "element-plus";
import { Search } from "@element-plus/icons";
import useDemandDoc from "@/composables/useDemandDoc";
import { store } from "@/store";

interface Tree {
  id: number;
  title: string;
  type: number;
  children?: Tree[];
}
const classIconArr = ["icon-rp", "icon-unknow", "icon-doc", "icon-html", "icon-link"];
const iterateId = computed(() => store?.getters?.iterateId);

const props = defineProps({
  treeDoc: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  },
  visibleTree: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["update:visibleTree", "callBack"]);

const defaultExpandedKey = ref<number[]>([]);

const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const dataTree = ref<Tree[]>([]);

const defaultProps = {
  children: "children",
  label: "title",
  value: "id"
};

const { getTreeRlativeDoc, updateRelativeDoc } = useDemandDoc();

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
  if (!iterateId.value) return;
  const data = await getTreeRlativeDoc({ iteration_id: iterateId.value });
  if (data) {
    dataTree.value = data.data_list;

    defaultExpandedKey.value = data.selected_list || [];
    setTimeout(() => {
      if (treeRef.value) {
        treeRef?.value.setCheckedKeys(defaultExpandedKey.value);
      }
    }, 500);
  }
};

const submit = async () => {
  if (treeRef.value) {
    const ids: number[] = (treeRef.value.getCheckedKeys() as number[]) || [];

    const data = await updateRelativeDoc({ iteration_id: iterateId.value, doc_ids: ids });
    if (data) {
      beforeClose();
      emit("callBack");
    }
    console.log(888);
  }
};

watch(
  () => props.visibleTree,
  (newVal) => {
    if (newVal) {
      getTree();
    } else {
      filterText.value = "";
    }
  }
);

onMounted(() => {
  getTree();
});
const beforeClose = () => {
  emit("update:visibleTree", false);
};
</script>
<style lang="less">
.doc-tree-list {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px;
  height: 360px;
  overflow: hidden;
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
