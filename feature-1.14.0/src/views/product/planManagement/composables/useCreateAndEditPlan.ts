import { getRelatedDemand } from "@/api/request-modules/plan";
import { createPlan, updatePlan } from "@/api/request-modules/product";
import { getDelayBug } from "@/api/request-modules/test";
import { RequestParams } from "@/types/request";
import { ResponseParams } from "@/types/response";
import { replaceProductId } from "@/views/iteration/useMixin";
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
  // deliver_time: [{ required: true, message: "请输入预估交付时间", trigger: "blur" }],
  demand_ids: [{ required: true, message: "请选择关联需求", trigger: "blur" }],
  name: [{ required: true, message: "请输入计划名称", trigger: "blur" }],
  version: [{ required: true, message: "请输入计划版号", trigger: "blur" }]
  // product_id: [{ required: true, message: "请选择所属项目", trigger: "change" }]
};
// 可以关联需求列表
const dialogDemandList = ref([]);
// 遗留bug列表
const bugList = ref([]);
// 新增、编辑计划弹框 是否添加需求说明
const noCheck = ref<boolean>(false);
const dialogParams = reactive<RequestParams.CreatePlan & RequestParams.UpdatePlan & { product: Record<string, any> }>({
  id: null,
  // 临时保存
  product: { id: null },
  deliver_time: "",
  demand_ids: [],
  name: "",
  product_id: null,
  version: "",
  demand_docs: [
    {
      name: "",
      size: 0,
      type: 1,
      url: null,
      remark: ""
    }
  ],
  delay_list: []
});
const isShowEditModal = ref(false);
const planListCallBack = reactive<any>({
  cb: undefined
});
export type RuleForm = HTMLElement & {
  resetFields: () => void;
  validate: (valid: any) => void;
  clearValidate: () => void;
};
const ruleFormRef = ref<RuleForm>();
export default function useCreateAndEditPlan(planList?: () => void): { [key: string]: unknown } {
  if (planList) {
    planListCallBack.cb = planList;
  }
  // 编辑弹窗时候获取当前可关联需求
  const getDemandListByProduct = (productId: number, planId: number, isBind: boolean) => {
    getDemandList(productId, planId, isBind);
    // 还要展示当前已经关联的需求，获取详情，详情包含了已经关联的需求，遍历获取id
    if (!planId) return;
    getRelatedDemand<ResponseParams.ResponseDataSuccess>({ plan_id: planId }).then((res) => {
      const ids = [] as Array<number>;
      function deepGetId(node: Array<Record<string, any>>) {
        if (Array.isArray(node)) {
          node.forEach((v) => {
            if (v.is_product === false && !v.child_list) {
              ids.push(v.id);
            }
            if (v.child_list) {
              deepGetId(v.child_list);
            }
          });
        }
      }
      deepGetId(res.data.demand_info);
      dialogParams.demand_ids = ids;
    });
  };
  // 产品列表下拉
  // const handleProductChange = (v: Record<string, any>) => {
  //   // dialogParams.product_id = v.id;
  //   // // 重新获取关联需求
  //   // getDemandListByProduct(v.id, dialogParams.id!, false);
  // };
  // 关联需求事件
  const handleCheckChange = (data: any, status: Record<string, any>) => {
    dialogParams.demand_ids = status.checkedNodes.filter((v: Record<string, unknown>) => v.is_product === false).map((v: Record<string, unknown>) => v.id);
  };
  // 遗留bug事件
  const handleCheckBugLists = (data: any, status: Record<string, any>) => {
    dialogParams.delay_list = status.checkedNodes
      .filter((v: Record<string, unknown>) => v.parentId)
      .map((v: Record<string, unknown>) => {
        return {
          iteration_id: v.parentId,
          bug_id: v.bug_id
        };
      });
  };
  const openDialog = (isEdit: number /**0新增，1编辑 */, detail: Record<string, any>) => {
    noCheck.value = false;
    if (isEdit === 0) {
      ruleFormRef.value?.clearValidate();
      ruleFormRef.value?.resetFields();
      dialogDemandList.value = [];
      dialogParams.id = null;
      dialogParams.version = "";
      dialogParams.name = "";
      dialogParams.product = {};
      dialogParams.product_id = null;
      dialogParams.demand_docs = [
        {
          name: "",
          size: 0,
          type: 1,
          url: null,
          remark: ""
        }
      ];
    } else {
      ruleFormRef.value?.clearValidate();
      setTimeout(() => {
        const copyDetail = JSON.parse(JSON.stringify(detail));
        const pickField = ["name", "version", "deliver_time", "product_id", "demand_ids", "demand_docs"];
        pickField.forEach((field: string) => {
          (dialogParams as { [key: string]: unknown })[field] = copyDetail[field];
        });
        if (!dialogParams.demand_docs) {
          dialogParams.demand_docs = [
            {
              name: "",
              size: 0,
              type: 1,
              url: null,
              remark: ""
            }
          ];
        }
        dialogParams.product = { id: copyDetail.product_id, name: copyDetail.product_name };
        dialogParams.id = copyDetail.plan.id;
        if (dialogParams.version.startsWith(`v`)) {
          dialogParams.version = dialogParams.version.substring(1);
        }
        // 编辑时候要展示所有的可以关联的需求
        getDemandListByProduct(copyDetail.product_id, copyDetail.plan.id, false);
      });
    }
    isShowEditModal.value = true;
    // 获取遗留bug
    const { productId } = replaceProductId();
    // 设置所属项目默认选择项目
    dialogParams.product_id = productId.value;
    isEdit === 0 && getDemandListByProduct(productId.value, dialogParams.id!, false);
    getDelayBug<ResponseParams.ResponseDataSuccess>({
      product_id: productId.value
    }).then((res) => {
      function deepSetId(node: Array<Record<string, any>>, id: number) {
        if (Array.isArray(node)) {
          node.forEach((v) => {
            v.parentId = id;
            if (v.bug) {
              deepSetId(v.bug, id);
            }
          });
        }
      }
      res.data.forEach((v: Record<string, any>) => {
        deepSetId(v.bug, v.iteration_id);
      });
      bugList.value = res.data;
    });
  };

  // 创建计划确定和修改
  const handleCreateOrEditPlan = () => {
    console.log(dialogParams, "dialogParamsdialogParams");
    ruleFormRef.value?.validate(async (valid: boolean) => {
      if (valid) {
        let response: ResponseParams.ResponseDataSuccess;
        const copyDialogParams = JSON.parse(JSON.stringify(dialogParams));
        copyDialogParams.version = `v${copyDialogParams.version}`;
        if (copyDialogParams.demand_docs[0].url === null) {
          copyDialogParams.demand_docs = null;
        } else {
          const filterArr = copyDialogParams.demand_docs.filter((item: Record<string, any>) => item.url);
          copyDialogParams.demand_docs = filterArr.length ? filterArr : null;
        }

        if (copyDialogParams.id && copyDialogParams.id !== 0) {
          response = await updatePlan(copyDialogParams);
        } else {
          response = await createPlan(copyDialogParams);
        }
        console.log(response);
        // tipMessage && tipMessage(response.code);
        isShowEditModal.value = false;
        // 刷新列表
        planListCallBack.cb && planListCallBack.cb();
      } else {
        console.log("error submit!!");
        return false;
      }
    });
  };
  //#region 切换需求说明
  const changeDemandDoc = (type: number) => {
    dialogParams.demand_docs = [
      {
        name: "",
        size: 0,
        type: type,
        url: null,
        remark: ""
      }
    ];
  };
  //#endregion
  return {
    ruleFormRef,
    rules,
    handleCheckChange,
    handleCheckBugLists,
    // handleProductChange,
    dialogDemandList,
    getDemandList,
    handleCreateOrEditPlan,
    dialogParams,
    isShowEditModal,
    openDialog,
    bugList,
    changeDemandDoc,
    noCheck
  };
}
