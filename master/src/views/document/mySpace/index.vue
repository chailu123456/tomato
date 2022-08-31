<template>
  <div class="rp-document-space">
    <div :class="[active ? 'document-center-left-hide' : 'document-center-left']">
      <div class="menu-title">
        <div class="ment-title-left">文档分类</div>
        <div class="ment-title-right-icon">
          <i @click="handlePut" tip="收起" class="iconfont icon-zuoceshouqiyoucezhankai"></i>
        </div>
      </div>
      <div class="menu-list-space">
        <el-tree
          :data="menuData"
          :highlight-current="true"
          :expand-on-click-node="false"
          ref="menuRef"
          :indent="0"
          node-key="id"
          :current-node-key="currentNodekey"
          default-expand-all
          :props="{ children: 'children', label: 'label' }"
          @node-click="handleNodeClick"
        >
          <template #default="{ node }">
            <span class="menu-tree-node">
              <i style="font-size: 14px; margin-right: 10px; margin-top: 2px" class="iconfont icon-document"></i>
              <span style="font-size: 14px" class="node-name">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div :class="[active ? 'document-center-right-hide' : 'document-center-right', 'document-center-right-normal']">
      <div class="document-right-header">
        <i @click="handleOpen()" v-if="active" tip="展开" class="iconfont icon-youceshouqizuocezhankai"></i>
        <em class="header-line" v-if="active"></em>
        <div class="header-tree-list" v-for="(item, index) in classifyHeader" :key="index">
          <span @click="handleData(item)">
            <em>{{ item.name }}</em>
            <span>{{ " (" + articNum + ")" }}</span>
          </span>
        </div>
      </div>
      <TableComponent :defauldMenuId="defauldMenuId" @articalNum="articalNum"></TableComponent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, nextTick } from "vue";
import TableComponent from "../components/tableComponent.vue";
import type { ClassifyHeader } from "@/types/interface";
import { setSession, getSession } from "@/utils";

// 控制菜单栏是否显示隐藏
const active = ref(false);

const menuRef = ref();

// 菜单列表默认选中id
const currentNodekey = ref(0);
// 默认所有分类数据 id
const defauldMenuId = ref({ name: "与我协作", id: 1 });
// 右侧表格文章列表总数
const articNum = ref(0);
// 子组件掉用父组件 通过子组件传递总数
const articalNum = (val: number) => {
  articNum.value = val;
};
// 点击当前的文类目录某一项
const currentLabel = reactive<{ id: number; label: string }>({
  id: 0,
  label: ""
});

// 右侧表格面包屑
const classifyHeader = ref<ClassifyHeader[]>([{ name: "我的草稿", id: 2 }]);
// 左侧表格分类
const menuData = reactive<{ id: number; label: string }[]>([
  {
    id: 1,
    label: "与我协作"
  },
  {
    id: 2,
    label: "我的草稿"
  },
  {
    id: 3,
    label: "已分享"
  },
  {
    id: 4,
    label: "收藏"
  }
]);

const mySpacekey = getSession("mySpacekey", true) as any;
if (mySpacekey?.id) {
  setTimeout(() => {
    menuRef?.value.setCurrentKey(mySpacekey.id);
    handleNodeClick(mySpacekey);
  }, 1000);
} else {
  setTimeout(() => {
    menuRef?.value.setCurrentKey(1);
    handleNodeClick({ id: 1, label: "与我协作" });
  }, 1000);
}
// 点击分类节点获取面包屑、表格数据
const handleNodeClick = (data: Record<string, any>) => {
  currentNodekey.value = data.id;
  currentLabel.id = data.id;
  currentLabel.label = data.label || data.name;
  classifyHeader.value = [{ id: data.id, name: data.label || data.name }];
  setSession("mySpacekey", JSON.stringify(currentLabel));
  defauldMenuId.value = { name: data.label || data.name, id: data.id };
};

// 菜单收起
const handlePut = () => {
  active.value = true;
};
// 菜单展开
const handleOpen = () => {
  active.value = false;
};

