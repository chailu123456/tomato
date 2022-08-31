import { getStatisticsData } from "@/api/request-modules/iteration";
// import { ResponseParams } from "@/types/response";
interface ResponsePermissionSuccess {
  code: number;
  data: any;
  message: string;
}
export default async function useChartDataSearch(id: number | null): Promise<ResponsePermissionSuccess> {
  const chartData = await getStatisticsData<ResponsePermissionSuccess>(id);
  return chartData;
}
