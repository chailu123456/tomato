<template>
  <div>
    <page-table :tableData="tableData" @handlePagationChange="handlePagationChange" :total="total">
      <template #header>
        <el-form :inline="true" :model="formParams">
          <el-form-item label="环境变量:">
            <el-select v-model="formParams.environmentVariable" placeholder="请选择">
              <el-option v-for="item in ENVIRONMENT_VARIABLE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目:">
            <el-select v-model="formParams.project" placeholder="请选择">
              <el-option v-for="item in ENVIRONMENT_VARIABLE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="版本:">
            <el-select v-model="formParams.version" placeholder="请选择">
              <el-option v-for="item in ENVIRONMENT_VARIABLE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQueryTable">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="index" label="序号" width="80"> </el-table-column>
        <el-table-column prop="name" label="项目名称"> </el-table-column>
        <el-table-column prop="environment" label="环境"> </el-table-column>
        <el-table-column prop="lastTime" label="最后访问时间"> </el-table-column>
        <el-table-column label="操作">
          <template #default="scoped">
            <el-button type="primary" @click="handleShowDetail(scoped)">查看</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
// import useFetchSearch from "./hooks/useFetchSearch";
// import usePagation from "@/composables/usePagation";
import { ENVIRONMENT_VARIABLE } from "@/utils";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "allOverview",
  setup() {
    const total = ref(100);
    const formParams = reactive({
      environmentVariable: "",
      project: "",
      version: ""
    });
    const router = useRouter();
    const handleShowDetail = () => {
      router.push({
        path: "/setting/appListsDetail"
      });
    };
    // const getOverviewList = async (pageIndex?: number, pageSize?: number) => {
    //   await useFetchSearch(formParams, pageIndex, pageSize);
    // };
    // const { handlePagationChange } = usePagation(getOverviewList);
    // onMounted(getOverviewList);
    const tableData = [
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99"
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99"
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99"
      }
    ];
    return {
      formParams,
      tableData,
      ENVIRONMENT_VARIABLE,
      handleShowDetail,
      // handlePagationChange,
      total
    };
  }
});
</script>

<style scoped lang="less">
.progress-padding {
  padding-left: 10px;
}
</style>
