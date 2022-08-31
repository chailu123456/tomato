import { getRelevanceDemandList } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";

export default function useGetRelevanceDemandList(): Record<string, any> {
  const demandList = (product_id?: number, plan_id?: number, is_bind?: false) => {
    return new Promise((resolve, reject) => {
      getRelevanceDemandList<ResponseParams.ResponseDataSuccess>({ product_id, plan_id, is_bind }).then((res) => {
        if (res.code === 200) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  };
  return {
    demandList
  };
}
