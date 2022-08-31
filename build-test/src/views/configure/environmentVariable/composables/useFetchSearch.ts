import { getEnvirmentList } from "@/api/request-modules/configure";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: Record<"name", string>): Promise<ResponseParams.ResponseDataSuccess> {
  return await getEnvirmentList<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
