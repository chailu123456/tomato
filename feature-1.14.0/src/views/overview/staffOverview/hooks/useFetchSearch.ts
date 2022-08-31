import { getEmployeeCalendarList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: Record<"month", string>): Promise<ResponseParams.employeeCalendarList> {
  const employeeCalendarList = await getEmployeeCalendarList<ResponseParams.employeeCalendarList>({
    ...params,
    pageIndex,
    pageSize
  });
  return employeeCalendarList;
}
