import {
  getTableData,
  getKnowledgeList,
  getProductList,
  getSpaceCollaboratList,
  getSpaceColllectList,
  getSpaceDarftList,
  getSpacePublishList
} from "@/api/request-modules/document";
import { ResponseParams } from "@/types/response";

/* eslint-disable */
// 获取文档中心列表
export async function useFetchSearchCenter(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getTableData<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}

/* eslint-disable */
export async function useFetchSearch(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getKnowledgeList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}

/* eslint-disable */
export async function useFetchSearchProduct(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getProductList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}

// 我的空间
/* eslint-disable */
export async function useFetchSearchCollaborat(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getSpaceCollaboratList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}

/* eslint-disable */
export async function useFetchSearchColllect(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getSpaceColllectList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}

/* eslint-disable */
export async function useFetchSearchDraft(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getSpaceDarftList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}

/* eslint-disable */
export async function useFetchSearchPublish(page_index = 1, page_size = 20, params: any): Promise<any> {
  return await getSpacePublishList<ResponseParams.ResponseDataSuccess>({ ...params, page_index, page_size });
}
