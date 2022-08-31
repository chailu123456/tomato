<template>
  <div>
    <page-table :tableData="tableData" @handlePagationChange="handlePagationChange" :total="total">
      <template #header>
        <el-form :inline="true">
          <el-form-item>
            <el-button type="primary" @click="handleAddEnvironment">新增环境变量</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="index" label="序号" width="80"> </el-table-column>
        <el-table-column prop="name" label="环境名称"> </el-table-column>
        <el-table-column prop="code" label="环境代码"> </el-table-column>
        <el-table-column prop="isSkip" label="是否可跳过">
          <template #default="scope">
            {{ scope.row.isSkip === "1" ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scoped">
            <el-button type="primary" @click="handleRemoveList(scoped)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog title="新增环境变量" v-model="dialogVisible" width="30%" center>
      <el-form :model="dialogFormParams" label-width="80px">
        <el-form-item label="环境名称">
          <el-input v-model="dialogFormParams.name" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="环境代码">
          <el-input v-model="dialogFormParams.code" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="可跳过">
          <el-checkbox v-model="dialogFormParams.isSkip"></el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmPostForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, unref } from "vue";
import { STATUS } from "@/utils";

export default defineComponent({
  name: "allOverview",
  setup() {
    const dialogVisible = ref<boolean>(false);
    const dialogFormParams = reactive({
      id: 132,
      name: "",
      code: "",
      isSkip: false
    });
    const total = ref(100);
    const tableData = [
      {
        index: 1,
        name: "开发",
        code: "DEV",
        isSkip: 1
      },
      {
        index: 1,
        name: "开发",
        code: "DEV",
        isSkip: 1
      },
      {
        index: 1,
        name: "开发",
        code: "DEV",
        isSkip: 1
      }
    ];
    const handleAddEnvironment = () => {
      dialogVisible.value = true;
    };
    const handleConfirmPostForm = () => {
      // 提交表单
      dialogVisible.value = false;
    };
    const handleRemoveList = (scoped: any) => {
      const row = unref(scoped.row);
      console.log(row, "scoped");
    };
    // const getOverviewList = async (pageIndex?: number, pageSize?: number) => {
    //   await useFetchSearch(formParams, pageIndex, pageSize);
    // };
    // const { handlePagationChange } = usePagation(getOverviewList);
    // onMounted(getOverviewList);
    return {
      tableData,
      STATUS,
      handleConfirmPostForm,
      handleAddEnvironment,
      dialogVisible,
      dialogFormParams,
      handleRemoveList,
      // handlePagationChange,
      total
    };
  }
});
</script>

<style scoped lang="less">
::v-deep(.el-form-item__content) {
  display: flex;
}
</style>
