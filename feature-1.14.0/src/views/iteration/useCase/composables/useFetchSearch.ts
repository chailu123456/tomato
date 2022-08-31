import { getUseCaseData } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: RequestParams.GetUseCaseList): Promise<any> {
  return await getUseCaseData<ResponseParams.TaskList>({ ...params, pageIndex, pageSize });
}
