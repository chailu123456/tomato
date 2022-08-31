import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
import { ParamsModifyWikiInter, ParamsUpdateDocTitleInter } from "@/composables/useDocument";
import { getSession } from "@/utils";

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  知识库列表
 * @returns {Promise<T>}
 */
export function getKnowledgeList<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getKnowledgeList, params);
}

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  项目文档列表
 * @returns {Promise<T>}
 */
export function getProductList<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getProductList, params);
}

/**
 * @param root_id 分类id  (0.知识库 1.项目文档)
 * @description  用户一级分类列表   tab列表
 * @returns {Promise<T>}
 */
export function getClassify<T>(params: { root_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.getClassify, params);
}

/**
 * @param root_id 分类id  (0.知识库 1.项目文档)
 * @description  tag列表
 * @returns {Promise<T>}
 */
export function getTagList<T>(name?: string): Promise<T> {
  return axiosInstance.get<T>(api.tagList, { name });
}

/**
 * @param type 类型 1.收藏 2.取消收藏
 * @param wiki_id 文档id
 * @description  文档收藏操作
 * @returns {Promise<T>}
 */
export function updateCollection<T>(params: { type: number; wiki_id: number }): Promise<T> {
  return axiosInstance.post<T>(api.updateCollection, params);
}

/**
 * @param id id
 * @description  删除文档
 * @returns {Promise<T>}
 */
export function deleteDoc<T>(params: { id: number }): Promise<T> {
  return axiosInstance.delete<T>(`${api.handleDoc + "/" + params.id}`, "");
}
/**
 * @param id number
 * @param status number 1，统一 2，拒绝
 * @description  更新文档权限
 * @returns {Promise<T>}
 */
export function updatePermission<T>(params: { id: number; status: number }): Promise<T> {
  return axiosInstance.post<T>(`${api.updatePermission}`, params);
}
/**
 * @param type  number
 * @param wiki_id number
 * @description  文档权限申请
 * @returns {Promise<T>}
 */
export function applyPermission<T>(params: { type: number; wiki_id: number }): Promise<T> {
  return axiosInstance.post<T>(`${api.applyPermission}`, params);
}
/**
 * @param title string
 * @param content_id string
 * @description  创建文档
 * @returns {Promise<T>}
 */
export function createDoc<T>(params: { title: string; content_id: string }): Promise<T> {
  return axiosInstance.post<T>(`${api.handleDoc}`, params);
}
/**
 * @param id string
 * @description  获取文档详情
 * @returns {Promise<T>}
 */
export function getDocDetails<T>(id: number): Promise<T> {
  const currentLink = getSession("shortCode", true) as any;
  if (currentLink.content.includes("is_link_share=1")) {
    return axiosInstance.get<T>(`${api.handleDoc}/${id}`, { is_link_share: 1 });
  }
  return axiosInstance.get<T>(`${api.handleDoc}/${id}`);
}
/**
 * @param root_id string
 * @description  获取分享弹框-项目文档分类列表
 * @returns {Promise<T>}
 */
export function getShareList<T>(): Promise<T> {
  return axiosInstance.get<T>(`${api.getShareList}`, { root_id: 1 });
}
/**
 * @param title string
 * @param content_id string
 * @param id number
 * @description  更新文档
 * @returns {Promise<T>}
 */
export function updateDoc<T>(params: { title: string; content_id: string; id: number }): Promise<T> {
  return axiosInstance.post<T>(`${api.getDocTitle}`, params);
}

/**
 * @param title string
 * @param content_id string
 * @param classify_id 分类ID
 * @param comment_permission 评论权限 0=不可以评论 1=所有人可评论 2=仅编辑权限可评论
 * @param id 文档 ID
 * @param link_share 链接分享权限 0=不可以分享 1=组织内获取链接的人可以阅读 2=组织内获取链接的人可编辑
 * @param open_share 公开分享权限 0=不可以 1=所有人可以阅读 2=所有人可以编辑
 * @param root_classify_id 根分类ID 0=知识库 1=项目文档
 * @param tag_id 标签ID
 * @param department 部门
 * @param team_worker 协作者
 * @param status 状态 0=草稿 1=已发布 2=删除
 * @description  更新分享文档
 * @returns {Promise<T>}
 */
export function updateShareDoc<T>(params: RequestParams.updateDocument): Promise<T> {
  const newParams = {
    root_classify_id: params.root_classify_id * 1,
    id: params.id,
    status: params.link_share * 1 || params.open_share * 1 ? 1 : 0,
    content_id: params.content_id,
    classify_id: params.classify_id * 1,
    comment_permission: params.comment_permission * 1,
    link_share: params.link_share * 1,
    open_share: params.open_share * 1,
    tag_id: params.tag_id.map((item: number) => item * 1),
    department: params.department,
    team_worker: params.team_worker,
    title: params.title
  };
  return axiosInstance.put<T>(`${api.handleDoc}`, newParams);
}

/**
 * @param content_id string
 * @description  获取title
 * @returns {Promise<T>}
 */
export function getDocTitle<T>(content_id: string): Promise<T> {
  return axiosInstance.get<T>(`${api.getDocTitle}`, { content_id });
}

