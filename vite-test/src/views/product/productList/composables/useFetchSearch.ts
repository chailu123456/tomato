import { getProductList } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
export default async function useFetchSearch(pageIndex = 1, pageSize = 10, params: RequestParams.GetProductList): Promise<any> {
  return await getProductList<ResponseParams.ProductList>({ ...params, pageIndex, pageSize });
}
