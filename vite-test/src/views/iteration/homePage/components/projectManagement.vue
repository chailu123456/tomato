<template>
  <div class="employee-wrapper">
    <el-dialog title="关联应用" v-model="dialogVisible" width="40%" center>
      <div v-for="(item, index) in appListform" :key="item.id">
        <el-form :inline="true" :model="item" class="demo-form-inline" :rules="rules" :ref="setRefs">
          <el-form-item label="选择应用" prop="app">
            <el-select filterable v-model="item.app" placeholder="选择应用">
              <el-option v-for="item in selectLists" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分支名称" prop="branch">
            <el-input v-model="item.branch" placeholder="分支名称"></el-input>
            <i class="el-icon-circle-plus-outline action" @click="handleAddItemApp" v-if="index === 0"></i>
            <i class="el-icon-remove-outline action" v-else @click="handleRemoveItemApp(index)"></i>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleCreateApp">确 定</el-button>
          <el-button @click="handleChangeDialogStatus(true)">取 消</el-button>
        </span>
      </template>
    </el-dialog>
    <el-card class="card__employee">
      <template #header>
        <div class="card__header__left">
          <span>应用维护</span>
        </div>
        <div class="card__header__right">
          <div>
            <el-button icon="el-icon-plus" type="primary" @click="handleShowDialog">关联应用</el-button>
          </div>
        </div>
      </template>
      <page-table :tableData="list" :hiddenPagation="true">
        <template #main>
          <el-table-column prop="id" label="序号"> </el-table-column>
          <el-table-column prop="name" label="应用名称"> </el-table-column>
          <el-table-column prop="" label="分支"> </el-table-column>
          <el-table-column prop="remark" label="备注"> </el-table-column>
          <el-table-column width="180" label="操作">
            <!-- <template #default="scope">
              <el-button type="text" @click="handleChangeLists(scope.row.id)">移除</el-button>
            </template> -->
          </el-table-column>
        </template>
      </page-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { getAppList } from "@/api/request-modules/common";
// import useMessageTip from "@/composables/useMessageTip";
import { ResponseParams } from "@/types/response";
import { defineComponent, onBeforeUpdate, PropType, reactive } from "vue";
import { ref } from "vue";
// import { useRoute } from "vue-router";
// import useGetEmployeeAndAppLIsts from "./composables/getEmployeeAndAppLIsts";

export default defineComponent({
  name: "projectManagement",
  props: {
    list: {
      default: () => [],
      type: Array as PropType<Array<any>>
    }
  },
  emits: ["refresh"],
  setup() {
    const rules = {
      app: { required: true, message: "请选择应用", trigger: "blur" },
      branch: { required: true, message: "请输入分支名称", trigger: "blur" }
    };
    // const { tipMessage } = useMessageTip();
    // 应用列表
    const selectLists = ref([]);
    const formRefs = ref<Array<HTMLElement & { validate: (...args: Array<any>) => void }>>([]);
    const appListform = reactive([
      {
        app: "",
        branch: ""
      }
    ]);
    const dialogVisible = ref(false);
    const handleAddItemApp = () => {
      appListform.push({ app: "", branch: "" });
    };
    const setRefs = (ele: HTMLElement & { validate: (...args: Array<any>) => void }) => {
      formRefs.value.push(ele);
    };
    onBeforeUpdate(() => {
      formRefs.value = [];
    });
    const handleRemoveItemApp = (index: number) => {
      appListform.splice(index, 1);
    };
    // 弹窗点击确定
    const handleCreateApp = () => {
      const flag = [] as Array<boolean>;
      for (let i = 0; i < formRefs.value.length; i++) {
        formRefs.value[i].validate((valid: boolean) => {
          flag.push(valid);
          if (i === formRefs.value.length - 1) {
            if (flag.includes(false)) {
              return false;
            } else {
              //  提交表单
            }
          }
        });
      }
    };

    const handleShowDialog = () => {
      getAppList<ResponseParams.ResponseDataSuccess>().then((res) => {
        selectLists.value = res.data;
      });
      dialogVisible.value = true;
    };
    // const appList = ref<Array<{ disabled: boolean; label: string; key: string }>>([]);
    // const { handleShowDialog, filterMethod, handleChangeLists, dialogVisible, selectLists } = useGetEmployeeAndAppLIsts(props, "app", appList, route, emit, tipMessage);

    return {
      setRefs,
      handleRemoveItemApp,
      handleAddItemApp,
      handleCreateApp,
      appListform,
      handleShowDialog,
      rules,
      // appList
      selectLists,
      // filterMethod,
      // handleChangeLists,
      dialogVisible
    };
  }
});
</script>

<style scoped lang="less">
.employee-wrapper {
  margin-top: 20px;
  .position__center {
    position: relative;
    text-align: center;
    ::v-deep(.el-transfer) {
      text-align: left;
      display: inline-block;
    }
  }
}
::v-deep(.el-card__header) {
  border-bottom: none !important;
}
.demo-form-inline {
  display: flex;
  justify-content: space-around;
}
::v-deep(.el-form-item) {
  display: flex;
}
::v-deep(.el-form-item__content) {
  display: flex;
}
.action {
  cursor: pointer;
  margin-left: 20px;
  font-size: 30px;
}
</style>
