<template>
  <div>
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="环境变量:">
            <el-input v-model="searchParams.name" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">确定</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleCreateAppShowDialog">新增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="id" label="序号" width="80"> </el-table-column>
        <el-table-column prop="git_url" label="源码地址"> </el-table-column>
        <el-table-column prop="name" label="应用名称"> </el-table-column>
        <el-table-column prop="remark" label="应用简要"> </el-table-column>
        <el-table-column prop="run_env" label="环境">
          <template #default="scoped">
            <span v-if="scoped.row.run_env === 1">宿主机</span>
            <span v-if="scoped.row.run_env === 2">docker</span>
            <span v-if="scoped.row.run_env === 3">k8s</span>
          </template>
        </el-table-column>
        <el-table-column prop="code_language" label="开发语言"> </el-table-column>
        <el-table-column label="操作">
          <template #default="scoped">
            <el-button type="primary" @click="handleUpdateApp(scoped.row)">编辑</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :title="dialogParams.id !== 0 ? '编辑' : '新增'" v-model="dialogVisible" width="40%" center>
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="applist-form">
        <el-form-item label="项目名称" prop="name">
          <el-input type="text" v-model="dialogParams.name"></el-input>
        </el-form-item>
        <el-form-item label="源码地址" prop="git_url">
          <el-input type="text" v-model="dialogParams.git_url"></el-input>
        </el-form-item>
        <el-form-item label="开发语言" prop="code_language">
          <el-select v-model="dialogParams.code_language" placeholder="请选择">
            <el-option v-for="item in LANGUAGE" :key="item.value" :label="item.value" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="寄宿环境" prop="run_env">
          <el-select v-model="dialogParams.run_env" placeholder="请选择">
            <el-option v-for="item in RUN_ENV" :key="item.id" :label="item.value" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="简要描述" prop="remark">
          <el-input type="textarea" v-model="dialogParams.remark"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleCreateApp(tipMessage)">保 存</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import { defineComponent, reactive, toRefs, ref } from "vue";
import { RUN_ENV, LANGUAGE } from "@/utils";
import useCreateAndUpdate from "./composables/useCreateOrUpdate";
import useMessageTip from "@/composables/useMessageTip";

export default defineComponent({
  name: "project",
  setup() {
    const { tipMessage } = useMessageTip();
    const searchParams = reactive({
      name: ""
    });
    const tableData = reactive({
      list: [],
      total: 0
    });
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      const { response } = useRequest(useFetchSearch, params || searchParams);
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
    };
    getData();
    const handleConditionSearch = async () => {
      await getData(undefined, true, searchParams);
      stopAutoGetData.value = false;
    };
    /**
     * 创建和更新
     */
    const { dialogParams, rules, handleCreateAppShowDialog, dialogVisible, handleCreateApp, formRef, handleUpdateApp } = useCreateAndUpdate(
      getData,
      pageTableRef
    );

    return {
      tipMessage,
      rules,
      handleCreateAppShowDialog,
      handleConditionSearch,
      stopAutoGetData,
      getData,
      ...toRefs(tableData),
      pageTableRef,
      searchParams,
      dialogVisible,
      dialogParams,
      handleCreateApp,
      RUN_ENV,
      LANGUAGE,
      formRef,
      handleUpdateApp
    };
  }
});
</script>
<style scoped lang="less">
.applist-form {
  :deep(.el-form-item) {
    display: flex;
  }
  :deep(.el-form-item__content) {
    flex-grow: 1;
  }
  :deep(.el-select) {
    width: 100%;
  }
}
</style>
