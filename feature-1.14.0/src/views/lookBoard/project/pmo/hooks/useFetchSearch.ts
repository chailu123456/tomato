import { getIterationList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: Record<"status", number>): Promise<ResponseParams.Iteration> {
  const iterationList = await getIterationList<ResponseParams.Iteration>({ ...params, pageIndex, pageSize });
  return iterationList;
}
