import { getGlobalList } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: RequestParams.GetGlobalList): Promise<any> {
  return await getGlobalList<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
