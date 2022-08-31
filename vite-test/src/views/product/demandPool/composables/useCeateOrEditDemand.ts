import { ref, getCurrentInstance, reactive } from "vue";
import { createDemand, putDemand } from "@/api/request-modules/product";
const rules = {
  product_id: [
    {
      required: true,
      message: "请选择产品名称",
      trigger: "change"
    }
  ],
  name: [{ required: true, message: "请输入需求点", trigger: "blur" }]
};
type DialogParams = {
  name: string;
  product_id: string;
  child_list: Array<{ name: string; id: number }>;
  id: number;
  [key: string]: unknown;
};
export default function useCeateOrEditDemand(): any {
  const dialogTitle = ref<string>("维护需求");
  const internalInstance = getCurrentInstance();
  const global: any = internalInstance?.appContext.config.globalProperties;
  const dialogVisible = ref<boolean>(false);
  const dialogRef = ref<{ validate: (callback: (valid: boolean) => void) => void; clearValidate: () => void; resetFields: () => void }>();
  const dialogParams = reactive<DialogParams>({
    name: "",
    product_id: "",
    child_list: [],
    id: 0
  });
  // 参数挑选
  const pickParams = (...args: Array<string>) => {
    const res: any = {};
    args.map((arg) => {
      res[arg] = dialogParams[arg];
    });
    return res;
  };
  // 创建
  const confirmChange = async (cb: () => void) => {
    dialogRef.value!.validate(async (valid: boolean) => {
      let response: ResponseData;
      if (valid) {
        if (dialogParams.id) {
          response = await putDemand(pickParams("name", "id", "product_id", "child_list"));
        } else {
          response = await createDemand(dialogParams);
        }
        if (response.code === 200) {
          global.$message({
            message: "操作成功",
            type: "success"
          });
        }
        cb && cb();
        dialogVisible.value = false;
      } else {
        return false;
      }
    });
  };
  const resetDialogParams = () => {
    dialogRef.value?.clearValidate();
    dialogRef.value?.resetFields();
    dialogParams.id = 0;
    dialogParams.product_id = "";
  };
  const handleShowDialog = (params: typeof dialogParams & { id: number }) => {
    const { product_id, name, id, child_list } = JSON.parse(JSON.stringify(params));
    dialogTitle.value = product_id ? "维护需求" : "新增需求";
    !product_id && resetDialogParams();
    if (product_id) {
      setTimeout(() => {
        dialogParams.name = name;
        dialogParams.product_id = product_id;
        dialogParams.id = id;
        dialogParams.child_list = child_list;
      });
    }
    dialogVisible.value = true;
  };
  // 弹窗表单创建子需求
  const handleCreateChildDemand = () => {
    dialogParams.child_list.push({
      name: "",
      id: 0
    });
  };
  //
  const handleDelateChildDemand = (index: number) => {
    dialogParams.child_list.splice(index, 1);
  };
  return {
    dialogVisible,
    handleShowDialog,
    dialogTitle,
    dialogParams,
    rules,
    confirmChange,
    dialogRef,
    handleCreateChildDemand,
    handleDelateChildDemand
  };
}
