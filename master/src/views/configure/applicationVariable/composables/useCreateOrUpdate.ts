import { createAndUpdateAppList, deleteCurrentAppVar } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import { Ref, ref } from "vue";
import { RequestParams } from "@/types/request";
import { ElMessageBox, ElMessage } from "element-plus";
const dialogVisible = ref(false);

const rules = {
  name: [
    { required: true, message: "请输入应用名称", trigger: "blur" },
    { min: 3, max: 20, message: "请输入 3 到 20 个字符", trigger: "blur" }
  ],
  code_language: [{ required: true, message: "请选择开发语言", trigger: "change" }],
  run_env: [{ required: true, message: "请选择寄宿环境", trigger: "change" }],
  git_url: [{ required: true, message: "请输入源码地址", trigger: "blur" }],
  remark: [{ required: true, min: 5, max: 50, message: "请输入5-50个简要描述", trigger: "blur" }]
};
export default function useCreateAndUpdate(
  getData: (...args: any) => void,
  pageTableRef: Ref<HTMLElement & { getCurrentPage: () => void }>,
  dialogParams: RequestParams.CreateAndUpdateAppList
): Record<string, any> {
  const formRefs = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; clearValidate: () => void; resetFields: () => void }>();
  // 关闭遮罩层
  const handleCloseDialog = () => {
    formRefs.value!.resetFields();
    formRefs.value!.clearValidate();
    dialogParams.id = 0;
    dialogVisible.value = false;
  };
  // 保存
  const handleCreateApp = (tipMessage: (code: number) => void) => {
    formRefs.value &&
      formRefs.value.validate((valid: boolean) => {
        if (valid) {
          createAndUpdateAppList<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
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
  // 编辑--赋值
  const handleUpdateApp = (isEdit: number, row: RequestParams.CreateAndUpdateAppList) => {
    if (isEdit) {
      setTimeout(() => {
        dialogParams.id = row.id;
        dialogParams.name = row.name;
        dialogParams.git_url = row.git_url;
        dialogParams.remark = row.remark;
        dialogParams.run_env = row.run_env === 0 ? null : row.run_env;
        dialogParams.code_language = row.code_language;
      }, 0);
    } else {
      formRefs.value?.clearValidate();
      formRefs.value?.resetFields();
      dialogParams.id = 0;
    }

    dialogVisible.value = true;
  };

  const handleDelete = (row: RequestParams.CreateAndUpdateAppList) => {
    ElMessageBox.confirm("此操作将永久删除, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        const params: RequestParams.DeleteCurrentApp = {
          id: row.id
        };
        deleteCurrentAppVar<ResponseParams.ResponsePermissionSuccess>(params).then(() => {
          ElMessage({
            type: "success",
            message: "删除成功!"
          });
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
    dialogVisible,
    dialogParams,
    handleCreateApp,
    formRefs,
    handleUpdateApp,
    handleDelete
  };
}
