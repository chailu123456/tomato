<template>
  <div style="width: 100%">
    <el-form label-position="left">
      <el-form-item label="关联需求:">
        <el-scrollbar>
          <el-tree :data="data.demand_info" node-key="id" default-expand-all :props="defaultProps"> </el-tree>
        </el-scrollbar>
      </el-form-item>
      <el-form-item label="遗留bug:">
        <el-scrollbar style="width: 100%">
          <el-table :data="data.delay_bug" border>
            <el-table-column prop="bug_name" label="BUG名称"> </el-table-column>
            <el-table-column prop="iteration_name" label="上次关联迭代名称"> </el-table-column>
          </el-table>
        </el-scrollbar>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<Record<string, any>>
      // default: {}
    }
  },

  setup() {
    const defaultProps = {
      children: "child_list",
      label: "name"
    };
    return {
      defaultProps
    };
  }
});
</script>

<style scoped></style>
