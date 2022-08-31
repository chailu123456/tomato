import { Pagation } from "@/composables/usePagation";

export default function useRenderTable(response: (pagationParams?: Pagation) => Promise<any>): any {
  const pagation = async (pagationParams?: Pagation) => {
    return await response(pagationParams);
  };
  return {
    pagation
  };
}
