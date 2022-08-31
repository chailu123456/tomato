import { getConfigTabList } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: Record<string, any>): Promise<ResponseParams.TabList> {
  return await getConfigTabList<ResponseParams.TabList>({ ...params, pageIndex, pageSize });
}
