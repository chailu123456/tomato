import { getBugList } from "@/api/request-modules/test";
import { ResponseParams } from "@/types/response";
/* eslint-disable */
export default async function useFetchSearch(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getBugList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}
