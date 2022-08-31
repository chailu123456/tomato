<template>
  <div class="page">
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :layout="layout"
      :total="total"
    >
    </el-pagination>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";

export default defineComponent({
  name: "pagination",
  props: {
    // 总条数
    total: {
      require: true,
      type: Number as PropType<number>,
      default: 0
    },
    // 当前页码
    currentPage: {
      type: Number as PropType<number>,
      default: 1
    },
    // 每页多少条
    pageSize: {
      type: Number as PropType<number>,
      default: 10
    },
    // 每页显示个数选择器的选项设置
    pageSizes: {
      type: Array as PropType<Array<number>>,
      default: () => [10, 20, 40, 60]
    },
    // 组件布局，子组件名用逗号分隔
    layout: {
      type: String as PropType<string>,
      default: "prev, pager, next, sizes, jumper"
    }
  },
  emits: ["handlePagationChange"],
  setup(props, context) {
    const propsData = reactive({
      currentPage: props.currentPage,
      pageSize: props.pageSize
    });
    const handleSizeChange = (val: number) => {
      propsData.pageSize = val;
      context.emit("handlePagationChange", { pageIndex: propsData.currentPage, pageSize: val });
    };
    const handleCurrentChange = (val: number) => {
      propsData.currentPage = val;
      context.emit("handlePagationChange", { pageIndex: val, pageSize: propsData.pageSize });
    };
    return {
      handleSizeChange,
      handleCurrentChange
    };
  }
});
</script>
<style lang="less" scoped>
.page {
  margin-top: 30px;
  // display: flex;
  // flex-direction: row-reverse;
}
</style>
