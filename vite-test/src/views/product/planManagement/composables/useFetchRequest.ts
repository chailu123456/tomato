import { getPlan } from "@/api/request-modules/product";
export default function useFetchRequest(): any {
  // 获取计划管理列表
  const getPlanList = async () => {
    return await getPlan();
  };

  return {
    getPlanList
  };
}
