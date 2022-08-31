// import { createProduct, selectProductList, updateProduct, updateStatus } from "@/api/request-modules/product";
// import { ResponseParams } from "@/types/response";
// import { replaceProductId } from "@/views/iteration/useMixin";
// import { reactive, ref, getCurrentInstance, nextTick } from "vue";
// type Response = {
//   code: number;
//   data: Record<string, any>;
//   message: string;
// };
// const checkAddress = (rule: Array<unknown>, value: string, callback: (...args: Array<unknown>) => void): void => {
//   const reg = /https:\/\/qyapi.weixin.qq.com\/cgi-bin\/webhook\/send\?key=(\w|\d|-){1,}/g;

//   if (!value) {
//     callback();
//     return;
//   }
//   if (!reg.test(value)) {
//     callback(new Error("格式错误，正确格式为 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key="));
//   } else {
//     callback();
//   }
// };
// export const rules = {
//   name: [
//     { required: true, message: "请输入产品名称", trigger: "blur" },
//     { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
//   ],
//   remark: [
//     { required: false, message: "请输入产品描述", trigger: "blur" },
//     { min: 0, max: 50, message: "长度在 0 到 50 个字符", trigger: "blur" }
//   ],
//   notify_url: [
//     {
//       validator: checkAddress,
//       trigger: "blur"
//     }
//   ]
// };

// export default function useCeateOrEditProduct(): any {
//   const internalInstance = getCurrentInstance();
//   const global: any = internalInstance?.appContext.config.globalProperties;
//   const formRef = ref<(HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void }) | null>(null);
//   const dialogVisible = ref<boolean>(false);
//   const dialogTitle = ref<string>("");
//   const dialogParams = reactive({
//     // 项目名称
//     name: "",
//     // 备注
//     remark: "",
//     // 编辑的id，新增为0
//     id: 0,
//     // 项目代号
//     code: null,
//     // 提醒地址
//     notify_url: ""
//   });
//   const resetDialogParams = () => {
//     formRef.value && formRef.value?.resetFields();
//     dialogParams.id = 0;
//   };

//   const handleShowDialog = (params: typeof dialogParams) => {
//     dialogTitle.value = params && params.id ? "编辑" : "新增";
//     !params && resetDialogParams();
//     if (params && params.id) {
//       formRef.value?.clearValidate();
//       nextTick(() => {
//         dialogParams.name = params.name;
//         dialogParams.remark = params.remark;
//         dialogParams.id = params.id;
//         dialogParams.notify_url = params.notify_url;
//         dialogParams.code = params.code;
//       });
//     }
//     dialogVisible.value = true;
//   };
//   // 弹窗
//   const confirmSave = (callback: () => void) => {
//     let response: Response;
//     formRef.value!.validate(async (valid: boolean) => {
//       if (valid) {
//         if (!dialogParams.id) {
//           response = await createProduct([dialogParams]);
//         } else {
//           // 更新
//           response = await updateProduct([dialogParams]);
//         }
//         if (response.code === 200) {
//           global.$message({
//             message: "操作成功",
//             type: "success"
//           });
//           callback();
//           dialogVisible.value = false;
//         }
//       }
//       // // 重新获取项目列表
//       const { productLists } = replaceProductId();
//       selectProductList<ResponseParams.ResponseDataSuccess>().then((res: Record<string, any>) => {
//         productLists.value = res.data;
//       });
//     });
//   };
//   // 更新状态
//   const statusChange = (params: typeof dialogParams & { status: number }) => {
//     return new Promise((resolve) => {
//       const response = updateStatus([
//         {
//           id: params.id,
//           status: params.status == 0 ? 1 : 0
//         }
//       ]);
//       resolve(response);
//     });
//   };
//   return { formRef, handleShowDialog, dialogTitle, dialogParams, confirmSave, dialogVisible, statusChange };
// }
