<template>
  <div>
    <page-table :tableData="list" :currentPage="page" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="应用名称">
            <el-input v-model="appDetailMsg.name" disabled></el-input>
          </el-form-item>
          <el-form-item label="变量键/值">
            <el-input
              v-model.trim="searchParams.keyword"
              @change="handleName"
              @keyup.enter="handleConditionSearch"
              placeholder="请输入变量键/值"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="范围">
            <el-select
              v-model="searchParams.type"
              placeholder="全部"
              clearable
              @change="handleRang"
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in RANGE" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">搜 索</el-button>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="handleUpdateApp(0)">新增键值</el-button>
            <el-button type="primary" @click="handleSyncUpdate(tipMessage)">同步键值</el-button>
            <el-button type="primary" @click="handleDeleteEnvironment(tipMessage)">删除环境</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column class-name="table-column-left" prop="key" label="键"> </el-table-column>
        <el-table-column class-name="table-column-left" prop="value" label="值"> </el-table-column>
        <el-table-column prop="run_env" label="范围">
          <template #default="scoped">
            <span v-if="scoped.row.version_id === 0">全局</span>
            <span v-else>应用</span>
          </template>
        </el-table-column>
        <el-table-column prop="run_env" label="最后访问时间">
          <template #default="scoped">
            <span>{{ scoped.row.last_visit_time ? dayjs(scoped.row.last_visit_time).format("YYYY-MM-DD HH:mm:ss") : "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" class-name="table-column-left" label="备注"> </el-table-column>
        <el-table-column label="操作">
          <template #default="scoped">
            <el-button type="text" :disabled="scoped.row.version_id === 0" @click="handleUpdateApp(1, scoped.row)">编辑</el-button>
            <el-button type="text" :disabled="scoped.row.version_id === 0" @click="handleDelete(scoped.row, tipMessage)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :before-close="handleCloseDialog" :title="dialogParams.id !== 0 ? '编辑' : '新增'" v-model="dialogVisible" width="40%">
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="applist-form">
        <el-form-item label="当前应用" prop="name">
          <el-input type="text" :disabled="true" v-model="dialogParams.name"></el-input>
        </el-form-item>
        <el-form-item label="当前环境" prop="env">
          <el-input type="text" :disabled="true" v-model="dialogParams.env"></el-input>
        </el-form-item>
        <el-form-item label="键" prop="key">
          <el-input
            type="text"
            placeholder="英文、下划线、中划线，数字，英文逗号，2-60个字符"
            :disabled="dialogParams.id ? true : false"
            v-model="dialogParams.key"
          ></el-input>
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input type="text" v-model="dialogParams.value"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
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
    <el-dialog :before-close="handleCloseSyncDialog" title="差量同步" v-model="dialogSyncVisible" width="40%">
      <el-form :model="dialogSyncParams" :rules="ruleSync" ref="formRefSync" label-width="100px" class="applist-form">
        <el-form-item label="当前应用" prop="name">
          <el-input type="text" :disabled="true" v-model="dialogSyncParams.name"></el-input>
        </el-form-item>
        <el-form-item label="当前环境" prop="env">
          <el-input type="text" :disabled="true" v-model="dialogSyncParams.env"></el-input>
        </el-form-item>
        <el-form-item label="来源环境" prop="env">
          <el-select v-model="dialogSyncParams.src_env_id" placeholder="请选择">
            <el-option v-for="item in allTabSyncEnvList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="同步范围">
          <el-radio-group v-model="dialogSyncParams.type">
            <el-radio :label="0">仅同步差量键</el-radio>
            <el-radio :label="1">同步差量键值对</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleSyncConfig(tipMessage)">保 存</el-button>
          <el-button @click="dialogSyncVisible = false">取 消</el-button>
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
import { defineComponent, reactive, toRefs, ref, onBeforeUnmount, PropType, watch } from "vue";
import { LANGUAGE, ENVIRONMENT_VARIABLE } from "@/utils";
import useCreateAndUpdate from "./composables/useCreateOrUpdate";
import useSyncUpdate from "./composables/useSyncKey";
import useMessageTip from "@/composables/useMessageTip";
import dayjs from "dayjs";
import { RequestParams } from "@/types/request";
import { getSession, clearSession } from "@/utils";
import { RANGE } from "@/utils/contantOptions";
type Slide = {
  value: number;
  label: string;
};

export default defineComponent({
  name: "appDetail",
  props: {
    title: {
      type: String,
      default: () => ""
    },
    currentEnvId: {
      type: Number,
      default: () => 0
    },
    currentTab: {
      type: String,
      default: () => ""
    },
    allTabSyncEnvList: {
      type: Array as PropType<Slide[]>,
      default: () => []
    }
  },
  setup(props, context) {
    const appDetailMsg = getSession("appDetail", true) as any;
    let currentEnvironment = getSession("currentEnvironment", true) as any;
    const { tipMessage } = useMessageTip();
    const searchParams = reactive({
      keyword: "",
      type: [],
      appId: appDetailMsg.id,
      envId: currentEnvironment.id
    });
    const page = ref(1);

    const tableData = reactive({
      list: [],
      total: 0
    });
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      const { response } = useRequest(useFetchSearch, params || searchParams);
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
    };
    // 获取当前环境下的数据
    if (currentEnvironment.name === props.title) {
      getData();
    }
    const handleConditionSearch = async () => {
      // context.emit("update:getTabData", currentEnvironment.id);
      await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
      stopAutoGetData.value = false;
    };
    const handleName = (val: string) => {
      if (!val) handleConditionSearch();
    };
    /**
     * 创建和更新
     */
    const dialogParams = reactive<RequestParams.CreateAndUpdateConfigList>({
      id: 0,
      name: appDetailMsg.name,
      env: "",
      key: "",
      appId: appDetailMsg.id,
      envId: currentEnvironment.id,
      value: "",
      remark: ""
    });
    const {
      rules,
      handleCreateAppShowDialog,
      dialogVisible,
      handleCreateApp,
      formRef,
      handleUpdateApp,
      handleCloseDialog,
      handleDelete,
      validatePass,
      handleDeleteEnvironment
    } = useCreateAndUpdate(getData, pageTableRef, dialogParams, context);

    onBeforeUnmount(() => {
      clearSession("currentEnvironment");
      clearSession("allTabEnvList");
      clearSession("allTabSyncEnvList");
      clearSession("appDetail");
    });

    const handleRang = (val: number) => {
      if (!val) {
        handleConditionSearch();
      }
    };

    // 同步键值
    const dialogSyncParams = reactive<RequestParams.CreateSyncConfigList>({
      name: appDetailMsg.name,
      src_env_id: 1,
      appId: appDetailMsg.id,
      type: 0,
      env: ""
    });
    const { ruleSync, handleCloseSyncDialog, dialogSyncVisible, handleSyncConfig, formRefSync, handleSyncUpdate } = useSyncUpdate(
      getData,
      pageTableRef,
      dialogSyncParams
    );

    watch(
      () => props.currentTab,
      (newVal) => {
        if (newVal === props.title) {
          page.value = 1;
          searchParams.envId = props.currentEnvId;
          getData();
          console.log(222233);
          console.log(pageTableRef.value);
        }
      },
      { immediate: true }
    );
    // 表格环境展示
    const environment = (val: any) => {
      let text = "";
      if (val && val.length) {
        val.forEach((element: any) => {
          text += "/" + element.name.replace("环境", "");
        });
      }
      if (text) text = text.substr(0, text.length - 1);
      return text;
    };
    return {
      handleCloseDialog,
      tipMessage,
      rules,
      handleCreateAppShowDialog,
      handleConditionSearch,
      stopAutoGetData,
      getData,
      ...toRefs(tableData),
      ...toRefs(props),
      pageTableRef,
      searchParams,
      dialogVisible,
      dialogParams,
      handleCreateApp,
      ENVIRONMENT_VARIABLE,
      RANGE,
      LANGUAGE,
      dayjs,
      formRef,
      environment,
      handleUpdateApp,
      handleDelete,

      appDetailMsg,
      handleDeleteEnvironment,
      validatePass,

      dialogSyncParams,
      ruleSync,
      handleCloseSyncDialog,
      dialogSyncVisible,
      formRefSync,
      handleSyncUpdate,
      handleSyncConfig,
      handleName,
      handleRang,
      page
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
.app-name {
  color: blue;
  &:hover {
    cursor: pointer;
  }
}
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  button {
    display: block;
    width: 160px;
    margin-left: 0;
    margin-top: 20px;
  }
}
</style>
