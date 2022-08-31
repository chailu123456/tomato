<template>
  <div>
    <div class="global-value">
      <div class="env-operation">
        <el-button class="remove-env" type="primary" @click="handleDeleteEnvironment(tipMessage)">删除环境</el-button>
        <el-button class="remove-env" type="primary" v-if="!isEdit" @click="handleEdit()">编辑</el-button>
        <el-button class="remove-env" type="primary" v-if="isEdit" @click="handleCancle()">取消</el-button>
        <el-button class="remove-env" type="primary" v-debounce v-if="isEdit" @click="handlePreserve(tipMessage)">保存</el-button>
      </div>
      <el-form :model="dialogParams" :disabled="!isEdit" label-width="70px" class="applist-form">
        <el-form-item label="值" prop="value">
          <el-input type="textarea" :rows="10" v-model="dialogParams.value"></el-input>
        </el-form-item>
        <el-form-item label="加密" prop="is_encryption">
          <el-checkbox v-model="dialogParams.is_encryption"></el-checkbox>
        </el-form-item>
      </el-form>
      <el-button type="text" v-if="isLookDecrypt" style="margin-left: 66px" @click="decrypt(dialogParams.value)">查看</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref, PropType, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { deleteGlobalVarEnv, updateGlobalEnv, decryptGlobalVal } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import useMessageTip from "@/composables/useMessageTip";
import { RequestParams } from "@/types/request";
import { getSession } from "@/utils";
type Slide = {
  value: number;
  label: string;
};
type Envlist = {
  env_id: number;
  id: number;
  is_encryption: boolean;
  env_code: string;
  value: string;
  env_name: string;
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
    let allTabData = getSession("allTabEnvList", true) as any;
    const { tipMessage } = useMessageTip();

    // 是否展示查看字段(解密值)
    const isLookDecrypt = ref(false);
    // 值是否解密过,解密过则不请求解密接口
    const isDecrypt = ref(false);
    // 解密值
    const decrypt = (val: string) => {
      if (!val) return tipMessage(400, "值不存在，无需解密");
      if (isDecrypt.value) return tipMessage(400, "值已经解密，无需解密");
      const formData: any = new FormData();
      formData.append("text", val);
      decryptGlobalVal<ResponseParams.ResponseDataSuccessing>(formData).then((res) => {
        dialogParams.value = res.data;
        isDecrypt.value = true;
      });
    };

    /**
     * 更新
     */
    const dialogParams = reactive<RequestParams.UpdateGlobalEnv>({
      is_encryption: false,
      globalId: 0,
      value: ""
    });
    const isEdit = ref(false);

    // 获取当前tab环境数据
    const getData = async () => {
      isLookDecrypt.value = false;
      isDecrypt.value = false;
      currentEnvironment = getSession("currentEnvironment", true) as any;
      allTabData = getSession("allTabEnvList", true) as any;
      const data = allTabData.filter((item: Envlist) => item.env_id == currentEnvironment.id);
      dialogParams.is_encryption = data[0].is_encryption;
      dialogParams.value = data[0].value;
      dialogParams.globalId = data[0].id;
      if (data[0].is_encryption) isLookDecrypt.value = true;
      isEdit.value = false;
    };
    if (currentEnvironment.name === props.title) {
      getData();
    }

    // 编辑
    const handleEdit = () => {
      isEdit.value = true;
      if (dialogParams.is_encryption) {
        if (!isDecrypt.value) decrypt(dialogParams.value);
      }
    };

    // 取消
    const handleCancle = () => {
      getData(); // 将默认值还原
    };

    // 保存数据
    const handlePreserve = (tipMessage: (code: number) => void) => {
      updateGlobalEnv<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
        tipMessage(res.code);
        if (dialogParams.is_encryption) {
          isLookDecrypt.value = true;
          isDecrypt.value = false;
        }
        isEdit.value = false;
        context.emit("update:getTabData", currentEnvironment);
        // 这个的调用父组件方法 会把最新的数据拿回来 在appDetal.vue 然后掉完之后在会掉上边getData方法
      });
    };

    watch(
      () => props.currentTab,
      (newVal) => {
        if (newVal === props.title) {
          getData();
        }
      },
      { immediate: true }
    );
    // 删除当前环境
    const handleDeleteEnvironment = (tipMessage: (code: number) => void) => {
      currentEnvironment = getSession("currentEnvironment", true) as any;
      ElMessageBox.confirm("此操作将永久删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const params: RequestParams.DeleteGlobalEnvList = {
            globalKey: appDetailMsg.key,
            envId: Number(currentEnvironment.id)
          };
          deleteGlobalVarEnv<ResponseParams.ResponseDataSuccess>(params).then((res) => {
            tipMessage(res.code);
            context.emit("update:getTabData");
          });
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除"
          });
        });
    };

    return {
      tipMessage,
      getData,
      ...toRefs(props),
      dialogParams,
      handleDeleteEnvironment,
      isEdit,
      handleEdit,
      handleCancle,
      handlePreserve,
      appDetailMsg,
      decrypt,
      isLookDecrypt,
      isDecrypt
    };
  }
});
</script>
<style scoped lang="less">
.global-value {
  padding: 10px 20px;
  .env-operation {
    text-align: right;
    .remove-env {
      margin-bottom: 10px;
    }
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
</style>
