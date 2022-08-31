import { /**getIterationCascader,*/ getDemandSelectList } from "@/api/request-modules/iteration";
export default function useGetDemandList(): (...args: Array<any>) => Promise<any> {
  const getDemandListFn = async (id: number) => {
    // const { data } = await getIterationCascader();
    const { data } = await getDemandSelectList({ product_id: id, status: -1 });
    return data;
  };

  return getDemandListFn;
}
