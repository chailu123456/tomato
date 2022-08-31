import { memberList } from "@/api/request-modules/product";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: any): Promise<ResponseParams.ResponseDataSuccess> {
  return await memberList<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
