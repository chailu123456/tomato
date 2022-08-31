<!--
 * @Author: 宋绍华
 * @Date: 2022-03-31 18:06:36
 * @LastEditTime: 2022-04-28 16:52:27
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\document\components\sidebar.vue
-->
<template>
  <div class="sidebar">
    <i v-if="width" @click="changeWidth" class="sidebar-icon iconfont icon-youjiantou"></i>
    <div v-else @click="changeWidth" class="sidebar-icon__show">
      <i class="icon-menu-show iconfont"></i>
    </div>
    <div :class="`${width ? 'sidebar-show' : 'sidebar-hide'}`" v-if="width" class="sidebar-top">
      <div class="sidebar-top__title" v-if="permission === 2">
        <span>文档树</span>
        <i @click="sortVisible = true" class="icon-sort iconfont"></i>
      </div>
    </div>
    <div :class="`${width ? 'sidebar-show' : 'sidebar-hide'}`" class="sidebar-menu-list">
      <el-tree
        v-show="width"
        :data="menuData"
        :highlight-current="true"
        :expand-on-click-node="false"
        ref="menuRef"
        node-key="id"
        :current-node-key="currentNodekey"
        default-expand-all
        :props="{ children: 'children', label: 'label' }"
        @node-click="handleNodeClick"
      >
        <template #default="{ node }">
          <span class="menu-tree-node" :class="node.level === 1 ? 'menu-tree-node-first' : ''">
            <i style="font-size: 14px; margin-right: 10px" :class="`iconfont ${getIconStyle(node)}`"></i>
            <span :class="{ 'node-name-pd': permission === 2 }" class="node-name">{{ node.label }}</span>
            <el-tooltip
              popper-class="menu-tree-tooltip"
              show-after="500"
              effect="dark"
              :enterable="false"
              content="新建子文档"
              placement="top"
              :offset="6"
              v-if="permission === 2"
            >
              <i class="menu-more-plus" @click.stop="handleTree('create', node)"></i>
            </el-tooltip>
            <el-dropdown class="menu-more-point" v-if="permission === 2">
              <span class="el-dropdown-link">
                <el-icon class="menu-more-option">
                  <MoreFilled />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click.stop="handleTree('rename', node)" v-if="node.level !== 1">重命名 </el-dropdown-item>
                  <el-dropdown-item @click.stop="handleTree('movedoc', node)" v-if="node.level !== 1">移动文档 </el-dropdown-item>
                  <el-dropdown-item @click.stop="handleTree('exportpdf', node)">导出为PDF</el-dropdown-item>
                  <el-dropdown-item @click.stop="handleTree('importdoc')">
                    <el-upload :show-file-list="false" action="#" accept=".docx" @change="(file: any) => { onFileChange(node, file) }" :auto-upload="false">
                      <span>导入.docx为子文档</span>
                    </el-upload>
                  </el-dropdown-item>
                  <el-dropdown-item @click.stop="handleTree('delete', node)" v-if="node.level !== 1">删除 </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </template>
      </el-tree>
    </div>

    <DocHandleDialog v-model:visible="visible" :item="dialogItem" @updateData="updateData" />
    <DargTree v-if="sortVisible" v-model:visible="sortVisible" :type="1" @updateTree="updateTree" :sortTreeDate="menuData"></DargTree>
    <MoveChildColumn :item="dialogItem" @updateData="updateData" v-model:moveChildVisible="moveVisible" />
  </div>
</template>

<script lang="ts">
import useDocument, { TreeItem } from "@/composables/useDocument";
import { defineProps, watch, reactive, defineExpose, ref, withDefaults, onMounted, defineEmits } from "vue";
import DocHandleDialog from "@/views/document/components/docHandleDialog.vue";
import DargTree from "../components/dragTree.vue";
import MoveChildColumn from "../components/moveChildColumn.vue";
import { UploadFile } from "@/types/upload";
import { ElMessage } from "element-plus";
import { throttle } from "lodash";
import { MoreFilled } from "@element-plus/icons";

