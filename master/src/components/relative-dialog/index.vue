<template>
  <div class="rp-relative-dialog">
    <el-dialog top="6vh" :title="title" v-model="dialogRelative" @close="handleClose" width="50%">
      <div class="relative-dialog">
        <div class="relative-search">
          <div class="task-tip" v-if="title === '关联任务'">此操作会将指派人添加为迭代成员、任务工时和进度将累积到迭代中</div>
          <span class="items-label">{{ inputTitle }}</span>
          <el-input v-model="filterText" :prefix-icon="Search" :placeholder="placeholder" />
        </div>
        <div class="content-body">
          <el-tree
            :data="treeDataList"
            node-key="id"
            ref="classifyTree"
            :default-checked-keys="defaultCheck"
            show-checkbox
            @check="handleCheckChange"
            :default-expand-all="true"
            :props="{ children: 'children', label: 'label' }"
            :filter-node-method="filterNode"
          >
            <template #default="{ node }">
              <span style="font-size: 14px" class="el-tree-node__label node-name">{{ node.label }}</span>
            </template>
          </el-tree>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {
  name: "relative-dialog"
};
</script>
<script lang="ts" setup>
import { defineProps, ref, computed, defineEmits, watch } from "vue";
import type { PropType } from "vue";
import type { Tree } from "@/types/interface";
import { TreeItem } from "@/composables/useDocument";
import { Search } from "@element-plus/icons";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sortTreeDate: {
    type: Object as PropType<Tree[] | TreeItem[]>,
    default: () => ({})
  },
  defaultCheck: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: "关联需求"
  },
  placeholder: {
    type: String,
    default: "搜索计划或需求"
  },
  inputTitle: {
    type: String,
    default: "搜索计划或需求"
  }
});
const filterText = ref("");
const classifyTree = ref();
const emit = defineEmits(["update:visible", "updateTree"]);

// 控制显示隐藏弹框
const dialogRelative = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
// 确定
const handleConfirm = () => {
  // 获取选中的值
  const checkData = classifyTree.value!.getCheckedNodes(false, false);
  emit(
    "updateTree",
    checkData.map((item: Record<string, any>) => item.id || item.value)
  );
};
const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};
// tree点击选中值
const handleCheckChange = (data: any, status: Record<string, any>) => {
  console.log(data);
  console.log(status);
};
watch(filterText, (val) => {
  classifyTree.value!.filter(val);
});
const treeDataList = computed(() => props.sortTreeDate.map((data) => Object.assign(data, {})));
// 弹框关闭事件
const handleClose = () => {
  // emit("update:visible", false);
  store.commit(MutationType.iterateContentVisible, false);
};

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      filterText.value = "";
    }
  }
);
</script>
<style lang="less">
.rp-relative-dialog {
  .el-dialog__body {
    padding-bottom: 0;
    padding-top: 10px !important;
  }
  .el-dialog__footer {
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  .relative-dialog {
    height: 500px;
    overflow: scroll;
    overflow-x: hidden;
    .relative-search {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .task-tip {
        margin-bottom: 10px;
        font-size: 12px;
        color: #a5a5a5;
      }
      .items-label {
        width: 120px;
        padding-bottom: 12px;
      }
    }
    .content-body {
      margin-top: 10px;
      height: 400px;
      border: 1px solid #dddfe6;
      overflow: scroll;
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
