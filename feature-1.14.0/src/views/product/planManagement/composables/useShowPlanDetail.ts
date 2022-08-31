import { getRelatedDemand } from "@/api/request-modules/plan";
import { ResponseParams } from "@/types/response";
import { reactive, ref } from "vue";
// 产品名称
const demandLists = ref([]);
// 查看需求的弹窗
export const planDetail = reactive({
  delay_bug: [],
  demand_info: []
});
// 临时保存的，当前点击查看需求的数据
const tempData = ref();
export const setPlanDetail = (rawDataDetail: Record<string, any>): void => {
  tempData.value = rawDataDetail;
  // 获取详情
  getRelatedDemand<ResponseParams.ResponseDataSuccess>({ plan_id: rawDataDetail.plan.id }).then((res) => {
    planDetail.delay_bug = (res.data as Record<string, any>).delay_bug;
    planDetail.demand_info = (res.data as Record<string, any>).demand_info;
  });
};
export default function useShowPlanDetail(): { [key: string]: unknown } {
  return {
    tempData,
    demandLists,
    planDetail,
    setPlanDetail
  };
}