export default {
  name: "sidebar",
  components: {
    DocHandleDialog,
    MoveChildColumn,
    MoreFilled
  }
};
</script>

<script lang="ts" setup>
// 操作目標類型
export type Target = "rename" | "movedoc" | "exportpdf" | "importdoc" | "delete" | "create";
const emit = defineEmits(["onEvent"]);
const props = withDefaults(
  defineProps<{
    docId: number;
    permission: number;
  }>(),
  {
    docId: 0,
    permission: 0
  }
);
// sidebar 宽度
const width = ref(254);
// 文档树接口
let menuData: TreeItem[] = reactive([]);
// 菜单列表默认选中id
const currentNodekey = ref();
const sortVisible = ref(false); // 拖拽弹窗
const moveVisible = ref(false); // 移动子文档
const visible = ref(false);
const menuRef = ref();
// dialogItem
const dialogItem = reactive<{ target: Target; dialogTitle: string; node: TreeItem | null }>({
  target: "rename",
  dialogTitle: "新建子文档",
  node: null
});

const { useGetDocTreeList } = useDocument();

watch(
  () => props.docId,
  (newVal) => {
    if (newVal) {
      getTreeList();
    }
  }
);

onMounted(async () => {
  await getTreeList();
  setCurrentNodeKey(menuData[0].id ?? "");
});

// 暴露给外部的属性和方法
defineExpose({
  menuData,
  getTreeList: () => getTreeList()
});

// 更改宽度
const changeWidth = () => {
  width.value = width.value > 0 ? 0 : 254;
};

// 设置当前node 高亮
const setCurrentNodeKey = (id: string | number | null) => {
  menuRef.value?.setCurrentKey(id);
  currentNodekey.value = id;
};

// 节点点击事件
const handleNodeClick = throttle(
  (item: TreeItem) => {
    emit("onEvent", { type: 2, data: { ...item } });
  },
  500,
  { leading: true }
);

// 获取tree 的list
const getTreeList = async () => {
  if (!props.docId) return;
  const list = await useGetDocTreeList(props.docId);
  menuData.length = 0;
  if (list) menuData.push(list);
};

// 操作弹窗
const handleTree = (type: Target, node?: TreeItem) => {
  switch (type) {
    case "rename":
      visible.value = true;
      dialogItem.dialogTitle = "重命名";
      break;
    case "delete":
      visible.value = true;
      dialogItem.dialogTitle = "删除文档";
      break;
    case "create":
      visible.value = true;
      dialogItem.dialogTitle = "新建子文档";
      break;
    case "movedoc":
      moveVisible.value = true;
      break;
    case "exportpdf":
      emit("onEvent", { type: 3, data: { ...node } });
      return;
  }
  dialogItem.node = node!;
  dialogItem.target = type;
};

const updateData = (type: number, item: Record<string, any>) => {
  // 创建子文档
  if (type === 1) {
    emit("onEvent", {
      type: 1,
      data: { ...item },
      cb: (id: number) => {
        // 创建子文档回调，设置当前高亮
        if (id) setTimeout(() => setCurrentNodeKey(id), 100);
      }
    });
  } else if (type === 6) {
    getTreeList();
  } else {
    updateTree(type);
  }
};

const updateTree = (type = 5) => {
  getTreeList();
  emit("onEvent", { type });
};

