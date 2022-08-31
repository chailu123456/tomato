import {
  getDemandDocList,
  addDemandDoc,
  getDemandDocSelectList,
  removeDemandDoc,
  editDemandDoc,
  addChildDemandDoc,
  demandDocLog,
  deleteRelativeDoc,
  getUrlTitle,
  planRelativeDoc,
  demandPlanRelativeAdd,
  getDemandDocDetails
} from "@/api/request-modules/product";
import { interDocTelativetree, updateDocRelative } from "@/api/request-modules/iteration";

import { ResponseParams } from "@/types/response";
import { awaitFunc } from "@/utils";

export interface OptionDocParams {
  product_id?: number;
  title: string;
  url?: string;
  size?: number;
  plan_id?: number;
  children?: number[];
  type: number;
  id?: number;
  file_name?: string;
  parent_id?: number;
}

export interface DocTreeParams {
  product_id: number;
  doc_id?: number;
  filter_type?: number;
  page_index?: number;
  page_size?: number;
}
export interface GetDocParams {
  product_id: number;
  create_by: string;
  title: string;
  page_index: number;
  pageIndex?: number;
  page_size: number;
  recent_changes: number;
  plan_id: number;
  is_folder?: number;
}

export interface Children {
  create_time: string;
  id: number;
  preview_url: string;
  staff_name: string;
  title: string;
  type: number;
  update_time: string;
  url: string;
}
export interface DemandReqItemsList {
  children?: Children[];
  create_time: string;
  html_doc_num: number;
  id: number;
  link_doc_num: number;
  preview_url: string;
  product_id: number;
  rp_doc_num: number;
  staff_name: string;
  title: string;
  is_unpacked: number;
  type: number;
  unknow_doc_num: number;
  update_time: string;
  url: string;
  file_name: string;
  file_name_str: string;
  size?: number;
}
export interface DemandReqItems {
  count: number;
  list: DemandReqItemsList[];
}

export interface DocTreeItems {
  id: number;
  title: string;
  type: number;
  children?: DocTreeItems[];
}
export interface DemandTreeReqItems {
  selected_list: number[];
  data_list: DocTreeItems[];
}
export interface PlanTreeReqItems {
  data: DocTreeItems[];
}
export interface LogList {
  content: string;
  create_time: string;
  id: number;
  staff_name: string;
}

export interface DemandLog {
  folder_name: string;
  id: number;
  iteration_names: string;
  list: LogList[];
  plan_names: string;
  plan_id?: number;
}

export interface UrlData {
  description: string;
  title: string;
  icon: string;
  name: string;
  url: string;
}

export interface Details {
  create_by: string;
  create_time: string;
  creator: string;
  delete_time: string;
  file_name: string;
  id: number;
  is_unpacked: number;
  parent_id: number;
  preview_url: string;
  product_id: number;
  remark: string;
  size: number;
  title: string;
  type: number;
  update_by: string;
  update_namee: string;
  update_time: string;
  url: string;
}

export default function useDemandDoc() {
  // 获取需求文档列表
  const getDocList = async (params: GetDocParams): Promise<DemandReqItems | null> => {
    const [err, data]: [unknown, DemandReqItems | null] = await awaitFunc<GetDocParams, DemandReqItems>({
      asyncFunc: getDemandDocList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 新增文档
  const useAddDemandDoc = async (params: OptionDocParams): Promise<boolean> => {
    const [err]: [unknown, OptionDocParams | null] = await awaitFunc<OptionDocParams, OptionDocParams>({
      asyncFunc: addDemandDoc,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 获取需求文档tree列表
  const getTreeDocList = async (params: DocTreeParams): Promise<DemandTreeReqItems | null> => {
    const [err, data]: [unknown, DemandTreeReqItems | null] = await awaitFunc<DocTreeParams, DemandTreeReqItems>({
      asyncFunc: getDemandDocSelectList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 获取迭代关联需求文档tree列表   迭代主页用到
  const getTreeRlativeDoc = async (params: { iteration_id: number }): Promise<DemandTreeReqItems | null> => {
    const [err, data]: [unknown, DemandTreeReqItems | null] = await awaitFunc<{ iteration_id: number }, DemandTreeReqItems>({
      asyncFunc: interDocTelativetree,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 计划模块-计划关联的需求文档树
  const getPlanRelativeDoc = async (params: { plan_id: number }): Promise<PlanTreeReqItems | null> => {
    const [err, data]: [unknown, PlanTreeReqItems | null] = await awaitFunc<{ plan_id: number }, PlanTreeReqItems>({
      asyncFunc: planRelativeDoc,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 删除需求文档
  const deleteDemandDoc = async (params: { id: number }): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<{ id: number }, ResponseParams.ResponseDataSuccess>({
      asyncFunc: removeDemandDoc,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 解除文档关联计划
  const deletePlanDoc = async (params: { doc_id: number; plan_id: number }): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      { doc_id: number; plan_id: number },
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: deleteRelativeDoc,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 编辑需求文档
  const updateDemandDoc = async (params: OptionDocParams): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<OptionDocParams, ResponseParams.ResponseDataSuccess>({
      asyncFunc: editDemandDoc,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 新增文档子集
  const useAddChildDemandDoc = async (params: OptionDocParams): Promise<boolean> => {
    const [err]: [unknown, OptionDocParams | null] = await awaitFunc<OptionDocParams, OptionDocParams>({
      asyncFunc: addChildDemandDoc,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 计划详情-新增关联已上传文档
  const useDemandPlanRelativeAdd = async (params: { children: number[]; plan_id: number }): Promise<boolean> => {
    const [err]: [unknown, { children: number[]; plan_id: number } | null] = await awaitFunc<
      { children: number[]; plan_id: number },
      { children: number[]; plan_id: number }
    >({
      asyncFunc: demandPlanRelativeAdd,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 获取需求文档动态
  const useGetDocLog = async (params: { id: number }): Promise<DemandLog | null> => {
    const [err, data]: [unknown, DemandLog | null] = await awaitFunc<{ id: number }, DemandLog>({
      asyncFunc: demandDocLog,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 获取链接标题
  const useGetUrlTitle = async (params: { url: string }): Promise<UrlData | null> => {
    const [err, data]: [unknown, UrlData | null] = await awaitFunc<{ url: string }, UrlData>({
      asyncFunc: getUrlTitle,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 获取需求文档详情
  const useGetDeamdDetails = async (params: { id: number }): Promise<Details | null> => {
    const [err, data]: [unknown, Details | null] = await awaitFunc<{ id: number }, Details>({
      asyncFunc: getDemandDocDetails,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 编辑迭代关联需求文档
  const updateRelativeDoc = async (params: { iteration_id: number; doc_ids: number[] }): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      { iteration_id: number; doc_ids: number[] },
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: updateDocRelative,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  return {
    useGetDeamdDetails,
    getDocList,
    useAddDemandDoc,
    getTreeDocList,
    deleteDemandDoc,
    updateDemandDoc,
    useAddChildDemandDoc,
    useGetDocLog,
    deletePlanDoc,
    useGetUrlTitle,
    getTreeRlativeDoc,
    updateRelativeDoc,
    getPlanRelativeDoc,
    useDemandPlanRelativeAdd
  };
}
