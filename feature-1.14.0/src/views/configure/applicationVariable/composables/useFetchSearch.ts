import { getSettingAppList } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: Record<"name", string>): Promise<ResponseParams.ResponseDataSuccess> {
  return await getSettingAppList<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
}