// 文件变动
const onFileChange = (node: any, uploadFile: UploadFile) => {
  if (!uploadFile.name.includes(".docx")) return ElMessage.warning("请上传.docx格式的文件");

  emit("onEvent", {
    type: 4,
    data: {
      parent_id: node.data.id,
      uploadFile: uploadFile?.raw
    },
    cb: (id: number) => {
      // 创建子文档回调，设置当前高亮
      if (id) setTimeout(() => setCurrentNodeKey(id), 100);
    }
  });
};
const getIconStyle = (node: Record<string, any>) => {
  const { level } = node;

  if (level === 1) return "icon-house";
  return "icon-document-artical";
};
</script>
<style lang="less" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f8f8f8;

  &-menu-list {
    flex: 1;
    overflow-y: scroll;
    background-color: #f8f8f8;
    width: 280px;
    position: relative;

    .menu-tree-node {
      display: flex;
      align-items: center;
      width: calc(100% - 26px);
      font-size: 14px;
      position: relative;

      .node-name {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      i.menu-more-option {
        display: none;
      }

      &-first {
        color: #1f9f85;
        padding: 3px 0 3px 3px;
        border-radius: 2px;

        .menu-more-plus {
          top: 0;
        }

        .menu-more-option {
          right: 4px !important;
        }
      }
    }

    .el-tree-node__content {
      transition: all 0.3s;

      &:hover {
        background-color: #cedbed;
        border-radius: 4px;

        .menu-more-option {
          display: block;
          position: absolute;
          right: 2px;
          margin-top: 3px;
          transform: rotate(90deg);
        }

        .menu-more-plus {
          display: block;
        }

        .node-name-pd {
          padding-right: 50px;
        }
      }
    }

    .menu-more-plus {
      position: absolute;
      font-size: 26px;
      color: #4fb6ff;
      right: 45px;
      top: -3px;
      display: none;

      &:before {
        position: absolute;
        top: -7px;
        content: "+";
      }
    }
  }

  &-icon {
    position: absolute;
    top: 12px;
    right: -15px;
    width: 27px;
    height: 27px;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 7px #888888;
    z-index: 10;
    cursor: pointer;

    &::before {
      transform: rotate(180deg);
    }

    &__show {
      position: fixed;
      cursor: pointer;
      top: 50%;
      left: 0;
      line-height: 48px;
      text-align: center;
      transform: translateY(-50%);
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      border: 1px solid #dcddde;
      border-left: none;
      width: 25px;
      height: 48px;
      background: #fafafa;
      transition: all 0.1s;
      z-index: 9;
      box-sizing: border-box;

      .icon-menu-show {
        font-size: 25px;
      }
    }
  }

  &-top {
    position: relative;
    z-index: 10;
    padding: 15px 15px 10px;
    margin-right: 6px;
    transition: all 0.3s;
    box-sizing: border-box;

    &__title {
      display: flex;
      justify-content: space-between;
      font-size: 15px;

      .icon-sort {
        font-size: 20px;
        cursor: pointer;
      }

      &2 {
        margin-top: 10px;
        padding: 6px 25px;
        background-color: #ebf8f6;
        color: #1f9f85;
        font-size: 15px;
        font-weight: bold;
        position: relative;
        display: flex;
        align-items: center;
        border-radius: 4px;

        &:before {
          position: absolute;
          left: 5px;
          content: "\e615";
        }
      }
    }
  }

  &-hide {
    width: 0;
    transition: 0.3s;
  }

  &-show {
    width: 280px;
    transition: 0.3s;
  }

  .icon-idot {
    width: 6px;
    height: 6px;
    background-color: #dcddde;
    border-radius: 50%;
  }

  .el-tree {
    height: 100%;
    background-color: #f8f8f8;
  }

  .icon-document-artical::before {
    color: #409eff;
  }
}

.more-list-option {
  min-width: 100px !important;

  li {
    line-height: 34px;

    &:hover {
      cursor: pointer;
      color: @rp-color-background;
    }

    i {
      margin-right: 6px;
    }
  }
}
</style>

<style lang="less">
.sidebar {
  .el-tree--highlight-current {
    .el-tree-node.is-current > .el-tree-node__content {
      background-color: #cedbed;
      border-radius: 4px;
    }
  }

  .el-tree--highlight-current > .el-tree-node {
    > .el-tree-node__content > .el-tree-node__expand-icon {
      visibility: hidden;
    }
  }

  .menu-more-point {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: rotate(90deg);
  }

  .el-tree-node__content {
    height: 30px;

    &:hover {
      background-color: #cedbed;
      border-radius: 4px;
    }
  }
}

.menu-tree-tooltip {
  margin-left: 10px !important;
}
</style>
