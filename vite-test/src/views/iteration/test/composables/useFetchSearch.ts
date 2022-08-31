import { getBugList } from "@/api/request-modules/test";
import { ResponseParams } from "@/types/response";
/* eslint-disable */
export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: any): Promise<any> {
  return await getBugList<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
