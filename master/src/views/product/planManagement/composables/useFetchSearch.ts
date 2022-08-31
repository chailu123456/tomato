import { getPlanLists } from "@/api/request-modules/plan";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: any): Promise<ResponseParams.ResponseDataSuccess> {
  return await getPlanLists<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
