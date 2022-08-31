/*
 * @Author: 宋绍华
 * @Date: 2021-11-08 17:42:49
 * @LastEditTime: 2022-04-15 10:53:18
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useDocument.ts
 */
import {
  createChildren,
  deleteDoc,
  delWikiDoc,
  getDocTreeList,
  getModifyWikiList,
  getShareList,
  getTagList,
  modifyWikiPos,
  moveWikiPos,
  updateCollection,
  updatePermission,
  updateWikiTitle
} from "@/api/request-modules/document";
import router from "@/router";
import { ResponseParams } from "@/types/response";
import { awaitFunc } from "@/utils";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";

export interface DocDetails {
  comment_permission: number;
  content_id: string;
  create_by: string;
  creator: string;
  id: number;
  is_collection: number;
  link_share: number;
  open_share: number;
  permission: number;
  status: number;
  title: string;
  root_classify_id?: number;
}

export interface TreeItem {
  children: TreeItem[];
  content_id: string;
  id: number;
  label: string;
  master_id: number;
  parent_id: number;
  seq: number;
}

export interface ParamsUpdateDocTitleInter {
  content_id: string;
  id: number;
  title: string;
  parent_id: number;
}

// 分类item
export interface ColumnItemInter {
  children?: ColumnItemInter[];
  id: number;
  level: number;
  name: string;
  order: number;
  parent_id: number;
}

export interface ParamsModifyWikiInter {
  // 移动子文档
  current_id: number;
  seq: number;
  target_id: number;
}

// 标签list item
export interface TagItemInter {
  id: number;
  level: number;
  name: string;
  order: number;
  parent_id: number;
}

// 收藏、取消收藏
export async function onUpdateCollection(type: number, wiki_id: number): Promise<boolean> {
  const { code } = await updateCollection<ResponseParams.ResponseDataSuccess>({ type, wiki_id });
  if (code === 200) {
    ElMessage.success({
      type: "success",
      message: type === 1 ? "已添加至 “收藏”" : "已取消收藏"
    });
    return true;
  }
  return false;
}

// 删除文档
export async function onDeleteDoc(id: number, title: string): Promise<boolean> {
  let isConfirm;
  try {
    isConfirm = await ElMessageBox.confirm(`删除的内容将无法回收，请确认是否删除？`, `是否删除：${title}？`, {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "error",
      confirmButtonClass: "el-button--danger-box"
    });
  } catch (error) {
    console.log(error);
  }

  if (isConfirm !== "confirm") return false;
  const loadingInstance = ElLoading.service();
  const { code } = await deleteDoc({ id });
  loadingInstance.close();
  if (code === 200) {
    ElMessage.success({
      type: "success",
      message: "删除成功"
    });
    // 删除之后需要返回上一个页面
    setTimeout(() => {
      router.back();
    }, 1500);
    return true;
  }
  return false;
}

// 更新文档权限
export async function onUpdatePermission(id: number, status: number): Promise<boolean> {
  const { code } = await updatePermission({ id, status });
  if (code === 200) {
    ElMessage.success({
      type: "success",
      message: status === 1 ? "已通过权限申请" : "已拒绝申请"
    });
    return true;
  }
  return false;
}

// 获取随机id
export function randomStringId(len = 20) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomstring = "";
  for (let i = 0; i < len; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

export default function useDocument() {
  // 工作项日历列表
  const useGetDocTreeList = async (id: number): Promise<TreeItem | null> => {
    const [err, data]: [unknown, TreeItem | null] = await awaitFunc<number, TreeItem>({
      asyncFunc: getDocTreeList,
      args: id
    });
    if (err || !data) return null;
    return data;
  };
  // 删除文档
  const useDelWikiDoc = async (id: number): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<number, ResponseParams.ResponseDataSuccess>({
      asyncFunc: delWikiDoc,
      args: id
    });
    if (err) return false;
    return true;
  };
  // update 文档标题
  const useUpdateDocTitle = async (params: Omit<ParamsUpdateDocTitleInter, "parent_id">): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      Omit<ParamsUpdateDocTitleInter, "parent_id">,
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: updateWikiTitle,
      args: params
    });
    if (err) return false;
    return true;
  };
  // 保存子文档
  const useCreateChildren = async (params: Omit<ParamsUpdateDocTitleInter, "id">): Promise<Record<string, any> | null> => {
    const [err, data]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      Omit<ParamsUpdateDocTitleInter, "id">,
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: createChildren,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 移动子文档
  const useModifyWikiSort = async (params: ParamsModifyWikiInter): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<ParamsModifyWikiInter, ResponseParams.ResponseDataSuccess>({
      asyncFunc: modifyWikiPos,
      args: params,
      needCode: true
    });
    // 如果需要code 200，
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };
  // 获取分享list
  const useGetShareList = async (): Promise<ColumnItemInter | null> => {
    const [err, data]: [unknown, ColumnItemInter | null] = await awaitFunc<never, ColumnItemInter>({
      asyncFunc: getShareList
    });
    if (err || !data) return null;
    return data;
  };
  // 可编辑权限文档列表
  const useGetModifyWikiList = async (): Promise<ColumnItemInter | null> => {
    const [err, data]: [unknown, ColumnItemInter | null] = await awaitFunc<never, ColumnItemInter>({
      asyncFunc: getModifyWikiList
    });
    if (err || !data) return null;
    return data;
  };
  // 获取tag列表
  const useGetTagList = async (name?: string): Promise<TagItemInter[] | null> => {
    const [err, data]: [unknown, TagItemInter[] | null] = await awaitFunc<string, TagItemInter[]>({
      asyncFunc: getTagList,
      args: name
    });
    if (err || !data) return null;
    return data;
  };

  // 移动子文档
  const useMoveWikiSort = async (params: Omit<ParamsModifyWikiInter, "seq">): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<Omit<ParamsModifyWikiInter, "seq">, ResponseParams.ResponseDataSuccess>(
      {
        asyncFunc: moveWikiPos,
        args: params,
        needCode: true
      }
    );
    // 如果需要code 200，
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  return {
    useGetTagList,
    useMoveWikiSort,
    useGetModifyWikiList,
    useModifyWikiSort,
    useGetShareList,
    useGetDocTreeList,
    useDelWikiDoc,
    useUpdateDocTitle,
    useCreateChildren
  };
}
