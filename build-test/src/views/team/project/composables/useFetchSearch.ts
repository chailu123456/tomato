import { getSettingAppList } from "@/api/request-modules/setting";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: Record<"name", string>): Promise<ResponseParams.ResponseDataSuccess> {
  return await getSettingAppList<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
