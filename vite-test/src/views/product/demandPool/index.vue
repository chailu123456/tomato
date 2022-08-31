<template>
  <div>
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="产品名称">
            <el-select v-model="searchParams.product_id" placeholder="--所有产品--" clearable>
              <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="需求状态">
            <el-select v-model="searchParams.status" placeholder="--所有--">
              <el-option v-for="item in STATUS" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">确定</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleShowDialog">新增需求</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column align="center" width="80" type="expand">
          <template #default="scope">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="" v-for="(item, index) in scope.row.child_list" :key="index">
                <span>{{ item.name }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="id" label="序号" width="80"> </el-table-column>
        <el-table-column align="center" prop="name" label="需求点"> </el-table-column>
        <el-table-column align="center" prop="version" label="拟定计划"> </el-table-column>
        <el-table-column align="center" prop="state" width="80" label="状态" #default="scope">{{ scope.row.statusName }} </el-table-column>
        <el-table-column align="center" width="180" label="操作">
          <template #default="scope">
            <el-button type="text" @click="handleShowDialog(scope.row)">维护</el-button>
            <el-button type="text" @click="handleDelete(scope.row.id)">作废</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="40%" center>
      <el-form :model="dialogParams" :rules="rules" label-width="100px" class="demand-form" ref="dialogRef">
        <el-form-item label="产品名称" prop="product_id">
          <el-select v-model="dialogParams.product_id" placeholder="--所有产品--">
            <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="需求点" prop="name">
          <el-input type="text" v-model="dialogParams.name"></el-input>
        </el-form-item>
        <el-form-item label="拆分需求" v-if="type == 'edit'">
          <el-button type="primary" @click="addRow">添加子需求</el-button>
        </el-form-item>
      </el-form>
      <el-button class="f-r" v-if="dialogParams.id" @click="handleCreateChildDemand">增加</el-button>
      <el-table border v-if="dialogParams.id" :data="dialogParams.child_list" max-height="250" style="width: 100%">
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column label="描述" prop="name">
          <template #default="scope">
            <el-input v-model="scope.row.name"></el-input>
          </template>
        </el-table-column>
        <el-table-column align="center" width="80" label="操作">
          <template #default="scope">
            <el-button type="text" @click="handleDelateChildDemand(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">保 存</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import useGetSelectList from "@/composables/useGetSelectList";
import { defineComponent, toRefs, reactive, ref } from "vue";
import useFetchSearch from "./composables/useFetchSearch";
import useCeateOrEditDemand from "./composables/useCeateOrEditDemand";
import useGetTableData from "@/composables/useGetTableData";
import useDelete from "./composables/useDelete";

import { STATUS } from "@/utils/contantOptions";
export default defineComponent({
  name: "demandPool",
  setup() {
    const searchParams = reactive({
      status: -1,
      product_id: ""
    });
    const pageTableRef = ref<any>("");
    // 获取下拉列表
    let lists = useGetSelectList("productList");

    const { getData, tableData, stopAutoGetData } = useGetTableData(useFetchSearch, searchParams);
    getData();
    const handleConditionSearch = async () => {
      await getData(undefined, true, searchParams);
      stopAutoGetData.value = false;
    };
    const { dialogVisible, handleShowDialog, dialogTitle, rules, dialogParams, confirmChange, dialogRef, handleCreateChildDemand, handleDelateChildDemand } = useCeateOrEditDemand();
    // 弹窗点击确定
    const handleConfirmChange = () => confirmChange(() => getData(pageTableRef.value.getCurrentPage()));
    // 作废需求
    let { deleteFn } = useDelete();
    const handleDelete = (id: number) => {
      deleteFn(id).then(() => {
        getData(pageTableRef.value.getCurrentPage());
      });
    };
    return {
      rules,
      handleShowDialog,
      ...toRefs(tableData),
      dialogVisible,
      ...toRefs(lists),
      dialogTitle,
      dialogParams,
      handleConfirmChange,
      dialogRef,
      searchParams,
      getData,
      STATUS,
      pageTableRef,
      handleConditionSearch,
      handleDelete,
      handleCreateChildDemand,
      handleDelateChildDemand
    };
  }
});
</script>

<style scoped lang="less">
.demand-form {
  ::v-deep(.el-form-item) {
    display: flex;
  }
  ::v-deep(.el-form-item__content) {
    flex-grow: 1;
  }
  ::v-deep(.el-select) {
    width: 100%;
  }
}
.f-r {
  float: right;
  margin-bottom: 10px;
}
</style>
