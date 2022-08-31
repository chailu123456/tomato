<template>
  <div class="employee-wrapper">
    <el-dialog title="关联应用" v-model="dialogVisible" width="40%" center>
      <div v-for="(item, index) in appListform" :key="item.id">
        <el-form :inline="true" :model="item" class="demo-form-inline" :rules="rules" :ref="setRefs">
          <el-form-item label="选择应用" prop="id">
            <el-select filterable v-model="item.id" placeholder="选择应用">
              <el-option v-for="item in selectLists" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分支名称" prop="branch">
            <el-input v-model="item.branch" placeholder="分支名称"></el-input>
            <el-icon class="action" @click="handleAddItemApp" v-if="index === 0">
              <CirclePlus />
            </el-icon>
            <el-icon class="action" v-else @click="handleRemoveItemApp(index)">
              <Remove />
            </el-icon>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleCreateApp">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
    <el-card class="card__employee" shadow="never">
      <template #header>
        <div class="card__header__left">
          <span>应用维护</span>
        </div>
        <div class="card__header__right" style="margin-right: 8px">
          <div>
            <el-button type="primary" @click="handleShowDialog">
              <span style="vertical-align: middle"> 关联应用 </span>
            </el-button>
          </div>
        </div>
      </template>
      <page-table :tableData="list" :hiddenPagation="true">
        <template #main>
          <el-table-column prop="id" label="序号"> </el-table-column>
          <el-table-column prop="name" label="应用名称"> </el-table-column>
          <el-table-column prop="branch" label="分支"> </el-table-column>
          <el-table-column prop="remark" class-name="table-column-left" label="备注"> </el-table-column>
          <el-table-column width="180" label="操作">
            <template #default="scope">
              <el-button link type="primary" @click="handleChangeLists(scope.row.id)">移除</el-button>
            </template>
          </el-table-column>
        </template>
      </page-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { useStore } from "@/store/index";
import { getAppList } from "@/api/request-modules/common";
import { updateAppList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import useMessageTip from "@/composables/useMessageTip";
import { defineComponent, onBeforeUpdate, PropType, watch, computed } from "vue";
import { ref } from "vue";
import { RequestParams } from "@/types/request";
import { CirclePlus, Remove } from "@element-plus/icons";

export default defineComponent({
  name: "projectManagement",
  props: {
    list: {
      default: () => [],
      type: Array as PropType<Array<any>>
    }
  },
  components: { CirclePlus, Remove },
  emits: ["refresh"],
  setup(props, { emit }) {
    const rules = {
      id: { required: true, message: "请选择应用", trigger: "blur" },
      branch: { required: true, message: "请输入分支名称", trigger: "blur" }
    };
    const store = useStore();
    const { tipMessage } = useMessageTip();
    const currentIter = computed(() => store.getters.currentIter);
    // 应用列表
    const selectLists = ref([]);
    const formRefs = ref<Array<HTMLElement & { validate: (...args: Array<any>) => void }>>([]);
    let appListform = ref([
      {
        id: "",
        branch: ""
      }
    ]);
    const dialogVisible = ref(false);
    watch(
      () => dialogVisible.value,
      (newValue) => {
        if (newValue) {
          appListform.value = [
            {
              id: "",
              branch: ""
            }
          ];
        }
      }
    );

    const handleAddItemApp = () => {
      appListform.value.push({ id: "", branch: "" });
    };
    const setRefs = (ele: HTMLElement & { validate: (...args: Array<any>) => void }) => {
      formRefs.value.push(ele as any);
    };
    onBeforeUpdate(() => {
      formRefs.value = [];
    });
    const handleRemoveItemApp = (index: number) => {
      appListform.value.splice(index, 1);
    };
    // 弹窗点击确定
    const handleCreateApp = () => {
      const flag = [] as Array<boolean>;
      for (let i = 0; i < formRefs.value.length; i++) {
        formRefs.value[i] &&
          formRefs.value[i].validate((valid: boolean) => {
            flag.push(valid);
            if (i === formRefs.value.length - 1) {
              if (flag.includes(false)) {
                return false;
              } else {
                //  提交表单
                const params = {
                  iteration_id: currentIter.value?.id,
                  list: appListform.value.concat(props.list || [])
                };
                // 新增
                // 1.获取原来的数据和现在的拼接起来
                updateAppListFn(params, (response) => {
                  if ((response as ResponseParams.ResponseDataSuccess).code === 200) {
                    tipMessage((response as ResponseParams.ResponseDataSuccess).code);
                  }
                  emit("refresh", currentIter.value?.id);
                  dialogVisible.value = false;
                });
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
    const updateAppListFn = (params: RequestParams.UpdateAppList, cb?: (...args: Array<unknown>) => void) => {
      updateAppList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        cb && cb(res);
      });
    };
    //#region 删除逻辑
    const handleChangeLists = (deleteId: string) => {
      // 1.获取原来的数据列表
      const copyList = props.list.slice();
      const deleteIndex = props.list.findIndex((item) => item.id === deleteId);
      // 2.删除掉
      copyList.splice(deleteIndex, 1);
      // 3.用剩下的数据请求更新接口
      const params = {
        iteration_id: currentIter.value?.id,
        list: copyList
      };
      updateAppListFn(params, (response) => {
        if ((response as ResponseParams.ResponseDataSuccess).code === 200) {
          tipMessage((response as ResponseParams.ResponseDataSuccess).code);
        }
        emit("refresh", currentIter.value?.id);
      });
    };
    //#endregion

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
      handleChangeLists,
      dialogVisible
    };
  }
});
</script>

<style scoped lang="less">
.employee-wrapper {
  margin-top: 2px;
  .position__center {
    position: relative;
    text-align: center;
    :deep(.el-transfer) {
      text-align: left;
      display: inline-block;
    }
  }
  :deep(.container) {
    padding: 0 !important;
  }
  :deep(.main) {
    padding: 0 !important;
  }
}
:deep(.el-card__header) {
  border-bottom: none !important;
}
.demo-form-inline {
  display: flex;
  justify-content: space-around;
}
:deep(.el-form-item) {
  display: flex;
}
:deep(.el-form-item__content) {
  display: flex;
  flex-wrap: nowrap;
}

.action {
  cursor: pointer;
  margin-left: 20px;
  font-size: 30px;
}
:deep(.cell) {
  // text-align: center !important;
}
</style>
