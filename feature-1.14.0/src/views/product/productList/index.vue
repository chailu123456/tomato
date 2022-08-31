<template>
  <div>
    <!-- <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="项目名称">
            <el-input v-model="searchParams.name" placeholder="请输入项目名称" @change="handleConditionSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleShowDialog()">新增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="id" label="序号" width="100" class-name="table-column-center"> </el-table-column>
        <el-table-column prop="code" label="项目代号" width="100" class-name="table-column-center"> </el-table-column>
        <el-table-column prop="name" label="项目名称" min-width="300" class-name="table-column-center table-column-left"> </el-table-column>
        <el-table-column prop="status" label="状态" width="100" #default="scope" class-name="table-column-center">
          <span style="color: #999" v-if="scope.row.status === 0">已关闭</span>
          <span style="color: rgb(108, 188, 1)" v-else-if="scope.row.status === 1">启用</span>
        </el-table-column>
        <el-table-column prop="plan_count" label="已创建计划" width="100" class-name="table-column-center"> </el-table-column>
        <el-table-column prop="doing_iteration_count" label="进行中迭代" width="100" class-name="table-column-center"> </el-table-column>
        <el-table-column prop="release_iteration_count" label="已发布迭代" width="100" class-name="table-column-center"> </el-table-column>

        <el-table-column class-name="table-column-left" min-width="150" prop="remark" label="备注"> </el-table-column>
        <el-table-column label="操作" class-name="table-column-center">
          <template #default="scope">
            <el-button type="text" @click="handleShowDialog(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleStatusChange(scope.row)" v-show="scope.row.status === 0">重新启用</el-button>
            <el-button type="text" @click="handleStatusChange(scope.row)" v-show="scope.row.status === 1">关闭</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="40%" center>
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="product-form">
        <el-form-item label="项目名称" prop="name">
          <el-input placeholder="请输入2-10字项目名称" type="text" v-model="dialogParams.name" maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="项目编号" prop="code">
          <el-input oninput="value=value.replace(/[^\d]/g,'')" placeholder="请输入项目部门中项目序号,最大999" type="text" v-model="dialogParams.code" maxlength="3"></el-input>
        </el-form-item>
        <el-form-item label="提醒地址" prop="notify_url">
          <el-input placeholder="请输入提醒地址" type="text" v-model="dialogParams.notify_url"></el-input>
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
    </el-dialog> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import useCeateOrEditProduct, { rules } from "./composables/useCeateOrEditProduct";
// import useRequest from "@/composables/useRequest";
// import useFetchSearch from "./composables/useFetchSearch";
// import useRenderTable from "@/composables/useRenderTable";
// import { ref, toRefs } from "vue";
// import { ElMessageBox, ElMessage } from "element-plus";
// import { Pagation } from "@/composables/usePagation";

export default defineComponent({
  name: "productList",
  setup() {
    // const searchParams = reactive({
    //   name: ""
    // });
    // const tableData = reactive({
    //   list: [],
    //   total: 0
    // });
    // const pageTableRef = ref<any>();
    // const stopAutoGetData = ref<boolean>(false);
    // // 分页以及获取数据
    // const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
    //   stopAutoGetData.value = flag == undefined ? false : true;
    //   const { response } = useRequest(useFetchSearch, params || searchParams);
    //   const { pagation } = useRenderTable(response);
    //   let {
    //     data: { list, count }
    //   } = await pagation(pagationParams);
    //   tableData.total = count;
    //   tableData.list = list;
    // };
    // // 弹窗相关操作
    // const { dialogParams, handleShowDialog, dialogVisible, dialogTitle, confirmSave, statusChange, formRef } = useCeateOrEditProduct();
    // // 弹窗点击确定
    // const handleConfirmSave = () => confirmSave(() => getData(pageTableRef.value.getCurrentPage()));
    // // 修改状态
    // const handleStatusChange = (params: unknown) => {
    //   ElMessageBox.confirm("是否执行此操作？", "提示", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning"
    //   })
    //     .then(() => {
    //       statusChange(params).then(() => {
    //         getData(pageTableRef.value.getCurrentPage());
    //       });
    //     })
    //     .catch(() => {
    //       ElMessage({
    //         type: "info",
    //         message: "已取消"
    //       });
    //     });
    // };
    // // 条件搜索
    // let timer: any;
    // const handleConditionSearch = async () => {
    //   // if (searchParams.name === "") return;
    //   clearTimeout(timer);
    //   timer = setTimeout(async () => {
    //     await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
    //     stopAutoGetData.value = false;
    //   }, 300);
    // };
    // handleConditionSearch();
    // const { productLists } = replaceProductId();
    // useWatchChangeProduct(handleConditionSearch, (newValue) => {
    //   searchParams.name = newValue as string;
    //   handleConditionSearch();
    // });
    // return {
    //   formRef,
    //   rules,
    //   dialogParams,
    //   dialogVisible,
    //   handleShowDialog,
    //   searchParams,
    //   dialogTitle,
    //   handleConfirmSave,
    //   getData,
    //   pageTableRef,
    //   ...toRefs(tableData),
    //   handleConditionSearch,
    //   stopAutoGetData,
    //   handleStatusChange
    //   // productLists
    // };
  }
});
</script>

<style scoped lang="less"></style>
