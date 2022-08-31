<template>
  <div style="margin-top: 0px">
    <div class="rp-app-name">
      {{ dialogParams.name }}
    </div>
    <div v-if="editableTabs.length" style="position: relative; background: #fff; height: 100%">
      <div style="z-index: 1; position: absolute; margin-top: 8px; right: 20px">
        <el-button type="primary" @click="handleAddEnv">新增环境</el-button>
      </div>
      <el-tabs v-model="editableTabsValue" class="tab-env" type="card" @tab-click="handleTabsName" @edit="handleTabsEdit">
        <el-tab-pane :key="item.name" v-for="item in editableTabs" :closable="false" :label="item.title" :name="item.name">
          <div>
            <AppDetail
              :title="item.title"
              :allTabSyncEnvList="slideFilter"
              ref="tabRef"
              @update:getTabData="getTabData"
              :currentEnvId="Number(item.name)"
              :currentTab="currentTab"
            ></AppDetail>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-else>
      <el-empty>
        <el-button type="primary" @click="handleAddEnv">当前没有环境哦，去新增</el-button>
      </el-empty>
    </div>
    <el-dialog :before-close="handleCloseDialog" title="新增环境" v-model="dialogVisible" width="40%">
      <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="100px" class="applist-form">
        <el-form-item label="当前应用" prop="name">
          <el-input type="text" :disabled="true" v-model="dialogParams.name"></el-input>
        </el-form-item>
        <el-form-item label="新增环境" prop="env_id">
          <el-select v-model="dialogParams.env_id" placeholder="请选择">
            <el-option v-for="item in slideList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleCreateEnvirment(tipMessage)">保 存</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, ref, defineComponent, onMounted } from "vue";
import AppDetail from "./appDetail/index.vue";
import { getSession, setSession, clearSession } from "@/utils";
import { RequestParams } from "@/types/request";
import { ENVIRONMENT_VARIABLE } from "@/utils";
import dayjs from "dayjs";
import { ResponseParams } from "@/types/response";
import { getTabCount, createEnvirment } from "@/api/request-modules/configure";
import useMessageTip from "@/composables/useMessageTip";
import { useStore } from "@/store/index";
type Envlist = {
  id: number;
  code: string;
  name: string;
};
type TabListArr = {
  title: string;
  name: string;
  content: string;
  id?: number | undefined;
};

type CurrentEnvironment = {
  name: string;
  id: string;
};

type CreateEnv = {
  appId: number;
  env_id: number;
  name: string;
};

type Slide = {
  value: number;
  label: string;
};

interface TabList {
  editableTabsValue: string;
  tabIndex: number;
  editableTabs: TabListArr[];
}

