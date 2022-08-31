import { createAndUpdateAppList } from "@/api/request-modules/setting";
import { ResponseParams } from "@/types/response";
import { reactive, Ref, ref, watch } from "vue";
import { RequestParams } from "@/types/request";
const dialogVisible = ref(false);

const rules = {
  name: [
    { required: true, message: "请输入项目名称", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
  ],
  git_url: [{ required: true, message: "请输入源码地址", trigger: "blur" }],
  remark: [{ required: true, message: "请输入简要描述", trigger: "blur" }],
  run_env: [{ required: true, message: "请选择寄宿环境", trigger: "change" }],
  code_language: [{ required: true, message: "请选择开发语言", trigger: "change" }]
};
const dialogParams = reactive<RequestParams.CreateAndUpdateAppList>({
  id: 0,
  name: "",
  git_url: "",
  remark: "",
  run_env: null,
  code_language: ""
});
export default function useCreateAndUpdate(
  getData: (...args: any) => void,
  pageTableRef: Ref<HTMLElement & { getCurrentPage: () => void }>
): Record<string, any> {
  const formRef = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; resetFields: () => void; clearValidate: () => void }>();
  const handleCreateAppShowDialog = () => {
    formRef.value?.clearValidate();
    formRef.value?.resetFields();
    dialogParams.id = 0;
    dialogVisible.value = true;
  };
  watch(
    () => dialogVisible.value,
    (newValue) => {
      if (!newValue) {
        formRef.value?.clearValidate();
        formRef.value?.resetFields();
        dialogParams.id = 0;
      }
    }
  );
  const handleCreateApp = (tipMessage: (code: number) => void) => {
    formRef.value &&
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          createAndUpdateAppList<ResponseParams.ResponseDataSuccess>(dialogParams).then((res) => {
            tipMessage(res.code);
            getData(pageTableRef.value.getCurrentPage());
            dialogVisible.value = false;
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
  };
  const handleUpdateApp = (row: RequestParams.CreateAndUpdateAppList) => {
    formRef.value?.clearValidate();
    setTimeout(() => {
      const pickField = ["id", "name", "git_url", "remark", "code_language"];
      pickField.forEach((field: string) => {
        (dialogParams as { [key: string]: any })[field] = (row as { [key: string]: any })[field];
      });
      dialogParams.run_env = row.run_env === 0 ? null : row.run_env;
    });
    dialogVisible.value = true;
  };
  return {
    rules,
    handleCreateAppShowDialog,
    dialogVisible,
    dialogParams,
    handleCreateApp,
    formRef,
    handleUpdateApp
  };
}
