import { qualityOverflow } from "@/api/request-modules/lookboard";
import { RequestParams } from "@/types/request";

import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(
  pageIndex = 1,
  pageSize = 10,
  params: RequestParams.GetUseQualityList
): Promise<ResponseParams.ResponseDataSuccess> {
  // 月度概览模块默认显示5条，分页自己做的，没用到组件
  if (params.page_size === 5) {
    const iterationList = await qualityOverflow<ResponseParams.ResponseDataSuccess>({ ...params });
    return iterationList;
  } else {
    const iterationList = await qualityOverflow<ResponseParams.ResponseDataSuccess>({ ...params, pageIndex, pageSize });
    return iterationList;
  }
}
