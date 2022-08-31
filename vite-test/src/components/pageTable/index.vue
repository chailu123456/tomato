<template>
  <div class="container">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="main">
      <el-table :data="tableData" style="width: 100%" :show-header="showHeader">
        <slot name="main"></slot>
      </el-table>
      <pagination v-if="!hiddenPagation" :total="total" :layout="layout" @handlePagationChange="handlePagationChange" :page-sizes="pageSizes" :pageSize="pageSize"></pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref } from "vue";
/**
 * @params currentPage 分页当前页码
 * @params pageSize 分页每页多少条
 */
interface PageEventParams {
  currentPage: number;
  pageSize: number;
}
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
      default: 10
    },
    // 每页显示个数选择器的选项设置
    pageSizes: {
      type: Array as PropType<Array<number>>,
      default: () => [10, 20, 40, 60]
    },
    // 是否阻止自动执行分页，常用于提交筛选条件
    stopAutoGetData: {
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
    layout: {
      type: String as PropType<string>,
      default: "prev, pager, next, sizes, jumper"
    }
  },
  emits: ["handlePagationChange"],
  setup(props, { emit }) {
    let currentPagination = ref({});
    const handlePagationChange = (pagination: PageEventParams) => {
      currentPagination.value = pagination;
      if (props.stopAutoGetData || props.hiddenPagation) {
        return;
      }
      emit("handlePagationChange", pagination);
    };
    const getCurrentPage = () => {
      return unref(currentPagination);
    };
    return {
      handlePagationChange,
      getCurrentPage
    };
  }
});
</script>

<style></style>
