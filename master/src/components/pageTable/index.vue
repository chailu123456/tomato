<template>
  <div class="container">
    <div class="header search-header">
      <slot name="header"></slot>
    </div>
    <div class="main" style="height: auto" :class="{ 'fullscreen-ele-global': isFullScreen }">
      <el-table
        :data="tableData"
        :stripe="stripe"
        :row-key="getRowKeys"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        v-loadmore="loadMore"
        :highlight-current-row="highlight"
        :height="height"
        :max-height="maxHeight"
        :show-header="showHeader"
        :border="border"
        :row-class-name="tableRowClassName"
        @cell-click="cellClick"
        @sort-change="sortChange"
        :cell-style="rowStyle"
        :class="className"
        :expand-row-keys="expands"
        @expand-change="expandSelect"
        ref="pageTable"
      >
        <slot name="main"></slot>
      </el-table>
      <pagination
        v-if="!hiddenPagation"
        :total="total"
        :currentPage="currentPage"
        :layout="layout"
        @handlePagationChange="handlePagationChange"
        :bugType="bugType"
        :page-sizes="pageSizes"
        :pageSize="propsData.pageSize"
        :pagerCount="3"
      >
        <template #selectQuick>
          <slot name="qucikSelect"></slot>
        </template>
      </pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, PropType, reactive, ref, unref } from "vue";
import { useRoute } from "vue-router";
import VueEvent from "@/utils/mitt";

import throttle from "@/utils/throttle";
/**
 * @params currentPage 分页当前页码
 * @params pageSize 分页每页多少条
 */
interface PageEventParams {
  currentPage: number;
  pageSize: number;
}
interface Page {
  pageIndex?: number;
  pageSize?: number;
}

