import { ResponseParams } from "@/types/response";
import { reactive, ref } from "vue";
import useGetRelevanceDemandList from "./useGetRelevanceDemandList";
// 产品名称
const productName = ref();
const stage = ref();
const dataTime = ref();
const demandLists = ref([]);
export const planDetail = reactive({
  // 需求文档
  demand_doc: null,
  // 需求ID
  demand_ids: [],
  // 计划ID
  id: null,
  manager_list: {
    backend_manager: {},
    frontend_manager: {},
    iteration_manager: {},
    test_manager: {}
  },
  // 计划简称
  name: "",
  // 产品ID
  product_id: 0,
  // 原型文档
  prototype_doc: "",
  // 备注
  remark: "",
  // 计划版本
  version: ""
});
// 保存变量，编辑弹窗时候展示
const dialogEditData = reactive({
  product: {},
  // 产品ID
  product_id: 0,
  // 产品名称
  product_name: "",
  // 关联需求
  demand_ids: [],
  // 计划版本
  version: "",
  // 预估交付
  deliver_time: "",
  plan_name: "",
  // 当前关联的需求
  demandList: [],
  plan_id: 0,
  prototype_doc: "",
  remark: "",
  demand_doc: ""
});
const { demandList } = useGetRelevanceDemandList();
export const setPlanDetail = (rawDataDetail: Record<string, any>): void => {
  const { product, plan, iteration, demand_ids } = rawDataDetail.rowData;
  dialogEditData.product = product;
  dialogEditData.product_name = product.name;
  dialogEditData.deliver_time = plan.deliver_time;
  planDetail.demand_doc = dialogEditData.demand_doc = plan.demand_doc;
  planDetail.demand_ids = dialogEditData.demand_ids = demand_ids;
  planDetail.id = dialogEditData.plan_id = plan.id;
  planDetail.name = dialogEditData.plan_name = plan.name;
  planDetail.product_id = dialogEditData.product_id = product.id;
  planDetail.prototype_doc = dialogEditData.prototype_doc = plan.prototype_doc;
  planDetail.remark = dialogEditData.remark = plan.remark;
  planDetail.version = dialogEditData.version = plan.version;
  productName.value = product.name;
  if (iteration) {
    stage.value = iteration.stage;
    planDetail.manager_list.backend_manager = iteration.backend_manager;
    planDetail.manager_list.frontend_manager = iteration.frontend_manager;
    planDetail.manager_list.iteration_manager = iteration.iteration_manager;
    planDetail.manager_list.test_manager = iteration.test_manager;
    dataTime.value = [plan.create_time, iteration.dev_time, iteration.union_time, iteration.test_time, iteration.release_time];
  } else {
    dataTime.value = [plan.create_time];
  }
  demandList(product.id, plan.id, true).then((res: ResponseParams.ResponseDataSuccess) => {
    demandLists.value = res.data;
    dialogEditData.demandList = res.data;
  });
};
export default function useShowPlanDetail(): { [key: string]: unknown } {
  return {
    dialogEditData,
    stage,
    demandLists,
    dataTime,
    planDetail,
    productName,
    setPlanDetail
  };
}
