import { createAndUpdateEnvirmentList, deleteEnvirmentList } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import { Ref, ref, nextTick } from "vue";
import { RequestParams } from "@/types/request";
import { useStore } from "@/store/index";
import { ElMessageBox, ElMessage } from "element-plus";

export default function useCreateAndUpdate(
  getData: (...args: any) => void,
  pageTableRef: Ref<HTMLElement & { getCurrentPage: () => void }>,
  dialogParams: RequestParams.CreateAndUpdateEnvList
): Record<string, any> {
  const dialogVisible = ref(false);
  // 环境代码验证(只支持输入英文)
  const validate = (rule: any, value: string, callback: any) => {
    if (value === "") {
      callback(new Error("请输入环境代码"));
    } else {
      if (value.length > 10) callback(new Error("请输入1-10个字母，数字，中划线字符"));
      const reg = /^[a-zA-Z\d-]+$/;
      if (reg.test(value)) callback();
      else callback(new Error("请输入1-10个字母，数字，中划线字符"));
    }
  };
  const rules = {
    name: [
      { required: true, message: "请输入环境名称", trigger: "blur" },
      { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
    ],
    code: [{ required: true, validator: validate, trigger: "blur" }],
    remark: [
      { message: "请输入简要描述", trigger: "blur" },
      { min: 0, max: 50, message: "长度在 0 到 50 个字符", trigger: "blur" }
    ]
  };
  const formRef = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; resetFields: () => void }>();
  const handleCreateAppShowDialog = () => {
    dialogVisible.value = true;
  };
  const handleCloseDialog = () => {
    formRef.value!.resetFields();
    dialogParams.id = 0;
    dialogParams.name = "";
    dialogParams.code = "";
    dialogParams.remark = "";
    dialogParams.is_sys = false;
    dialogParams.sync_env_id = "";

    dialogVisible.value = false;
  };

  const store = useStore();

  const handleCreateApp = (tipMessage: (code: number) => void) => {
    formRef.value &&
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          createAndUpdateEnvirmentList<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
            tipMessage(res.code);
            getData(pageTableRef.value.getCurrentPage());
            if (!dialogParams.id) store.dispatch("GETENV_LIST");
            dialogVisible.value = false;
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
  };
  const handleUpdateApp = (isEdit: number, row: RequestParams.CreateAndUpdateEnvList) => {
    if (isEdit) {
      nextTick(() => {
        dialogParams.id = row.id;
        dialogParams.name = row.name;
        dialogParams.code = row.code;
        dialogParams.remark = row.remark;
        dialogParams.is_sys = row.is_sys;
      });
    } else {
      dialogParams.id = 0;
      dialogParams.name = "";
      dialogParams.code = "";
      dialogParams.remark = "";
      dialogParams.is_sys = false;
      dialogParams.sync_env_id = "";
    }
    dialogVisible.value = true;
  };

  const handleDelete = (row: RequestParams.CreateAndUpdateEnvList, tipMessage: (code: number) => void) => {
    ElMessageBox.confirm("此操作将永久删除该环境，应用和全局变量中已关联的此环境也会同步删除，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const params: RequestParams.DeleteEnvirmentList = {
          id: row.id
        };
        deleteEnvirmentList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
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
    validate,
    handleCreateApp,
    formRef,
    handleUpdateApp,
    handleDelete
  };
}
