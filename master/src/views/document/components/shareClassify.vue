<template>
  <div class="rp-doc-share-classify">
    <div class="rp-classify">分类</div>
    <el-popover placement="bottom" @show="show" popper-class="classify-tree-content" v-model:visible="visible" :width="530" trigger="click">
      <template #reference>
        <div class="classify-value" @click="visible = true">
          <span></span>
          <i class="iconfont icon-guanbi" @click.stop="handleClear"></i>
          <input class="classify-name-list" v-model="shareClassifyName" readonly />
        </div>
      </template>
      <div>选择子分类</div>

      <div class="share-classify-list">
        <el-input class="classify-search" prefix-icon="el-icon-search" placeholder="搜索分类" v-model="filterText"> </el-input>
        <el-icon class="share-classify-list-icon" @click="visible = false"><Close /></el-icon>
        <el-tree
          class="filter-classify-tree"
          :data="trees"
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-click="handleNodeClick"
          :props="{
            children: 'children',
            label: 'name'
          }"
          :filter-node-method="filterNode"
          ref="shareTree"
        >
        </el-tree>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, withDefaults, defineProps, watch } from "vue";
import { ColumnItemInter } from "@/composables/useDocument";
import { getCrumbs } from "@/api/request-modules/document";
import type { ClassifyHeader } from "@/types/interface";
import { Close } from "@element-plus/icons-vue";
const shareTree = ref();
const emit = defineEmits(["change"]);
const props = withDefaults(
  defineProps<{
    trees: ColumnItemInter[];
    classify_id: string;
    shareVisible: boolean;
  }>(),
  {
    classify_id: "",
    shareVisible: false
  }
);
const visible = ref(false);
const classifyArr = ref<ClassifyHeader[]>([]);
const defaultExpandedKeys = ref<number[]>([]);
const shareClassifyName = ref("所有分类  ");

const filterText = ref("");
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name.indexOf(value) !== -1;
};
const handleClear = () => {
  shareClassifyName.value = "所有分类  ";
  emit("change", { id: 0 });
};
// 点击分类节点
const handleNodeClick = (data: Record<string, any>) => {
  visible.value = false;
  shareClassifyName.value = "所有分类  ";
  curblist({ id: data.id });

  emit("change", data);
};

watch(
  () => filterText.value,
  (val) => {
    shareTree.value.filter(val);
  }
);

watch(
  () => props.shareVisible,
  (val) => {
    if (val === false) {
      visible.value = val;
    }
  }
);

// 获取联级 面包屑
let timer: ReturnType<typeof setTimeout>;
const curblist = async (params: { id: number }) => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (!params.id) return (shareClassifyName.value = "所有分类  ");
    const { data } = await getCrumbs(params);
    classifyArr.value = data;
    data.forEach((item: ClassifyHeader, index: number) => {
      if (index) {
        if (index > 1) {
          shareClassifyName.value += "  > " + item.name;
        }
        if (index == 1) {
          shareClassifyName.value += " " + item.name;
        }
      }
    });
  }, 300);
};

watch(
  () => props.classify_id,
  () => {
    curblist({ id: Number(props.classify_id) });
  },
  {
    immediate: true
  }
);

const show = () => {
  filterText.value = "";
  defaultExpandedKeys.value = [props.trees[0].id];
};
</script>
<style lang="less">
.rp-doc-share-classify {
  position: relative;
  width: 100%;
  .rp-classify {
    margin: 0px 0 8px 0;
  }
  .classify-value {
    position: relative;
    height: 30px;
    line-height: 30px;
    span {
      display: inline-block;
      position: absolute;
      width: 2px;
      height: 12px;
      background-color: #dcdfe6;
      margin-left: 63px;
      margin-top: 11px;
    }

    .classify-name-list {
      outline: none;
      width: calc(100% - 20px);
      height: 30px;
      overflow: hidden;
      overflow-x: scroll;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      font-size: 12px;
      color: #606266;
      padding: 0 10px;
      z-index: 10;
      &:hover {
        cursor: pointer;
      }
    }
    .icon-guanbi {
      position: absolute;
      width: 20px;
      text-align: center;
      right: 0px;
      z-index: 9;
      margin-top: 1px;
      background-color: #fff;
      opacity: 0;
      border-radius: 4px;
      height: 28px;
      &:hover {
        cursor: pointer;
        font-size: 15px;
      }
    }
    &:hover .icon-guanbi {
      cursor: pointer;
      opacity: 1;
    }
  }
}

.classify-tree-content {
  height: 430px;
  overflow: hidden;
  .filter-classify-tree {
    height: 370px;
    overflow: scroll;
  }
  .classify-search {
    margin: 10px 0;
    &:hover {
      cursor: pointer;
    }
  }
}

.share-classify-list {
  position: relative;

  &-icon {
    position: absolute;
    top: -30px;
    right: 0;
    font-size: 16px;
    color: var(--el-color-info);
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
}
</style>
