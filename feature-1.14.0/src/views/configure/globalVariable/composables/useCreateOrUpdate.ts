import { createOrAddGlobalList, deleteGlobalVar } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import { Ref, ref, nextTick } from "vue";
import { RequestParams } from "@/types/request";
import { ElMessageBox, ElMessage } from "element-plus";
const dialogVisible = ref(false);
const validatePass = (rule: any, value: string, callback: any) => {
  if (value.length >= 2 && value.length <= 60) {
    const reg = /[^,.a-z0-9A-Z_-]/;
    if (reg.test(value)) {
      callback(new Error("请输入2-60个正确格式键值"));
    } else {
      callback();
    }
  } else {
    callback(new Error("请输入2-60个正确格式键值"));
  }
};
const rules = {
  key: [
    { required: true, validator: validatePass, trigger: "blur" },
    { min: 2, max: 60, message: "长度在 2 到 60 个字符", trigger: "blur" }
  ],
  remark: [{ required: true, message: "请输入5-50字简要描述", trigger: "blur", min: 5, max: 50 }]
};

export default function useCreateAndUpdate(
  getData: (...args: any) => void,
  pageTableRef: Ref<HTMLElement & { getCurrentPage: () => void }>,
  dialogParams: RequestParams.CreateAndUpdateGlobalList
): Record<string, any> {
  const handleCreateAppShowDialog = () => {
    dialogVisible.value = true;
  };

  const formRef = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; resetFields: () => void }>();
  const handleCloseDialog = () => {
    formRef.value!.resetFields();
    dialogParams.id = 0;
    dialogParams.remark = "";
    dialogParams.key = "";

    dialogVisible.value = false;
  };
  const handleCreateApp = (tipMessage: (code: number) => void) => {
    formRef.value &&
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          createOrAddGlobalList<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
            tipMessage(res.code);
            getData(pageTableRef.value.getCurrentPage());
            handleCloseDialog();
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
  };
  const handleUpdateApp = (isEdit: number, row: RequestParams.CreateAndUpdateGlobalList) => {
    if (isEdit) {
      nextTick(() => {
        dialogParams.id = row.id;
        dialogParams.remark = row.remark;
        dialogParams.key = row.key;
      });
    } else {
      dialogParams.id = 0;
      dialogParams.remark = "";
      dialogParams.key = "";
    }

    dialogVisible.value = true;
  };

  const handleDelete = (row: RequestParams.CreateAndUpdateGlobalList, tipMessage: (code: number) => void) => {
    ElMessageBox.confirm("此操作将永久删除，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const params: RequestParams.DeleteGlobalList = {
          globalKey: row.key
        };
        deleteGlobalVar<ResponseParams.ResponseDataSuccess>(params).then((res) => {
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
  return {
    handleCloseDialog,
    rules,
    handleCreateAppShowDialog,
    dialogVisible,
    dialogParams,
    handleCreateApp,
    formRef,
    handleUpdateApp,
    handleDelete
  };
}
