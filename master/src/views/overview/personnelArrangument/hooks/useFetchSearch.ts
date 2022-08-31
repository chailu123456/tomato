import { getPeopleList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
export default async function useFetchSearch(
  pageIndex = 1,
  pageSize = 20,
  params: RequestParams.GetPeopleParams
): Promise<ResponseParams.ResponsePermissionSuccess> {
  const iterationList = await getPeopleList<ResponseParams.ResponsePermissionSuccess>({
    ...params,
    pageIndex,
    pageSize
  });
  return iterationList;
}
