import { getIterationDetail } from "@/api/request-modules/iteration";
export default function useFetchSearch(id: number): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    getIterationDetail<ResponseData<Record<string, any>>>(id).then((res) => {
      resolve(res.data!);
    });
  });
}
