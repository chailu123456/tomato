<template>
  <div>
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="产品名称">
            <el-select v-model="searchParams.name" placeholder="--所有--" clearable>
              <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="负责人">
            <el-select v-model="searchParams.manager" placeholder="--所有--" clearable>
              <el-option v-for="item in managerList" :key="item.id" :label="item.staff_name" :value="item.staff_no"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleShowDialog">新增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column align="center" prop="id" label="序号" width="180"> </el-table-column>
        <el-table-column align="center" prop="" label="项目代号" width="180"> </el-table-column>
        <el-table-column align="center" prop="name" label="项目名称" width="180"> </el-table-column>
        <el-table-column align="center" prop="" label="状态" width="180"> </el-table-column>
        <el-table-column align="center" prop="" label="已创建计划" width="180"> </el-table-column>
        <el-table-column align="center" prop="" label="已发布迭代" width="180"> </el-table-column>
        <el-table-column align="center" prop="" label="进行中迭代" width="180"> </el-table-column>
        <el-table-column align="center" prop="remark" label="备注"> </el-table-column>
        <el-table-column align="center" width="180" label="操作">
          <template #default="scope">
            <el-button type="text" @click="handleShowDialog(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleShowDialog(scope.row)">关闭</el-button>
            <el-button type="text" @click="handleShowDialog(scope.row)">重新启用</el-button>
            <!-- <el-button type="text" @click="handleStatusChange(scope.row)">{{ scope.row.status == 0 ? "正常" : "下线" }}</el-button> -->
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="40%" center>
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="product-form">
        <el-form-item label="项目名称" prop="name">
          <el-input placeholder="请输入2-10字项目名称" type="text" v-model="dialogParams.name" maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="项目代号" prop="num">
          <el-input placeholder="请输入项目部门中项目序号" type="text" v-model="dialogParams.num" maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="提醒地址" prop="address">
          <el-input placeholder="请输入提醒地址" type="text" v-model="dialogParams.address"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input show-word-limit placeholder="请输入备注" type="textarea" v-model="dialogParams.remark" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmSave">保 存</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import useCeateOrEditProduct, { rules } from "./composables/useCeateOrEditProduct";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import useRenderTable from "@/composables/useRenderTable";
import useGetSelectList from "@/composables/useGetSelectList";
import { ref, toRefs } from "vue";
import { Pagation } from "@/composables/usePagation";

export default defineComponent({
  setup() {
    const searchParams = reactive({
      name: ""
      // manager: ""
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
    // 获取下拉列表
    let lists = useGetSelectList("productList");
    // 弹窗相关操作
    const { dialogParams, handleShowDialog, dialogVisible, dialogTitle, confirmSave, statusChange, formRef } = useCeateOrEditProduct();
    // 弹窗点击确定
    const handleConfirmSave = () => confirmSave(() => getData(pageTableRef.value.getCurrentPage()));
    // 修改状态
    const handleStatusChange = (params: unknown) => {
      statusChange(params).then(() => {
        getData(pageTableRef.value.getCurrentPage());
      });
    };
    // 条件搜索
    const handleConditionSearch = async () => {
      await getData(undefined, true, searchParams);
      stopAutoGetData.value = false;
    };
    return {
      formRef,
      rules,
      dialogParams,
      dialogVisible,
      handleShowDialog,
      searchParams,
      dialogTitle,
      handleConfirmSave,
      getData,
      pageTableRef,
      ...toRefs(tableData),
      handleConditionSearch,
      stopAutoGetData,
      handleStatusChange,
      ...toRefs(lists)
    };
  }
});
</script>

<style scoped lang="less">
.product-form {
  ::v-deep(.el-form-item) {
    display: flex;
  }
  ::v-deep(.el-form-item__content) {
    flex-grow: 1;
  }
}
</style>
