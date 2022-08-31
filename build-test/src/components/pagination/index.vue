<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-04-28 16:51:19
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\pagination\index.vue
-->
<template>
  <div class="page">
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :total="total"
      :layout="layout"
    >
      <slot name="selectQuick"></slot>
    </el-pagination>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, reactive, toRefs } from "vue";

type BugType = {
  unsolved_num?: number;
  unvalidated_num?: number;
  serious_num?: number;
};

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
      default: 20
    },
    // 页面显示数量
    pagerCount: {
      require: false,
      type: Number as PropType<number>,
      default: 5
    },
    // 每页显示个数选择器的选项设置
    pageSizes: {
      type: Array as PropType<Array<number>>,
      default: () => [20, 40, 60, 80, 100, 150, 200]
    },
    // 组件布局，子组件名用逗号分隔
    layout: {
      type: String as PropType<string>,
      default: "prev, pager, next, sizes, jumper,total, slot"
    },
    // 每页显示bug数
    bugType: {
      type: Object as PropType<BugType>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => null
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
      ...toRefs(props),
      handleSizeChange,
      handleCurrentChange
    };
  }
});
</script>
<style lang="less" scoped>
.page {
  padding-top: 14px;
}
</style>
