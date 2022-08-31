<template>
  <el-dialog custom-class="moveChild" :before-close="beforeClose" v-model="moveChildVisible" title="移动子文档" width="30%">
    <div class="moveChildDialog">
      <div class="moveChildTitle">
        <div class="moveChildTitle">选择目标文档 (即您想要移动到的文档)</div>
        <el-select v-model="parentNode" @change="onChange" class="m-2" filterable placeholder="请选择">
          <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id" />
        </el-select>
      </div>
      <div>
        <div style="font-weight: 700">选择所属父文档</div>
        <div class="tree-menu-list">
          <el-tree
            style="background-color: #fff"
            :data="menuData"
            :highlight-current="true"
            :expand-on-click-node="false"
            ref="treeRef"
            node-key="id"
            :current-node-key="currentNodekey"
            default-expand-all
            :props="{ children: 'children', label: 'label' }"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="menu-tree-node">
                <i style="font-size: 14px; margin-right: 10px" v-if="data.parent_id" class="iconfont icon-document-artical"></i>
                <span style="font-size: 14px" class="node-name">{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
    </div>
    <template #footer>
      <span>
        <el-button @click="beforeClose">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import useDocument, { ParamsModifyWikiInter, TreeItem } from "@/composables/useDocument";
import { ElMessage } from "element-plus";
import { ref, defineProps, withDefaults, watch, defineEmits, reactive } from "vue";

export default {
  name: ""
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:moveChildVisible", "updateData"]);
const props = withDefaults(
  defineProps<{
    moveChildVisible: boolean;
    item: Record<string, any>;
  }>(),
  {
    moveChildVisible: false
  }
);
const { useGetModifyWikiList, useMoveWikiSort, useGetDocTreeList } = useDocument();
// 选择的父节点
const parentNode = ref<number | undefined>();
// 列表数据
const list = ref();
// 菜单列表默认选中id
const currentNodekey = ref();
// tree ref
const treeRef = ref();
let menuData: TreeItem[] = reactive([]);

watch(
  () => props.moveChildVisible,
  (newVal) => {
    if (newVal) {
      getList();

      // 赋值选中当前节点
      setTimeout(() => {
        setCurrentNodeKey(props.item.node?.parent?.key);
      }, 100);
      parentNode.value = props.item.node?.data.master_id;
      if (parentNode.value) getTreeList(parentNode.value);
    } else {
      setCurrentNodeKey(null);
      parentNode.value = undefined;
    }
  }
);

const setCurrentNodeKey = (id: string | number | null) => {
  treeRef.value?.setCurrentKey(id);
  currentNodekey.value = id;
};

// 获取列表list
const getList = async () => {
  const data = await useGetModifyWikiList();
  if (data) list.value = data;
};

// 点击node 节点
const handleNodeClick = (val: TreeItem) => {
  currentNodekey.value = val.id;
};

// 关闭弹窗
const beforeClose = () => {
  emit("update:moveChildVisible", false);
};

const onChange = (val: number) => {
  currentNodekey.value = null;
  getTreeList(val);
};

// 获取tree 的list
const getTreeList = async (id: number) => {
  if (!id) return;
  const list = await useGetDocTreeList(id);
  menuData.length = 0;

  if (list) {
    menuData.push(list);
  }
};

// 提交
const submit = async () => {
  if (!parentNode.value) return ElMessage.warning("请选择目标文档");
  else if (!currentNodekey.value) return ElMessage.warning("请选择所属父文档");
  else if (props.item.node?.key === currentNodekey.value) return ElMessage.warning("移动目标不能移动到当前下面");
  const params: Omit<ParamsModifyWikiInter, "seq"> = {
    current_id: props.item.node?.key,
    target_id: currentNodekey.value
  };
  const isSucc = await useMoveWikiSort(params);
  if (!isSucc) return;
  beforeClose();
  emit("updateData");
};
</script>
<style lang="less" scoped>
.moveChildTop {
  margin-bottom: 10px;
}
.moveChildTitle {
  margin-bottom: 10px;
}

.moveChildCustomClass {
  background-color: #1f9f85;
}
</style>

<style lang="less">
.moveChild {
  .el-dialog__body {
    padding-top: 20px;
    padding-bottom: 10px;
    border: 1px solid #f4f4f4;
  }
  .el-dialog__footer {
    padding: 10px;
  }

  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #cedbed !important;
    // .menu-tree-node {
    //   color: #fff;
    // }
  }
  .el-tree--highlight-current > .el-tree-node {
    > .el-tree-node__content > .el-tree-node__expand-icon {
      visibility: hidden;
    }
  }
  .tree-menu-list {
    border: 1px solid #ccc;
    padding: 10px;
    margin-top: 10px;
  }
}
</style>
