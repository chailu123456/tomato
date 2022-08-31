import { createPlan, updatePlan } from "@/api/request-modules/product";
import { RequestParams } from "@/types/request";
import { ResponseParams } from "@/types/response";
import { reactive, ref } from "vue";
import useGetRelevanceDemandList from "./useGetRelevanceDemandList";

const { demandList } = useGetRelevanceDemandList();
const getDemandList = (product_id?: number, plan_id?: number, is_bind?: boolean) => {
  demandList(product_id, plan_id, is_bind).then((res: ResponseParams.ResponseDataSuccess) => {
    dialogDemandList.value = res.data;
  });
};
// getDemandList();

const rules = {
  deliver_time: [{ required: true, message: "请输入预估交付时间", trigger: "blur" }],
  demand_ids: [{ required: true, message: "请选择关联需求", trigger: "blur" }],
  name: [{ required: true, message: "请输入计划简称", trigger: "blur" }],
  version: [{ required: true, message: "请输入计划版本", trigger: "blur" }],
  product: [{ required: true, message: "请选择产品", trigger: "change" }]
};

const dialogDemandList = ref([]);
const dialogParams = reactive<
  (RequestParams.CreatePlan & { product: Record<string, any>; id: number | null }) &
    (RequestParams.UpdatePlan & { product: Record<string, any>; id: number | null; manager_list?: Record<string, any> })
>({
  id: null,
  product: { id: null },
  deliver_time: "",
  demand_ids: [],
  name: "",
  product_id: null,
  version: "",
  prototype_doc: "",
  remark: "",
  demand_doc: ""
});
const isShowEditModal = ref(false);
const planListCallBack = reactive<any>({
  cb: undefined
});
export type RuleForm = HTMLElement & { resetFields: () => void; validate: (valid: any) => void; clearValidate: () => void };
const ruleFormRef = ref<RuleForm>();
export default function useCreateAndEditPlan(planList?: () => void): { [key: string]: unknown } {
  if (planList) {
    planListCallBack.cb = planList;
  }

  // 产品列表下拉
  const handleProductChange = (v: Record<string, any>) => {
    dialogParams.product_id = v.id;
    getDemandList(v.id, dialogParams.id!, false);
  };
  const handleCheckChange = (data: any, status: Record<string, any>) => {
    dialogParams.demand_ids = status.checkedNodes.filter((v: Record<string, unknown>) => v.is_product === false).map((v: Record<string, unknown>) => v.id);
  };
  const openDialog = (isEdit: number /**0新增，1编辑 */, detail: Record<string, any>) => {
    if (isEdit === 0) {
      ruleFormRef.value?.clearValidate();
      ruleFormRef.value?.resetFields();
      dialogDemandList.value = [];
      dialogParams.id = null;
      dialogParams.product_id = null;
    } else {
      setTimeout(() => {
        const pickField = ["product", "product_id", "deliver_time", "demand_ids", "plan_name", "version", "plan_id"];
        pickField.forEach((field: string) => {
          (dialogParams as { [key: string]: unknown })[field] = detail[field];
        });
        dialogParams.name = detail.plan_name;
        dialogParams.id = detail.plan_id;
        console.log(dialogParams, "dialogParamsdialogParams");
        // 编辑时候要展示所有的可以关联的需求
        getDemandList(detail.product_id, detail.plan_id, false);
      });
    }
    isShowEditModal.value = true;
  };
  // 创建计划确定和修改
  const handleCreateOrEditPlan = (event: Event, tipMessage?: (...args: Array<any>) => void, rowData?: Record<string, any>) => {
    if (rowData) {
      // 右侧直接修改
      type Params = Omit<typeof dialogParams, "deliver_time" | "product">;
      const params: Params = {
        demand_doc: "",
        demand_ids: [],
        id: 0,
        name: "",
        product_id: null,
        prototype_doc: "",
        remark: "",
        version: ""
      };
      const pickField = ["demand_doc", "demand_ids", "id", "name", "product_id", "prototype_doc", "remark", "version"];
      pickField.forEach((field: string) => {
        (params as { [key: string]: unknown })[field] = rowData[field];
      });
      (async () => {
        const response: ResponseParams.ResponseDataSuccess = await updatePlan(params);
        tipMessage && tipMessage(response.code);
        // 刷新列表
        planListCallBack.cb && planListCallBack.cb();
      })();
    } else {
      ruleFormRef.value?.validate(async (valid: boolean) => {
        if (valid) {
          let response: ResponseParams.ResponseDataSuccess;
          const copyDialogParams = JSON.parse(JSON.stringify(dialogParams));
          copyDialogParams.demand_ids = Array.from(new Set(copyDialogParams.demand_ids));

          Reflect.deleteProperty(copyDialogParams, "product");
          if ((copyDialogParams.id && copyDialogParams.id !== 0) || rowData) {
            // 更新
            response = await updatePlan(copyDialogParams);
          } else {
            ["prototype_doc", "remark", "demand_doc"].forEach((v) => {
              Reflect.deleteProperty(copyDialogParams, v);
            });

            response = await createPlan(copyDialogParams);
          }
          tipMessage && tipMessage(response.code);
          isShowEditModal.value = false;
          // 刷新列表
          planListCallBack.cb && planListCallBack.cb();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  };
  return {
    ruleFormRef,
    rules,
    handleCheckChange,
    handleProductChange,
    dialogDemandList,
    getDemandList,
    handleCreateOrEditPlan,
    dialogParams,
    isShowEditModal,
    openDialog
  };
}
