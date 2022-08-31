<template>
  <div class="rp-config-body">
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams" @submit.prevent>
          <el-form-item label="名称/环境代码">
            <el-input
              v-model.trim="searchParams.name"
              @change="handleName"
              @keyup.enter="handleConditionSearch"
              placeholder="请输入名称/环境代码"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleCreateAppShowDialog(0)">新 增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" class-name="table-column-left" min-width="300" label="环境名称"></el-table-column>
        <el-table-column prop="code" label="环境代码"></el-table-column>
        <el-table-column prop="remark" class-name="table-column-left" label="备注"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scoped">
            <el-button type="text" @click="handleUpdateApp(1, scoped.row)">编辑</el-button>
            <el-button :class="[scoped.row.is_sys ? '' : 'delete']" :disabled="scoped.row.is_sys" type="text" @click="handleDelete(scoped.row, tipMessage)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :before-close="handleCloseDialog" :title="dialogParams.id !== 0 ? '编辑' : '新增'" v-model="dialogVisible" width="40%">
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="applist-form">
        <el-form-item label="环境名称" prop="name">
          <el-input type="text" placeholder="2-20个字" v-model="dialogParams.name"></el-input>
        </el-form-item>
        <el-form-item label="环境代码" prop="code">
          <el-input type="text" :disabled="dialogParams.is_sys" placeholder="仅支持英文、数字、中横线,1-10个字符" v-model="dialogParams.code"></el-input>
        </el-form-item>
        <el-form-item label="环境同步" prop="sync_env_id" v-if="!dialogParams.id">
          <el-select v-model="dialogParams.sync_env_id" placeholder="请选择同步环境">
            <el-option v-for="item in envList" :key="item.id" :label="item.value" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" placeholder="0-50个字" v-model="dialogParams.remark"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleCreateApp(tipMessage)">保 存</el-button>
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
import useFetchSearch from "./composables/useFetchSearch";
import { defineComponent, reactive, toRefs, ref, onActivated } from "vue";
import useCreateAndUpdate from "./composables/useCreateOrUpdate";
import useMessageTip from "@/composables/useMessageTip";
import { RequestParams } from "@/types/request";
import { getEnvirmentSelectList } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
export default defineComponent({
  name: "environmentVariable",
  setup() {
    const { tipMessage } = useMessageTip();
    const searchParams = reactive({
      name: ""
    });
    const envList: any = ref([]);
    const tableData = reactive({
      list: [],
      total: 0
    });
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    let timer: ReturnType<typeof setTimeout>;

    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { response } = useRequest(useFetchSearch, params || searchParams);
        const { pagation } = useRenderTable(response);
        let {
          data: { list, count }
        } = await pagation(pagationParams);
        tableData.total = count;
        tableData.list = list;
      });
    };
    getData();
    const handleConditionSearch = async () => {
      await getData(pageTableRef.value?.getCurrentPage(), true, searchParams);
      stopAutoGetData.value = false;
    };
    const handleName = (val: string) => {
      if (!val) {
        searchParams.name = "";
        handleConditionSearch();
      }
    };
    getEnvirmentSelectList<ResponseParams.ResponseDataSuccess>().then((res) => {
      if (res.code === 200) {
        let data = res.data;
        data.forEach((item: Record<string, any>) => {
          envList.value.push({ id: item.id, value: item.name });
        });
      }
    });
    onActivated(() => {
      getData();
    });

    /**
     * 创建和更新
     */
    const dialogParams = reactive<RequestParams.CreateAndUpdateEnvList>({
      id: 0,
      name: "",
      code: "",
      remark: "",
      is_sys: false,
      sync_env_id: ""
    });
    const { rules, handleCreateAppShowDialog, dialogVisible, handleCreateApp, formRef, handleUpdateApp, handleCloseDialog, handleDelete } = useCreateAndUpdate(
      getData,
      pageTableRef,
      dialogParams
    );

    return {
      handleCloseDialog,
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
      formRef,
      handleUpdateApp,
      handleDelete,
      handleName,
      envList
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
</style>
