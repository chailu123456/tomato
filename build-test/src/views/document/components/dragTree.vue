<template>
  <div class="rp-classify-list">
    <el-dialog top="6vh" :title="title" v-model="dialogSort" @close="handleClose" width="40%">
      <span class="drag-title" v-if="type === 1">拖拽子文档，调整它在文档树导航的顺序和位置</span>
      <div class="document-classify-content">
        <el-tree
          :data="treeDataList"
          node-key="id"
          draggable
          ref="classifyTree"
          @node-drop="handleDrop"
          @node-drag-end="handleDragEnd"
          :default-expand-all="true"
          :props="{ children: 'children', label: 'label' }"
          :allow-drag="allowDrag"
          :highlight-current="true"
        >
          <template #default="{ node, data }">
            <i v-if="data.parent_id && type === 1" style="font-size: 14px; margin-right: 10px; margin-top: 2px" class="iconfont icon-document-artical"></i>
            <i v-if="data.parent_id && type === 0" style="font-size: 14px; margin-right: 10px; margin-top: 2px" class="iconfont icon-document"></i>
            <span style="font-size: 14px" class="el-tree-node__label node-name">{{ node.label }}</span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogSort = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, defineProps, ref, computed, defineEmits } from "vue";
import type { PropType } from "vue";
import { awaitFunc } from "@/utils";
import { moveClassify } from "@/api/request-modules/document";
import type { Tree, DragParams } from "@/types/interface";
import useDocument, { ParamsModifyWikiInter, TreeItem } from "@/composables/useDocument";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sortTreeDate: {
    type: Object as PropType<Tree[] | TreeItem[]>,
    default: () => ({})
  },
  type: {
    // 不同的调用地方, 0 默认文档中心调用，1 文档内调用
    type: Number,
    default: 0
  }
});
const classifyTree = ref();
const emit = defineEmits(["update:visible", "updateTree"]);
const { useModifyWikiSort } = useDocument();
// 拖动后参数  id: 当前拖动的分类id   order：拖动完分类后排序id  拖动完分类后父级parent_id
const dragNodeId: DragParams = reactive({
  id: 0,
  order: 0,
  parent_id: 0
});
// 控制显示隐藏弹框
const dialogSort = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
const title = computed(() => {
  const arr = ["调整分类排序", "调整子文档位置"];
  return arr[props.type];
});
const treeDataList = computed(() => props.sortTreeDate.map((data) => Object.assign(data, {})));
// 弹框关闭事件
const handleClose = () => {
  emit("update:visible", false);
};
const handleDragEnd = (draggingNode: Record<string, any>) => {
  // console.log("拖动的该层级id: ", draggingNode.data.id, draggingNode.data);
  dragNodeId.id = draggingNode.data.id;
};
const handleDrop = (draggingNode: Record<string, any>, dropNode: Record<string, any>) => {
  // console.log(draggingNode);
  // console.log("拖动的层级下边一层-总层级: ", dropNode, dropType);
  // console.log("拖动的层级下边一层-父: ", dropNode.parent.data, dropType);
  // console.log("拖动的层级下边一层: ", dropNode.data, dropType);

  let dropNodeArr: Record<string, any> = dropNode.data;
  // 先判断父级children里有没有当前拖动的id
  if (dropNode.parent.data.children) {
    const list = dropNode.parent.data.children;
    list.forEach((item: Record<string, any>) => {
      if (item.id === dragNodeId.id) {
        dropNodeArr = dropNode.parent.data;
      }
    });
  }
  // 判断dropNode.data的children里有没有当前拖动的id
  if (dropNode.data.children) {
    const list = dropNode.data.children;
    list.forEach((item: Record<string, any>) => {
      if (item.id === dragNodeId.id) {
        dropNodeArr = dropNode.data;
      }
    });
  }
  // console.log("========");
  // console.log(dropNodeArr);
  if (dropNodeArr.children && dropNodeArr.children.length) {
    const childArr = dropNodeArr.children;
    // console.log("childArr");
    // console.log(childArr);
    dragNodeId.parent_id = dropNodeArr.id;
    if (childArr.length === 1) {
      dragNodeId.order = 1;
    } else {
      childArr.forEach((item: Record<string, any>, index: number) => {
        if (item.id === dragNodeId.id) {
          dragNodeId.order = childArr[index - 1]?.order ? childArr[index - 1]?.order : 1;
          if (childArr[index - 1]?.order) {
            ++dragNodeId.order;
          }
        }
      });
    }

    // console.log(dragNodeId);
  }
  // 拖到一级上边
  if (!dropNode.data.parent_id) {
    dragNodeId.parent_id = 0;
    dragNodeId.order = 1;
  }
  if (props.type === 0) {
    editMoveClassify(dragNodeId);
  } else {
    const { id: current_id, order: seq, parent_id: target_id } = dragNodeId;
    const params = {
      current_id,
      seq,
      target_id
    };
    modifyWikiSort(params);
  }
};

// 一级不允许拖拽
const allowDrag = (draggingNode: any) => {
  return draggingNode.data.level !== 1;
};

// 拖动列表请求数据
const editMoveClassify = async (params: DragParams): Promise<any> => {
  await awaitFunc<DragParams, any>({
    asyncFunc: moveClassify,
    args: params
  });
  // 拖动事件请求成功后将事件传递到父组件
  emit("updateTree");
};

// 更改文档排序
const modifyWikiSort = async (params: ParamsModifyWikiInter) => {
  await useModifyWikiSort(params);
  return emit("updateTree");
};
</script>
<style lang="less">
.rp-classify-list {
  .el-dialog__body {
    padding-bottom: 0;
    padding-top: 20px;
  }
  .el-dialog__footer {
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  .document-classify-content {
    height: 500px;
    overflow: scroll;
    .el-tree {
      background: #fff !important;
      .el-tree-node__content {
        height: 30px;
      }
    }
    .el-tree--highlight-current > .el-tree-node {
      > .el-tree-node__content > .el-tree-node__expand-icon {
        visibility: hidden;
      }
    }
  }

  .drag-title {
    margin: -10px 0 10px;
    display: block;
    font-size: 13px;
    color: #999;
  }
}
</style>
