import { getProductDynamic } from "@/api/request-modules/workbench";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: any): Promise<ResponseParams.ResponseDataSuccess> {
  return await getProductDynamic<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
