<template>
  <div>
    <page-table :tableData="tableData" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" :total="pageParams.total">
      <template #header>
        <el-form :inline="true" :model="pageParams" class="demo-form-inline">
          <el-form-item label="部门">
            <el-select v-model="pageParams.departmentId" placeholder="--所有--">
              <el-option v-for="item in departmentOptions" :key="item.departmentId" :label="item.value" :value="item.departmentId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="pageParams.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column align="center" prop="index" label="序号" width="80"> </el-table-column>
        <el-table-column align="center" prop="name" label="姓名" width="180"> </el-table-column>
        <el-table-column align="center" prop="position" label="职位"> </el-table-column>
        <el-table-column align="center" prop="department" label="部门"> </el-table-column>
      </template>
    </page-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, watch, ref } from "vue";

interface TableData {
  id: number;
  index: number;
  name: string;
  position: string;
  department: string;
}
interface Data {
  total: number;
  tableData: Array<TableData>;
}
export default defineComponent({
  name: "user",
  setup() {
    const pageParamsStatus = ref<boolean>(false);
    const data = reactive({
      pageParams: {
        currentPage: 1, // 当前页
        pageSize: 10, // 分页大小
        name: "",
        department: 0
      },
      departmentOptions: [
        {
          departmentId: 0,
          value: "所有"
        },
        {
          departmentId: 1,
          value: "信息技术部"
        },
        {
          departmentId: 2,
          value: "市场部"
        },
        {
          departmentId: 3,
          value: "投资部"
        }
      ]
    });
    const tableData = reactive<Data>({
      total: 100,
      tableData: [
        {
          id: 0,
          index: 0,
          name: "zzy",
          position: "前端工程师",
          department: "信息技术部"
        },
        {
          id: 0,
          index: 1,
          name: "zys",
          position: "前端工程师",
          department: "信息技术部"
        }
      ]
    });
    watch(pageParamsStatus, (n) => {
      if (n) {
        pageParamsStatus.value = false;
        getList();
      }
    });
    onMounted(() => {
      getList();
    });
    const search = () => {
      data.pageParams.currentPage = 1;
      pageParamsStatus.value = true;
    };
    const changePage = (page: any) => {
      console.log(page);
      data.pageParams.currentPage = Number(page.currentPage);
      data.pageParams.pageSize = Number(page.pageSize);
      console.log(data.pageParams);
      pageParamsStatus.value = true;
    };
    // 获取列表数据
    const getList = async () => {
      console.log("获取新数据");
      pageParamsStatus.value = false;
    };
    const handleSizeChange = (val: number) => {
      data.pageParams.pageSize = val;
      pageParamsStatus.value = true;
    };
    const handleCurrentChange = (val: number) => {
      data.pageParams.currentPage = val;
      pageParamsStatus.value = true;
    };
    return {
      ...toRefs(data),
      ...toRefs(tableData),
      search,
      handleSizeChange,
      handleCurrentChange,
      changePage
    };
  }
});
</script>
