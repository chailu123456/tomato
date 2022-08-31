import { getPlan } from "@/api/request-modules/product";
import { RequestParams } from "@/types/request";
// import { ResponseParams } from "@/types/response";
// import { selectManagerList } from "@/api/request-modules/product";
// import { getSession } from "@/utils/sesssion";
// 获取创建人列表
// const handleManagerList = () =>
//   selectManagerList<ResponseParams.ResponseDataSuccess>({ product_id: Number(getSession("productId")) }).then((res) => {
//     createPerson.value = res.data;
//   });
// handleManagerList();

export default function useFetchRequest(): any {
  // 获取计划管理列表
  const getPlanList = async (params: RequestParams.GetPlan) => {
    return await getPlan(params);
  };

  return {
    getPlanList
  };
}
