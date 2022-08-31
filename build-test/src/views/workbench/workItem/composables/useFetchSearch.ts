import { getWorkTeam } from "@/api/request-modules/workbench";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: any): Promise<ResponseParams.ResponseDataSuccess> {
  return await getWorkTeam<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
