import { getTestList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
export default async function useFetchSearch(
  pageIndex = 1,
  pageSize = 20,
  params: RequestParams.GetTestParams
): Promise<ResponseParams.ResponsePermissionSuccess> {
  const iterationList = await getTestList<ResponseParams.ResponsePermissionSuccess>({ ...params, pageIndex, pageSize });
  return iterationList;
}
