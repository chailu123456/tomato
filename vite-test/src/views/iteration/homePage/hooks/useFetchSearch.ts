import { getIterationDetail } from "@/api/request-modules/iteration";
import { reactive, ref } from "vue";
interface ProductPlanForm {
  name: string;
  link: string;
  isEdit: boolean;
  id: number;
}

const productPlanForm = reactive<Array<ProductPlanForm>>([
  {
    name: "ui设计图",
    link: "123",
    isEdit: false,
    id: 3
  },
  {
    name: "详细设计",
    link: "1232",
    isEdit: false,
    id: 4
  },
  {
    name: "测试用例",
    link: "1232987",
    isEdit: false,
    id: 5
  }
]);

// item: any, index: number, tipMessage: any
const changeIsEditInput = () => {
  // if (productPlanForm[index].isEdit) {
  //   // 点击确定
  //   const params: RequestParams.UpdateDoc = {
  //     quote_id: Number(router.currentRoute.value.query.id),
  //     type: item.id,
  //     url: item.link
  //   };
  //   updateDoc<ResponseParams.ResponseDataSuccess>(params).then((res) => {
  //     tipMessage(res.code);
  //   });
  // }
  // productPlanForm[index].isEdit = !productPlanForm[index].isEdit;
};

const resultObj = reactive({
  progressData: [] as Array<string>,
  stage: 0,
  time_percent: 0,
  complete_percent: 0,
  user_list: [],
  app_list: [],
  prototype_doc: "",
  demand_doc: ""
});
const rawDataResponse = ref({});
export default function useFetchSearch(id: number): { [key: string]: any } {
  getIterationDetail<ResponseData<Record<string, any>>>(id).then((res) => {
    const { stage, dev_time, union_time, test_time, release_time, time_percent, complete_percent, doc, user_list, app_list, plan } = res.data as any;
    resultObj.stage = stage;
    resultObj.progressData = [plan.create_time, dev_time, union_time, test_time, release_time];
    resultObj.time_percent = time_percent;
    resultObj.complete_percent = complete_percent;
    resultObj.user_list = user_list;
    resultObj.app_list = app_list;
    resultObj.prototype_doc = plan.prototype_doc;
    resultObj.demand_doc = plan.demand_doc;
    productPlanForm[0].link = doc.ui_design;
    productPlanForm[1].link = doc.detail_design;
    productPlanForm[2].link = doc.test_case;
    rawDataResponse.value = { ...res.data };
  });
  return { resultObj, productPlanForm, changeIsEditInput, rawDataResponse };
}
