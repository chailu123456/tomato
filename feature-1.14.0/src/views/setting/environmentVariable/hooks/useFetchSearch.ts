import { getIterationList } from "api/request";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(params: Record<"status", number>, pageIndex = 1, pageSize = 10): Promise<ResponseParams.Iteration> {
  const iterationList = await getIterationList<ResponseParams.Iteration>({ ...params, pageIndex, pageSize });
  return iterationList;
}