// 右侧标题点击事件
const handleData = (item: Record<string, any>) => {
  nextTick(() => {
    defauldMenuId.value = { name: item.name, id: item.id };
    menuRef?.value.setCurrentKey({ name: item.name, id: item.id });
    handleNodeClick({ label: item.name, id: item.id });
  });
};

setTimeout(() => {
  menuRef?.value.setCurrentKey(currentNodekey.value || 1);
}, 1000);
</script>
<style lang="less">
.rp-document-space {
  height: 100% !important;
  // padding: 10px !important;
  overflow: hidden;
  display: flex;
  .document-center-left {
    display: inline-block;
    width: 300px;
    height: 100%;
    background: #fff;
    margin-right: 10px;
    border-radius: 4px;
    // padding: 10px;
    transition: all 200ms;
    overflow: hidden;
    opacity: 1;
    :deep(.el-tree-node__content) {
      height: 30px;
    }
    .menu-title {
      padding: 10px;
      padding-bottom: 0;

      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      height: 40px;
      line-height: 40px;
      overflow: hidden;
      .ment-title-left {
        font-size: 14px;
      }
      .ment-title-right-icon {
        position: relative;
        .iconfont {
          margin: 0 6px;
          cursor: pointer;
          &:hover::after {
            position: absolute;
            margin-left: -20px;
            top: -10px;
            color: #615e5e;
            content: attr(tip);
            z-index: 8;
            font-size: 12px;
            line-height: 20px;
          }
        }
        .icon-yanjingguanbi {
          font-size: 20px;
        }
        .icon-jiahao {
          font-size: 18px;
        }
      }
    }
    .menu-list-space {
      padding: 10px;
      padding-top: 0;
      height: calc(100% - 90px);
      overflow-y: scroll;
      // padding-top: 0px;
      .el-tree {
        height: 100%;
        background: #fff !important;
        .is-current {
          .el-tree-node__content {
            color: #1d9f85;
          }
        }
        .el-tree-node__content:hover {
          color: #1d9f85;
        }
        .el-tree-node:focus > .el-tree-node__content {
          // background-color: red !important;
          color: #1d9f85;
        }
      }
      .menu-tree-node {
        display: flex;
        align-content: center;
        width: calc(100% - 26px);
        font-size: 14px;
        .node-name {
          display: inline-block;
          width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        i.menu-more-option {
          display: none;
        }
      }
      .el-tree-node__content:hover {
        .menu-more-option {
          display: block;
          position: absolute;
          right: 8px;
          margin-top: 3px;
        }
      }
    }
    ::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }
  }

  .document-center-left-hide {
    width: 0;
    height: 100%;
    transition: all 200ms;
    opacity: 0;
    .menu-title {
      padding: 10px;
      padding-bottom: 0;

      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      height: 40px;
      line-height: 40px;
      overflow: hidden;
    }
    .ment-title-left {
      font-size: 14px;
    }
  }
  .document-center-right {
    width: calc(100% - 310px);
    transition: all 200ms;
  }
  .document-center-right-hide {
    width: 100%;
    transition: all 200ms;
  }
  .document-center-right-normal {
    height: calc(100% - 20px);
    background: #fff;
    border-radius: 4px;
    transition: all 200ms;
    z-index: 10;
    padding: 10px;
    .document-right-header {
      display: flex;
      height: 40px;
      line-height: 40px;
      position: relative;
      .icon-youceshouqizuocezhankai {
        margin: 0 6px;
        cursor: pointer;

        &:hover::after {
          cursor: pointer;
          position: absolute;
          margin-left: -18px;
          top: -10px;
          color: #615e5e;
          content: attr(tip);
          z-index: 8;
          font-size: 12px;
          line-height: 20px;
        }
      }
      .header-line {
        display: inline-block;
        width: 1px;
        height: 12px;
        background: #ccc;
        margin: 15px 16px 0 16px;
      }
      span {
        font-size: 14px;
        // margin: 0 4px;
        em {
          &:hover {
            cursor: pointer;
            color: @rp-color-background;
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
