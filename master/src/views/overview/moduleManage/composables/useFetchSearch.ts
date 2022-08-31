import { settingModuleDemand } from "@/api/request-modules/product";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: any): Promise<ResponseParams.ResponseDataSuccess> {
  return await settingModuleDemand<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