type BugType = {
  serious_num?: number;
  unsolved_num?: number;
  unvalidated_num?: number;
};
export default defineComponent({
  name: "pageTable",
  props: {
    tableData: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    // 分页总条数
    total: {
      require: true,
      type: Number as PropType<number>,
      default: 0
    },
    // 分页当前页码
    currentPage: {
      type: Number as PropType<number>,
      default: 1
    },
    // 分页每页多少条
    pageSize: {
      type: Number as PropType<number>,
      default: 20
    },
    // 每页显示个数选择器的选项设置
    pageSizes: {
      type: Array as PropType<Array<number>>,
      default: () => [20, 40, 60, 80, 100, 150, 200]
    },
    // 是否阻止自动执行分页，常用于提交筛选条件
    stopAutoGetData: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    // 点击行高亮
    highlight: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    hiddenPagation: {
      type: Boolean as PropType<boolean>,
      default: false
    }, // 是否显示表头
    showHeader: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    // 是否显示纵向边框
    border: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    layout: {
      type: String as PropType<string>,
      default: "total, sizes, prev, pager, next, jumper, slot"
    },
    maxHeight: {
      type: Number as PropType<number>
    },
    // 每页显示bug数
    bugType: {
      type: Object as PropType<BugType>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    tableRowClassName: {
      require: false,
      default: ""
    },
    className: {
      require: false,
      default: ""
    },
    rowStyle: {
      require: false,
      default: {}
    },
    stripe: {
      type: Boolean,
      default: false
    },
    isFullScreen: {
      type: Boolean,
      default: false
    }
  },
  emits: ["handlePagationChange", "handlePagationAdd", "handleRow", "handleSelectionChange", "sortChange", "cellClick", "expandRow", "tableMethods"],
  setup(props, { emit }) {
    const expands = ref<number[]>([]);
    const propsData = reactive({
      currentPage: props.currentPage,
      pageSize: props.pageSize
    });
    let currentPagination = ref<Page>({});
    const handlePagationChange = (pagination: PageEventParams) => {
      currentPagination.value = pagination;
      propsData.pageSize = pagination.pageSize;
      if (props.stopAutoGetData || props.hiddenPagation) {
        return;
      }
      nextTick(() => {
        document.getElementsByClassName("el-table__body-wrapper")[0].scrollTop = 0;
      });
      emit("handlePagationChange", pagination);
    };
    const getCurrentPage = () => {
      return unref(currentPagination);
    };
    const setCurrentPage = () => {
      if (currentPagination.value) {
        currentPagination.value.pageIndex = 1;
      }
      return unref(currentPagination);
    };
    // 滚动加载更多
    const loadMore = (val: any) => {
      emit("handlePagationAdd", val);
    };
    // 每行的唯一key值 用其id表示
    const getRowKeys = (row: any) => {
      return row.id || 1;
    };
    let id = 0;
    // let childArrId = ref<number[]>([]);

    const expandSelect = (row: any) => {
      // console.log("row");
      // console.log(row.id);
      // console.log(expandedRows);

      if (!row.children) {
        if (expands.value.includes(id)) {
          if (id === row.id) {
            const idx = expands.value.indexOf(row.id);
            expands.value.splice(idx, 1);
          } else {
            expands.value = expands.value.filter((val) => val != id);
            expands.value.push(row.id);
            id = row.id;
          }
        } else {
          expands.value.push(row.id);
          id = row.id;
        }
      } else {
        if (expands.value.includes(row.id)) {
          expands.value = expands.value.filter((val) => val != row.id);
        } else {
          expands.value.push(row.id);
          // childArrId.value.push(row.id);
          // expands.value = childArrId.value;
        }
      }
    };

    const route = useRoute();

    let height = ref<number | null>(null);
    let content = ref();
    let header = ref();
    const pageTable = ref();
    const docUrl: string[] = ["/document/mySpace"];
    const getHeight = () => {
      content.value = document.getElementsByClassName("content")[0] as HTMLDivElement;
      header.value = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
      nextTick(() => {
        if (route.path === "/project/iteration/homepage") return;
        if (route.path === "/project/overview/staffOverview" || route.path === "/project/overview/personnelArrangument") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 128;
          return;
        }
        if (route.path === "/configure/appDetail") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 168;
          return;
        }
        if (route.path === "/project/settingProject/moduleManage") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 180;
          return;
        }
        if (route.path === "/project/member") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 110;
          return;
        }
        if (route.path === "/lookBoard/project/qualityOverview") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 130;
          return;
        }
        if (route.path === "/lookBoard/personal/jobEvaluation") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 150;
          return;
        }
        if (route.path === "/project/product/planDetail") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 330;
          return;
        }
        if (route.path === "/workbench/workItem" || route.path === "/workbench/projectDynamics" || route.path === "/project/approval") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 130;
          return;
        }
        if (docUrl.includes(route.path)) {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 98;
          return;
        }
        if (route.path === "/project/test") {
          height.value = content.value.offsetHeight - header.value.offsetHeight - 100;
          return;
        }

        height.value = content.value?.offsetHeight - header.value?.offsetHeight - 130;
      });
    };

    const handleRowClick = (row: Record<string, any>) => {
      emit("handleRow", row, pageTable.value);
    };

    const handleSelectionChange = (row: any) => {
      emit("handleSelectionChange", row);
    };

    const sortChange = (e: any) => {
      emit("sortChange", e);
    };

    const cellClick = (row: any, column: any, cell: any, event: any) => {
      emit("cellClick", row, column, cell, event);
    };

    onMounted(() => {
      // 此方法是将table原型链上的方法抛出，主要用到toggleRowExpansion方法对行的收起展开
      // 这块暂时在需求文档模块用到
      emit("tableMethods", pageTable.value);
      getHeight();
      // 将table原型链上的方法抛出,在抽屉组件在用到
      VueEvent.emit("pageTableMethods", pageTable.value);
    });
    // 窗口变化修改table高度
    window.onresize = throttle(getHeight, 500);
    return {
      handlePagationChange,
      getCurrentPage,
      setCurrentPage,
      height,
      loadMore,
      handleRowClick,
      handleSelectionChange,
      sortChange,
      pageTable,
      cellClick,
      propsData,
      expands,
      expandSelect,
      getRowKeys
    };
  }
});
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .el-table__header-wrapper {
    .el-table__header {
      .has-gutter {
        tr {
          z-index: 9 !important;
          th:last-child {
            border-right: none;
          }
        }
      }
    }
  }
}
.rp-test-list-num {
  float: left;
  span.rp-test-num {
    display: inline-block;
    padding: 0px 6px;
    font-size: 13px;
    margin: 0 6px;
    background: #c4efe6;
    color: #606266;
    border-radius: 4px;
    font-weight: 500;
    &:hover {
      cursor: pointer;
      color: #3f3f40;
    }
  }
  :deep(.el-pagination__total) {
    display: inline-block;
    background: #f4f4f5;
    padding: 2px 6px;
    line-height: 20px;
    height: 20px;
    margin-top: 4px;
    border-radius: 4px;
    -webkit-box-sizing: none;
  }
}
</style>
