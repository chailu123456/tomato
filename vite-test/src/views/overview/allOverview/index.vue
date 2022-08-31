<template>
  <div>
    <page-table :tableData="list" @handlePagationChange="getData" :total="total">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="状态:">
            <el-select v-model="searchParams.status" placeholder="请选择">
              <el-option v-for="item in STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品:">
            <el-select v-model="searchParams.product_id" placeholder="请选择" clearable>
              <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">确定</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="id" label="序号" width="80"> </el-table-column>
        <el-table-column prop="name" label="迭代概述"> </el-table-column>
        <el-table-column prop="user_count" label="人数" width="80"> </el-table-column>
        <el-table-column prop="process" label="进度">
          <template #default="scope">
            <el-progress :percentage="scope.row.complete_percent"></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            {{ scope.row.status === 0 ? "未开始" : "开发中" }}
          </template>
        </el-table-column>
        <el-table-column prop="node" label="节点" width="650">
          <template #default="scope">
            <progress-bar :status="scope.row.stage" :dataTime="progressNode(scope.row)" class="progress-padding"></progress-bar>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" @click="handleShowDetail(scope.row.id)">编辑</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";
import useFetchSearch from "./hooks/useFetchSearch";
import { STATUS } from "@/utils";
import useGetSelectList from "@/composables/useGetSelectList";
import useGetTableData from "@/composables/useGetTableData";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "allOverview",
  setup() {
    const searchParams = reactive({
      status: -1,
      product_id: ""
    });
    const router = useRouter();
    // 获取下拉列表
    let lists = useGetSelectList("productList");
    const { getData, tableData, stopAutoGetData } = useGetTableData(useFetchSearch, searchParams);
    getData();
    const handleConditionSearch = async () => {
      await getData(undefined, true, searchParams);
      stopAutoGetData.value = false;
    };
    const progressNode = (row: Record<string, any>) => {
      let createTime = row.plan ? row.plan.create_time : "";
      return [createTime, row.dev_time, row.union_time, row.test_time, row.release_time];
    };
    const handleShowDetail = (id: number) => {
      router.push({
        path: "/iteration/homepage",
        query: {
          id
        }
      });
    };
    return {
      handleShowDetail,
      progressNode,
      ...toRefs(lists),
      handleConditionSearch,
      STATUS,
      ...toRefs(tableData),
      searchParams
    };
  }
});
</script>

<style scoped lang="less">
.progress-padding {
  padding-left: 60px;
}
</style>
