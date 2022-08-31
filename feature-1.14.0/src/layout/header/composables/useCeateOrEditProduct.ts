import { createProduct, selectProductList, updateProduct } from "@/api/request-modules/product";
import router from "@/router";
import { ResponseParams } from "@/types/response";
import useMixin, { replaceProductId } from "@/views/iteration/useMixin";
import { reactive, ref, getCurrentInstance, nextTick } from "vue";
import { setSession } from "@/utils/sesssion";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { checkProductPermission } from "@/api/request-modules/iteration";
type Response = {
  code: number;
  data: Record<string, any>;
  message: string;
};
const checkAddress = (rule: Array<unknown>, value: string, callback: (...args: Array<unknown>) => void): void => {
  const reg = /https:\/\/qyapi.weixin.qq.com\/cgi-bin\/webhook\/send\?key=(\w|\d|-){1,}/g;

  if (!value) {
    callback();
    return;
  }
  if (!reg.test(value)) {
    callback(new Error("格式错误，正确格式为 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key="));
  } else {
    callback();
  }
};
export const rules = {
  name: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
  ],
  remark: [
    { required: false, message: "请输入产品描述", trigger: "blur" },
    { min: 0, max: 50, message: "长度在 0 到 50 个字符", trigger: "blur" }
  ],
  notify_url: [
    {
      validator: checkAddress,
      trigger: "blur"
    }
  ]
};
const { demandList, searchParams } = useMixin(true);
export default function useCeateOrEditProduct(): any {
  const internalInstance = getCurrentInstance();
  const global: any = internalInstance?.appContext.config.globalProperties;
  const productRef = ref<(HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void }) | null>(null);
  const dialogVisible = ref<boolean>(false);
  const dialogVisibleBtn = ref<boolean>(false);
  const dialogParams = reactive({
    // 项目名称
    name: "",
    // 备注
    remark: "",
    // 编辑的id，新增为0
    id: 0,
    // 项目代号
    code: null,
    // 提醒地址
    notify_url: "",
    // 是否需要审批
    is_approval: 0,
    // 是否需要邮件通知
    is_report: 0
  });
  const resetDialogParams = (ref: HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void }) => {
    ref?.resetFields();
    dialogParams.id = 0;
  };

  const handleShowDialog = () => {
    dialogVisible.value = true;
  };
  // 弹窗
  const confirmSave = (
    ref: HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void },
    formData?: any,
    callback?: () => void
  ) => {
    if (ref) {
      productRef.value = ref as any;
    }

    if (formData) {
      Object.keys(dialogParams).forEach((key) => {
        // @ts-ignore
        dialogParams[key] = formData[key];
      });
    }

    let response: Response;
    productRef.value?.validate(async (valid: boolean) => {
      if (valid) {
        const requestFunc = formData ? updateProduct : createProduct;
        response = await requestFunc([dialogParams]);
        if (response.code === 200) {
          global.$message({
            message: "操作成功",
            type: "success"
          });
          demandList.value = [];
          typeof callback === "function" && callback();
          dialogVisible.value = false;
          dialogVisibleBtn.value = true;
        } else {
          return;
        }

        //重新获取项目列表
        const { productLists, productId } = replaceProductId();
        selectProductList<ResponseParams.ResponseDataSuccess>().then((res: Record<string, any>) => {
          productLists.value = res.data;
          if (!formData) {
            productId.value = productLists.value[0] ? productLists.value[0].id : [];
            setSession("productId", productId.value);
            setSession("productInfo", typeof productLists.value[0] !== "undefined" ? JSON.stringify(productLists.value[0]) : "");
            router.replace({
              query: Object.assign(
                { ...router.currentRoute.value.query },
                {
                  productId: productId.value
                }
              )
            });
          } else {
            const curItem = productLists.value.find((item: any) => item.id === productId.value);
            if (curItem) {
              setSession("productInfo", typeof curItem !== "undefined" ? JSON.stringify(curItem) : "");
            }
          }
          const cacheObj = [] as Array<any>;
          productLists.value.forEach((v: Record<string, any>) => {
            cacheObj.push({
              projectId: v.id,
              iterationId: null,
              yapi_default_iteration_id: v.yapi_default_iteration_id
            });
          });
          setSession("cacheProject", JSON.stringify(cacheObj));

          const getDemandList = useGetDemandList();
          demandList.value = [];
          getDemandList(productId.value).then((res) => {
            demandList.value = res;
            searchParams.demand = res.length ? res[0].id : null;
          });
          nextTick(() => {
            resetDialogParams(ref);
          });
        });
      }
    });
  };
  const ConfirmGo = (val: string) => {
    router.push({ name: val });
    dialogVisibleBtn.value = false;
  };

  // 获取项目权限
  const getProductPermission = async (productId: string | number) => {
    const { data } = await checkProductPermission(productId);

    return data.del_permission;
  };
  return {
    getProductPermission,
    resetDialogParams,
    handleShowDialog,
    dialogParams,
    confirmSave,
    dialogVisible,
    ConfirmGo,
    dialogVisibleBtn
  };
}
