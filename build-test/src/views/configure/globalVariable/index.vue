<template>
  <div class="rp-global-var">
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
          <el-form-item label="变量名称">
            <el-input
              v-model.trim="searchParams.keyword"
              @change="handleName"
              @keyup.enter="handleConditionSearch"
              placeholder="请输入变量名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="环境">
            <el-select
              v-model="searchParams.env_id"
              @change="handleEnv"
              placeholder="--所有--"
              clearable
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in envList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdateApp(0)">新 增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="key" class-name="table-column-left" label="变量名称">
          <template #default="scoped">
            <span class="app-name" @click="handleDetail(scoped.row)">{{ scoped.row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="run_env" label="环境">
          <template #default="scoped">
            <span>{{ environment(scoped.row.env_list) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" class-name="table-column-left" label="备注"> </el-table-column>
        <el-table-column label="操作">
          <template #default="scoped">
            <el-button type="primary" link @click="handleLookVal(scoped.row.env_list)">查看值</el-button>
            <el-button type="primary" link @click="handleUpdateApp(1, scoped.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scoped.row, tipMessage)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog :before-close="handleCloseDialog" :title="dialogParams.id !== 0 ? '编辑' : '新增'" v-model="dialogVisible" width="40%">
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="applist-form">
        <el-form-item label="变量名称" prop="key">
          <el-input
            type="text"
            placeholder="英文、下划线、中划线，数字，英文逗号，2-60个字符"
            :disabled="Boolean(dialogParams.id)"
            v-model="dialogParams.key"
          ></el-input>
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
    <el-dialog :before-close="handleCloseLookDialog" title="查看" v-model="dialogLookVisible" width="40%">
      <ul class="look-val">
        <li v-for="(item, index) in lookVal" :key="index">
          <span>{{ item.name }}：</span>
          <span>{{ item.code }}</span>
          <span class="val-copy" @click="handleCopyUrl(item.code)">复制</span>
        </li>
      </ul>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogLookVisible = false">确 定</el-button>
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
import { useRouter } from "vue-router";
import useCreateAndUpdate from "./composables/useCreateOrUpdate";
import useMessageTip from "@/composables/useMessageTip";
import copyField from "@/utils/copyField";
import { setSession } from "@/utils/sesssion";
import { useStore } from "@/store/index";

type EnvList = {
  id: number;
  code: string;
  name: string;
};

export default defineComponent({
  name: "globalVariable",
  setup() {
    const router = useRouter();
    const { tipMessage } = useMessageTip();
    const searchParams = reactive({
      keyword: "",
      env_id: []
    });
    const tableData = reactive({
      list: [],
      total: 0
    });
    const currentPage = ref(1);

    const store = useStore();
    const envList = store.state.envList;
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
    getData();
    const handleConditionSearch = async () => {
      await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
      stopAutoGetData.value = false;
    };
    const handleName = (val: string) => {
      if (!val) handleConditionSearch();
    };
    const handleEnv = (val: string) => {
      if (!val) handleConditionSearch();
    };
    onActivated(() => {
      getData();
    });
    /**
     * 创建和更新
     */
    const dialogParams = reactive<RequestParams.CreateAndUpdateGlobalList>({
      id: 0,
      remark: "",
      key: ""
    });
    const { rules, handleCreateAppShowDialog, dialogVisible, handleCreateApp, formRef, handleUpdateApp, handleCloseDialog, handleDelete } = useCreateAndUpdate(
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
        name: "globalVariableDetail",
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

    // 查看值
    const lookVal = ref<EnvList[]>([]);
    const dialogLookVisible = ref(false);
    const handleLookVal = (val: EnvList[]) => {
      if (!val.length) return tipMessage(400, "暂无值,请先配置环境");
      dialogLookVisible.value = true;
      lookVal.value = val;
    };

    const handleCloseLookDialog = () => {
      dialogLookVisible.value = false;
    };

    // 复制源码地址
    const handleCopyUrl = (val: string) => {
      copyField(val);
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
      pageTableRef,
      searchParams,
      dialogVisible,
      dialogParams,
      handleCreateApp,
      envList,
      formRef,
      environment,
      handleUpdateApp,

      handleLookVal,
      lookVal,
      dialogLookVisible,
      handleCloseLookDialog,
      handleCopyUrl,

      handleDelete,
      handleDetail,
      handleName,
      handleEnv,
      currentPage
    };
  }
});
</script>
<style scoped lang="less">
.rp-global-var {
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
.app-name {
  color: @rp-color-text-link;
  &:hover {
    cursor: pointer;
  }
}
:deep(.page) {
  bottom: 24px;
}
.look-val {
  li {
    line-height: 30px;
    .val-copy {
      color: #1f9f85;
      float: right;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
