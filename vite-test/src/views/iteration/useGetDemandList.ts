import { getDemandSelectList } from "@/api/request-modules/iteration";
export default function useGetDemandList(): (id: number) => Promise<any> {
  const getDemandListFn = async (id: number) => {
    const { data } = await getDemandSelectList({ status: id });
    return data;
  };

  return getDemandListFn;
}
