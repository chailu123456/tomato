import { getDemandList } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: RequestParams.GetDemandList): Promise<any> {
  return await getDemandList<ResponseParams.DemandList>({ ...params, pageIndex, pageSize });
}
