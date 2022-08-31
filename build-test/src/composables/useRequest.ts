import usePagation from "./usePagation";
import { Pagation } from "./usePagation";
export type returnRequest = {
  response: (pagationParams?: Pagation) => any;
};
/**
 *
 * @param userSearchFn 用户自定义搜索函数
 * @param data 提交的参数
 * @returns {handlePagationChange} 分页函数
 *
 */

export default function useRequest(userSearchFn: (pageIndex: number, pageSize: number, params: any) => unknown, data?: Record<string, any>): returnRequest {
  const { response } = usePagation(userSearchFn, data);
  return { response };
}