export default defineComponent({
  name: "appDetail",
  components: {
    AppDetail
  },
  setup() {
    const { tipMessage } = useMessageTip();
    const store = useStore();
    const data = reactive({});
    const formRef = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; resetFields: () => void }>();
    const appDetailMsg = getSession("appDetail", true) as any;
    const tabData = reactive<TabList>({
      editableTabsValue: "1",
      editableTabs: [],
      tabIndex: 1
    });
    const rules = {
      name: [{ required: true, message: "", trigger: "blur" }],
      env_id: [{ required: true, message: "请选择环境", trigger: "change" }]
    };
    const dialogVisible = ref(false);
    const dialogParams = reactive<CreateEnv>({
      name: appDetailMsg?.name,
      env_id: 1,
      appId: appDetailMsg?.id
    });

    // 过滤环境列表 新增环境时用到 过滤当前已经存在的环境
    let slideList = ref<Slide[]>([]);
    const tabRef = ref<any>(null);
    const handleTabsEdit = (targetName: string, action: string): void => {
      if (action === "add") {
        if (slideList.value.length) dialogVisible.value = true;
        else tipMessage(400, "环境已全部展示，暂无环境可新增");
      }
      if (action === "remove") {
        if (tabRef.value) tabRef.value.handleDeleteEnvironment(tipMessage);
      }
    };

    // 新增环境
    const handleAddEnv = () => {
      if (slideList.value.length) dialogVisible.value = true;
      else tipMessage(400, "环境已全部展示，暂无环境可新增");
    };

    const handleCloseDialog = () => {
      formRef.value!.resetFields();
      dialogParams.env_id = 1;
      dialogVisible.value = false;
    };

    // 保存
    const handleCreateEnvirment = (tipMessage: (code: number) => void) => {
      formRef.value &&
        formRef.value.validate((valid: boolean) => {
          if (valid) {
            createEnvirment<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
              tipMessage(res.code);
              getTabData();
              dialogVisible.value = false;
            });
          } else {
            console.log("error submit!!");
            return false;
          }
        });
    };

    const currentTab = ref("");
    // 当前应用下所有环境
    const slideFilter = ref<Slide[]>([]);
    // 环境模块点击切换
    const handleTabsName = (params: any) => {
      const obj: CurrentEnvironment = { name: params.props.label, id: params.props.name };
      setSession("currentEnvironment", JSON.stringify(obj));
      currentTab.value = params.props.label;
      tabData.tabIndex = params.props.name;
      const allTabEnvList = JSON.parse(JSON.stringify(getSession("allTabEnvList", true) as any));
      slideFilter.value = [];
      allTabEnvList.forEach((item: Envlist) => {
        if (item.id != Number(params.props.name)) {
          slideFilter.value.push({
            value: item.id,
            label: item.name
          });
        }
      });
      setSession("allTabSyncEnvList", JSON.stringify(slideFilter.value));
    };
    // 获取环境列表
    const getTabData = () => {
      const params: RequestParams.GetConfigTab = {
        appId: appDetailMsg.id
      };
      getTabCount<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        if (res.data && res.data.length) {
          tabData.editableTabs = [];
          slideFilter.value = [];
          for (let i = 0; i < res.data.length; i++) {
            let item: Envlist = res.data[i];
            tabData.editableTabs.push({
              title: item.name,
              name: item.id + "",
              id: item.id,
              content: item.name
            });
            // 过滤环境列表, 同步键值时用到，不能同步到自己的环境
            let it: Envlist = res.data[i + 1];
            if (it) {
              slideFilter.value.push({
                value: it.id,
                label: it.name
              });
            }
          }
          // 保存当前应用所有的环境   后期在同步键值中用掉
          setSession("allTabEnvList", JSON.stringify(res.data));
          setSession("allTabSyncEnvList", JSON.stringify(slideFilter.value));

          slideList.value = [];
          filter(res.data, store.state.envList);
          // 默认显示第一个环境
          tabData.editableTabsValue = tabData.editableTabs[0].name;
          tabData.tabIndex = Number(tabData.editableTabs[0].id);
          const obj: CurrentEnvironment = { name: tabData.editableTabs[0].title, id: tabData.editableTabs[0].id + "" };
          // 保存当前环境
          setSession("currentEnvironment", JSON.stringify(obj));
        } else {
          clearSession("currentEnvironment");
          let slide_env = JSON.parse(JSON.stringify(store.state.envList));
          slideList.value = slide_env;
          tabData.editableTabs = [];
          tabData.editableTabsValue = "1";
          tabData.tabIndex = 1;
        }
      });
    };
    getTabData();

    // 去重环境下拉数据
    const filter = (array1: any, array2: any) => {
      for (var i = 0; i < array2.length; i++) {
        var obj = array2[i];
        var num = obj.value;
        var isExist = false;
        for (var j = 0; j < array1.length; j++) {
          var aj = array1[j];
          var n = aj.id;
          if (n == num) {
            isExist = true;
            break;
          }
        }
        if (!isExist) {
          if (obj.value) slideList.value.push(obj);
        }
      }
      if (slideList.value.length) dialogParams.env_id = slideList.value[0].value || 1;
    };

    return {
      ...toRefs(tabData),
      ...toRefs(data),
      dialogParams,
      getTabData,
      dayjs,
      handleTabsEdit,
      handleTabsName,
      currentTab,
      dialogVisible,
      ENVIRONMENT_VARIABLE,
      tabRef,
      onMounted,
      rules,
      tipMessage,
      handleCreateEnvirment,
      handleCloseDialog,
      formRef,
      slideList,
      handleAddEnv,
      slideFilter
    };
  }
});
</script>
<style scoped lang="less">
.rp-app-name {
  background: #fff;
  position: absolute;
  top: 4px;
  z-index: 99;
  width: 250px;
  height: 34px;
  line-height: 34px;
  text-align: center;
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
  color: blue;
  &:hover {
    cursor: pointer;
  }
}
.tab-env {
  width: 100%;
  :deep(.el-tabs__header) {
    width: calc(100% - 110px);
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
