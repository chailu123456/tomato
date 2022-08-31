/*
 * @Author: 宋绍华
 * @Date: 2021-10-30 16:26:32
 * @LastEditTime: 2022-01-13 15:19:39
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useGetSelectList.ts
 */
import { selectProductList, selectManagerList } from "@/api/request-modules/product";
import { getSession } from "@/utils/sesssion";

// 获取产品列表和负责人列表
export default function useGetSelectList(): any {
  const getProductLists = async () => {
    return await selectProductList();
  };
  const getManagerLists = async () => {
    return await selectManagerList({ product_id: Number(getSession("productId")) });
  };
  return {
    getProductLists,
    getManagerLists
  };
}
