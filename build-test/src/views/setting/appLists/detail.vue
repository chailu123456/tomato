<template>
  <div class="container">
    <el-form :inline="true" :model="createFormParams">
      <el-form-item label="项目名称:">
        <el-input placeholder="请输入项目名称" v-model="createFormParams.project"></el-input>
      </el-form-item>
      <el-form-item label="环境名称:">
        <el-input placeholder="测试" disabled></el-input>
      </el-form-item>
      <el-form-item label="标签:">
        <el-input placeholder="请输入标签" v-model="createFormParams.tag"></el-input>
      </el-form-item>
      <el-form-item label="备注:">
        <el-input placeholder="请输入标签" v-model="createFormParams.remark"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreateList">保存</el-button>
      </el-form-item>
    </el-form>
    <el-row class="wrapper__height">
      <el-col :span="6">
        <div class="table__background left__list">
          <el-scrollbar height="500px">
            <div v-for="item in 30" :key="item">{{ item }}</div>
          </el-scrollbar>
        </div>
        <el-button type="primary"> + </el-button>
        <el-button type="primary"> - </el-button>
      </el-col>
      <el-col :span="18">
        <page-table :tableData="tableData" @handlePagationChange="handlePagationChange" :total="total" class="table__background">
          <template #header>
            <el-form :inline="true" :model="tableDataFormParams">
              <el-form-item label="环境变量:">
                <el-select v-model="tableDataFormParams.environmentVariable" placeholder="请选择">
                  <el-option v-for="item in ENVIRONMENT_VARIABLE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="版本:">
                <el-select v-model="tableDataFormParams.version" placeholder="请选择">
                  <el-option v-for="item in ENVIRONMENT_VARIABLE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQueryTable">拉取</el-button>
              </el-form-item>
            </el-form>
          </template>
          <template #main>
            <el-table-column prop="index" label="序号" width="80"> </el-table-column>
            <el-table-column prop="name" label="项目名称">
              <template #default="scoped">
                <el-input v-if="scoped.row.isEdit === 1" v-model="scoped.row.name"></el-input>
                <span v-else>{{ scoped.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="environment" label="环境">
              <template #default="scoped">
                <el-input v-if="scoped.row.isEdit === 1" v-model="scoped.row.environment"></el-input>
                <span v-else>{{ scoped.row.environment }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="lastTime" label="最后访问时间"> </el-table-column>
            <el-table-column label="操作">
              <template #default="scoped">
                <el-button type="primary" @click="handleEdit(scoped)" v-if="scoped.row.isEdit === 0">编辑</el-button>
                <el-button type="primary" @click="handleConfirmChange(scoped)" v-else>确定</el-button>
                <el-button type="primary" @click="handleRemove(scoped)">删除</el-button>
              </template>
            </el-table-column>
          </template>
        </page-table>
        <el-button type="primary" class="table__add__btn"> + </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
// import useFetchSearch from "./hooks/useFetchSearch";
// import usePagation from "@/composables/usePagation";
import { ENVIRONMENT_VARIABLE } from "@/utils";
export default defineComponent({
  name: "allOverview",
  setup() {
    const total = ref(100);
    const createFormParams = reactive({
      project: "",
      tag: "",
      remark: ""
    });
    const tableDataFormParams = reactive({
      environmentVariable: "",
      version: ""
    });
    const handleCreateList = () => {
      //
    };
    const handleEdit = (scoped: any) => {
      scoped.row.isEdit = 1;
    };
    const handleRemove = () => {
      //
    };
    const handleConfirmChange = (scoped: any) => {
      scoped.row.isEdit = 0;
    };
    // const getOverviewList = async (pageIndex?: number, pageSize?: number) => {
    //   await useFetchSearch(formParams, pageIndex, pageSize);
    // };
    // const { handlePagationChange } = usePagation(getOverviewList);
    // onMounted(getOverviewList);
    const tableData = reactive([
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99",
        isEdit: 0
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99",
        isEdit: 0
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99",
        isEdit: 0
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99",
        isEdit: 0
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99",
        isEdit: 0
      },
      {
        index: 1,
        name: "Boss",
        environment: "开发",
        survival: 10,
        lastTime: "2021-02-99",
        isEdit: 0
      }
    ]);
    return {
      handleRemove,
      createFormParams,
      tableData,
      handleCreateList,
      ENVIRONMENT_VARIABLE,
      tableDataFormParams,
      handleEdit,
      handleConfirmChange,
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
.table__background {
  background: #fff;
}
.left__list {
  height: 80%;
  margin-bottom: 20px;
}
.wrapper__height {
  height: 600px;
  overflow: hidden;
  background: #fff;
}
.table__add__btn {
  margin-left: 50px;
  position: relative;
  bottom: 90px;
}
</style>
