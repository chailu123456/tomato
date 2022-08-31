import { createAndUpdateConfigTabList, deleteConfigEnv, deleteCurrentConfigEnv } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import { Ref, ref, nextTick, SetupContext } from "vue";
import { RequestParams } from "@/types/request";
import { getSession } from "@/utils";
import { ElMessageBox, ElMessage } from "element-plus";
const dialogVisible = ref(false);
const validatePass = (rule: any, value: string, callback: any) => {
  if (value.length >= 2 && value.length <= 60) {
    const reg = /[^,.a-zA-Z1-9_-]/;
    if (reg.test(value)) {
      callback(new Error("请输入正确格式键值(英文、下划线、中划线，数字，英文逗号，2-60个字符"));
    } else {
      callback();
    }
  } else {
    callback(new Error("请输入正确格式键值(英文、下划线、中划线，数字，英文逗号，2-60个字符"));
  }
};

export default function useCreateAndUpdate(
  getData: (...args: any) => void,
  pageTableRef: Ref<HTMLElement & { getCurrentPage: () => void }>,
  dialogParams: RequestParams.CreateAndUpdateConfigList,
  context: SetupContext
): Record<string, any> {
  const formRef = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; resetFields: () => void }>();
  const handleCreateAppShowDialog = () => {
    dialogVisible.value = true;
  };
  const rules = {
    key: [{ required: true, validator: validatePass, trigger: "blur" }],
    value: [{ required: false, message: "请输入值", trigger: "blur" }],
    remark: [{ required: true, message: "请输入5-50字产品描述", trigger: "blur", min: 5, max: 50 }]
  };
  const handleCloseDialog = () => {
    formRef.value!.resetFields();
    dialogParams.id = 0;
    dialogVisible.value = false;
  };
  const appDetailMsg = getSession("appDetail", true) as any;
  // 保存
  const handleCreateApp = (tipMessage: (code: number) => void) => {
    formRef.value &&
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          createAndUpdateConfigTabList<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
            if (res.code === 200) {
              tipMessage(res.code);
              getData(pageTableRef.value.getCurrentPage());
              dialogVisible.value = false;
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
  };
  // 获取当前环境
  let currentEnvironment = getSession("currentEnvironment", true) as any;
  const handleUpdateApp = (isEdit: number, row: RequestParams.CreateAndUpdateConfigList) => {
    currentEnvironment = getSession("currentEnvironment", true) as any;
    if (isEdit) {
      // 编辑数据
      nextTick(() => {
        dialogParams.id = row.id;
        dialogParams.name = appDetailMsg.name;
        dialogParams.env = currentEnvironment.name;
        dialogParams.appId = appDetailMsg.id;
        dialogParams.envId = currentEnvironment.id * 1;
        dialogParams.key = row.key;
        dialogParams.remark = row.remark;
        dialogParams.value = row.value;
      });
    } else {
      // 新增数据
      dialogParams.id = 0;
      dialogParams.name = appDetailMsg.name;
      dialogParams.appId = appDetailMsg.id;
      dialogParams.envId = currentEnvironment.id * 1;
      dialogParams.env = currentEnvironment.name;
      dialogParams.key = "";
      dialogParams.value = "";
      dialogParams.remark = "";
    }
    dialogVisible.value = true;
  };

  // 删除环境下某一条数据
  const handleDelete = (row: RequestParams.CreateAndUpdateConfigList, tipMessage: (code: number) => void) => {
    currentEnvironment = getSession("currentEnvironment", true) as any;
    ElMessageBox.confirm("此操作将永久删除, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const params: RequestParams.deleteSyncConfigList = {
          appId: appDetailMsg.id,
          envId: Number(currentEnvironment.id),
          id: row.id
        };
        deleteConfigEnv<ResponseParams.ResponseDataSuccess>(params).then((res) => {
          tipMessage(res.code);
          getData(pageTableRef.value.getCurrentPage());
          dialogVisible.value = false;
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消删除"
        });
      });
  };

  // 删除当前环境
  const handleDeleteEnvironment = (tipMessage: (code: number) => void) => {
    currentEnvironment = getSession("currentEnvironment", true) as any;
    ElMessageBox.confirm("此操作将永久删除, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const params: RequestParams.deleteSyncConfigList = {
          appId: appDetailMsg.id,
          envId: Number(currentEnvironment.id)
        };
        deleteCurrentConfigEnv<ResponseParams.ResponseDataSuccess>(params).then((res) => {
          tipMessage(res.code);
          context.emit("update:getTabData");
          dialogVisible.value = false;
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
    handleCloseDialog,
    rules,
    handleCreateAppShowDialog,
    dialogVisible,
    dialogParams,
    handleCreateApp,
    formRef,
    handleUpdateApp,
    handleDelete,
    handleDeleteEnvironment
  };
}
