<template>
  <div class="rp-config-body">
    <page-table
      :tableData="list"
      :currentPage="currentPage"
      @handlePagationChange="getData"
      :total="total"
      ref="pageTableRef"
      :stopAutoGetData="stopAutoGetData"
    >
      <template #header>
        <el-form :inline="true" :model="searchParams" @submit.prevent>
          <el-form-item label="应用名称">
            <el-input
              v-model.trim="searchParams.name"
              @change="handleName"
              @keyup.enter="handleConditionSearch"
              placeholder="请输入应用名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdateApp(0)">新 增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" class-name="table-column-left" min-width="150" label="应用名称">
          <template #default="scoped">
            <span class="app-name" @click="handleDetail(scoped.row)">{{ scoped.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="run_env" min-width="150" label="环境">
          <template #default="scoped">
            <span>{{ environment(scoped.row.env_list) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code_language" label="语言"></el-table-column>
        <el-table-column prop="run_env" label="寄宿环境">
          <template #default="scoped">
            <span v-if="scoped.row.run_env === 1">宿主机</span>
            <span v-if="scoped.row.run_env === 2">docker</span>
            <span v-if="scoped.row.run_env === 3">k8s</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" class-name="table-column-left" label="备注"> </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="scoped">
            <el-button type="primary" link @click="handleCopyUrl(scoped.row.git_url)">复制源码地址</el-button>
            <el-button type="primary" link @click="handleUpdateApp(1, scoped.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scoped.row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :title="dialogParams.id !== 0 ? '编辑' : '新增'" v-model="dialogVisible" width="40%">
      <el-form :model="dialogParams" :rules="rules" ref="formRefs" label-width="100px" class="applist-form">
        <el-form-item label="应用名称" prop="name">
          <el-input type="text" placeholder="请输入应用名称" v-model="dialogParams.name"></el-input>
        </el-form-item>
        <el-form-item label="开发语言" prop="code_language">
          <el-select v-model="dialogParams.code_language" placeholder="请选择开发语言">
            <el-option v-for="item in LANGUAGE" :key="item.value" :label="item.value" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="寄宿环境" prop="run_env">
          <el-select v-model="dialogParams.run_env" placeholder="请选择寄宿环境">
            <el-option v-for="item in RUN_ENV" :key="item.id" :label="item.value" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="源码地址" prop="git_url">
          <el-input type="text" placeholder="请输入源码地址" v-model="dialogParams.git_url"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" placeholder="请输入5-50简述" v-model="dialogParams.remark"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleCreateApp(tipMessage)">保 存</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import { RequestParams } from "@/types/request";
import useFetchSearch from "./composables/useFetchSearch";
import { defineComponent, reactive, toRefs, ref, onActivated } from "vue";
import { RUN_ENV, LANGUAGE } from "@/utils";
import { useRouter } from "vue-router";
import useCreateAndUpdate from "./composables/useCreateOrUpdate";
import useMessageTip from "@/composables/useMessageTip";
import copyField from "@/utils/copyField";
import { setSession } from "@/utils/sesssion";

export default defineComponent({
  name: "applicationVariable",
  setup() {
    const router = useRouter();
    const { tipMessage } = useMessageTip();
    const searchParams = reactive({
      name: ""
    });
    const tableData = reactive({
      list: [],
      total: 0
    });
    const currentPage = ref(1);
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      currentPage.value = (pagationParams && pagationParams.pageIndex) || 1;
      const { response } = useRequest(useFetchSearch, params || searchParams);
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
    };

    onActivated(() => {
      handleConditionSearch();
    });
    // const handleConditionSearch = async () => {
    //   console.log(searchParams);
    //   await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
    //   stopAutoGetData.value = false;
    // };

    const handleConditionSearch = async () => {
      await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
      stopAutoGetData.value = false;
    };
    getData();
    const handleName = (val: string) => {
      if (!val) handleConditionSearch();
    };
    /**
     * 创建和更新
     */
    const dialogParams = reactive<RequestParams.CreateAndUpdateAppList>({
      id: 0,
      name: "",
      git_url: "",
      remark: "",
      run_env: null,
      code_language: ""
    });
    const { rules, dialogVisible, handleCreateApp, formRefs, handleUpdateApp, handleCloseDialog, handleDelete } = useCreateAndUpdate(
      getData,
      pageTableRef,
      dialogParams
    );
    const handleDetail = (row: any) => {
      setSession("appDetail", row);
      if (row.env_list) {
        setSession("currentEnvironment", row.env_list[0]);
      }
      router.push({
        name: "appDetail",
        query: Object.assign({ ...router.currentRoute.value.query })
      });
    };

    const environment = (val: any) => {
      let text = "";
      if (val && val.length) {
        val.forEach((element: any) => {
          text += element.name.replace("环境", "") + "/";
        });
      }
      if (text) text = text.substr(0, text.length - 1);
      return text;
    };

    // 复制源码地址
    const handleCopyUrl = (val: string) => {
      copyField(val);
    };

    return {
      handleCloseDialog,
      tipMessage,
      rules,
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
      formRefs,
      environment,
      handleUpdateApp,
      handleCopyUrl,
      handleDelete,
      handleDetail,
      handleName,
      currentPage
    };
  }
});
</script>
<style scoped lang="less">
.rp-config-body {
  height: calc(100% - -10px);
  .container {
    padding: 20px;
  }
}
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
:deep(.page) {
  bottom: 24px;
}
.app-name {
  color: @rp-color-text-link;
  &:hover {
    cursor: pointer;
  }
}
</style>