/**
 * @param id id
 * @description  置顶文档
 * @returns {Promise<T>}
 */
export function topDoc<T>(params: { id: number; type: number }): Promise<T> {
  return axiosInstance.put<T>(`${api.topDoc + "/" + params.id}`, params);
}

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  我的空间-协作列表
 * @returns {Promise<T>}
 */
export function getSpaceCollaboratList<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getSpaceCollaboratList, params);
}
/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  我的空间-收藏列表
 * @returns {Promise<T>}
 */
export function getSpaceColllectList<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getSpaceColllectList, params);
}
/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  我的空间-草稿列表
 * @returns {Promise<T>}
 */
export function getSpaceDarftList<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getSpaceDarftList, params);
}
/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  我的空间-分享列表
 * @returns {Promise<T>}
 */
export function getSpacePublishList<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getSpacePublishList, params);
}

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param classify_id 分类id
 * @param keyword 搜索关键字
 * @description  知识库列表
 * @returns {Promise<T>}
 */
export function getTableData<T>(params: RequestParams.GetKnowledgeParams): Promise<T> {
  return axiosInstance.get<T>(api.getTableData, params);
}

/**
 * @description  文档中心-分类列表
 * @returns {Promise<T>}
 */
export function getClassifyTree<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getClassifyTree);
}

/**
 * @param name string
 * @param id number
 * @description  更新文档
 * @returns {Promise<T>}
 */
export function updateClassifyName<T>(params: { name: string; id: number; parent_id?: number }): Promise<T> {
  delete params.parent_id;
  return axiosInstance.put<T>(`${api.updateClassifyName}`, params);
}

/**
 * @param name string
 * @param parent_id number
 * @description  更新文档
 * @returns {Promise<T>}
 */
export function addClassify<T>(params: { name: string; parent_id: number; id?: number }): Promise<T> {
  delete params.id;
  return axiosInstance.post<T>(`${api.addClassify}`, params);
}

/**
 * @param id id
 * @description  删除分类
 * @returns {Promise<T>}
 */
export function deleteClassify<T>(params: { id: number }): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteClassify + params.id}`, "");
}

/**
 * @param id id
 * @description  获取分类面包屑
 * @returns {Promise<T>}
 */
export function getCrumbs<T>(params: { id: number }): Promise<T> {
  return axiosInstance.get<T>(`${api.getCrumbs + params.id + "/breadcrumb"}`);
}
/**
 * @param id id
 * @description  获取wiki文档树list
 * @returns {Promise<T>}
 */
export function getDocTreeList<T>(id: number): Promise<T> {
  return axiosInstance.get<T>(api.getWikiTree + id);
}

/**
 * @param id 当前拖动的id
 * @param order 排序位置
 * @param parent_id 父级ID
 * @description  拖动分类分类
 * @returns {Promise<T>}
 */
export function moveClassify<T>(params: { id: number; order: number; parent_id: number }): Promise<T> {
  return axiosInstance.post<T>(api.moveClassify, params);
}
/**
 * 删除文档
 * @param id wiki id
 * @returns
 */
export function delWikiDoc<T>(id: number): Promise<T> {
  return axiosInstance.delete<T>(`${api.delWikiDoc}${id}`);
}
/**
 * 更新文档标题
 * @param id wiki id
 * @returns
 */
export function updateWikiTitle<T>(params: Omit<ParamsUpdateDocTitleInter, "parent_id">): Promise<T> {
  return axiosInstance.post<T>(api.getDocTitle, params);
}

/**
 * @param id id
 * @description  获取短码内容
 * @returns {Promise<T>}
 */
export function getShortCode<T>(params: { id: string }): Promise<T> {
  return axiosInstance.get<T>(`${api.getShortCode + params.id}`);
}

/**
 * 更新文档标题
 * @param content
 * @description  链接转码
 * @returns
 */
export function shortCode<T>(params: { content: string }): Promise<T> {
  return axiosInstance.post<T>(api.shortCode, params);
}
/**
 * 创建子文档
 * @param content_id 文档id
 * @param parent_id 父节点id
 * @param title 名称
 * @returns
 */
export function createChildren<T>(params: Omit<ParamsUpdateDocTitleInter, "id">): Promise<T> {
  return axiosInstance.post<T>(api.createChildren, params);
}
/**
 * 创建子文档
 * @param {number} content_id 当前要移动的wiki文档id
 * @param {number} target_id 要排序到的父级文档ID
 * @param {number} seq 排序到父级文档下的排序值（父级中没有就传0或者不传，否则取前面一条数据的seq）
 * @returns
 */
export function modifyWikiPos<T>(params: ParamsModifyWikiInter): Promise<T> {
  return axiosInstance.post<T>(api.modifyWikiPos, params);
}
// 可编辑权限文档列表
export function getModifyWikiList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getModifyWikiList);
}
/**
 * 移动子文档
 * @param {number} content_id 当前要移动的wiki文档id
 * @param {number} target_id 要排序到的父级文档ID
 * @returns
 */
// 可编辑权限文档列表
export function moveWikiPos<T>(params: Omit<ParamsModifyWikiInter, "seq">): Promise<T> {
  return axiosInstance.post<T>(api.moveWikiPos, params);
}
