import { selectProductList, selectManagerList } from "@/api/request-modules/product";
import { reactive } from "vue";
// 获取产品列表和负责人列表
export default function useGetSelectList(key?: string): any {
  const lists = reactive<{ [key: string]: unknown }>({
    productList: [],
    managerList: []
  });
  const getProductLists = async () => {
    const productList: ResponseData<Array<unknown>> = await selectProductList();
    lists.productList = productList.data;
  };
  const getManagerLists = async () => {
    const managerList: ResponseData = await selectManagerList();
    lists.managerList = managerList.data;
  };
  const selectLists = (key?: string) => {
    if (key === "productList") {
      getProductLists();
    } else if (key === "managerList") {
      getManagerLists();
    } else {
      getProductLists();
      getManagerLists();
    }
  };
  selectLists(key);
  return lists;
}
