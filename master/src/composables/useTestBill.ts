/*
 * @Author: 宋绍华
 * @Date: 2022-05-18 11:02:39
 * @LastEditTime: 2022-05-28 18:22:30
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useTestBill.ts
 */
import { getIterateList } from "@/api/request-modules/board";
import { allMember } from "@/api/request-modules/product";
import {
  createTestBill,
  getAssociatedSelect,
  getAvailableIterationTestBillList,
  getAvailableTestBillList,
  getCreatorList,
  getTestBillDetail,
  getTestBillList,
  getTestBillLogs,
  modifyTestBill,
  modifyTestBillStatus
} from "@/api/request-modules/test";
import { ResponseParams } from "@/types/response";
import { awaitFunc } from "@/utils";

// 提测单列表 接口响应类型
export interface ProductTestBillResp {
  count: number; // 总记录数;
  list: ProductTestBillItem[];
}

// 提测单列表items 接口响应类型
export interface ProductTestBillItem {
  id: number; // 提测单ID;
  name: string; // 提测单名称;
  status: number; // 提测单状态  1：待提测, 2：已驳回, 3：待确认(申请中),  4：测试中，5 测试完成 6：待发布，7：已发布;
  create_by: string; // 创建人编号;
  creator: string; // 创建人名称;
  create_time: string; // 创建时间;
  staff_no: string; // 指派人编号;
  staff_name: string; // 指派人名称;
  update_time: string; // 更新时间;
  notify_list: TestBillNotifyItem[];
}

// 提测单列表请求
export interface ProductTestBillReq {
  product_id: number; // 项目ID
  name?: string; // 提测单名称
  status?: number | number[]; // 状态：1：待提测, 2：待确认, 3：已驳回, 4：测试中，5：待发布，6：已发布
  create_by?: string; // 创建人编号
  staff_no?: string; // 指派给编号
  demand_id?: number; // 关联需求ID
  iteration_id?: number; // 关联迭代ID
  task_id?: number; // 关联任务ID
  create_time?: string[]; // 创建时间
  page_index?: number; // 分页页码
  page_size?: number; // 分页大小
}

// 提测单已关联下拉列表 接口响应类型
export interface AssociatedSelectResp {
  id: number; // ID;
  value: string; // 名称;
}
// 提测单已关联下拉列表 接口请求类型
export interface AssociatedSelectReq {
  type: number; // 关联类型：1.需求 2.迭代 3.任务
  product_id: string; // 项目ID
}

// 提测单创建人列表 接口响应类型
export interface ListCreatorResp {
  label: string;
  options: ListCreatorOptionResp[];
}

// 提测单创建人列表options 接口响应类型
export interface ListCreatorOptionResp {
  staff_no: string; // 成员编号;
  staff_name: string; // 成员名称;
}

// 提测单状态变更
export interface TestBillStatusReq {
  id: number; // 提测单ID;
  to_status: number; // 下阶段状态;
  remark?: string; // 备注;
  notify_list?: {
    staff_no?: string; // 通知人编号;
    staff_name?: string; // 通知人名称;
  }[];
}
// 编辑提测单请求
export interface TestBillEditReq {
  id?: number; // 提测单ID;
  name?: string;
  staff_no?: string; // 指派人编号;
  staff_name?: string; // 指派人名称;
  content?: string; // 提测单内容;
  remark?: string; // 提测单备注;
  type?: number; // 提测单类型: 1.需求提测 2.任务提测 3.bug提测;
  quote_ids?: number[];
  field?: string; // 编辑时需要带上field=attachment
  attachment?: {
    id?: number; // 附件ID;
    name?: string; // 附件名称;
    size?: number; // 附件大小;
    url?: string; // 附件地址;
  }[];
}

// 提测单关联下拉(未关联数据)
export interface AvailableSelectReq {
  test_apply_id?: number; // 提测单nid
  type?: number; // 关联类型：1.需求 2.任务 3.bug
  product_id: number; // 项目ID
  iteration_id?: number; // 迭代ID
}

// 新增提测单请求类型
export interface TestBillAddReq {
  attachment?: {
    id?: number;
    name?: string; // 文档名称;
    size?: number; // 文档大小;
    url?: string; // 文档url地址;
  }[];
  content?: string; // 提测单内容;
  iteration_id?: number; // 迭代ID;
  name?: string; // 提测单名称;
  product_id?: number; // 项目ID;
  quote_ids?: number[]; // 提测单关联的需求/任务/bug的ids
  remark?: string; // 提测单备注;
  staff_name?: string; // 指派给成员名称;
  staff_no?: string; // 指派给成员编号;
  status?: number; // 提测状态 1：待提测, 2：待确认, 3：已驳回, 4：测试中，5：待发布，6：已发布;
  type?: number; // 提测单类型: 1.需求提测 2.任务提测 3.bug提测;
}

// 提测单详情 响应类型
export interface TestBillDetailResp {
  attachment?: {
    name?: string; // 附件名称;
    size?: number; // 附件大小;
    url?: string; // 附件url地址;
  }[];
  quote_list?: number[]; // 提测单关联的需求/任务/bug的ids
  content?: string; // 提测单内容;
  create_by?: string; // 创建人编号;
  creator?: string; // 创建人名称;
  id: number; // 提测单ID;
  iteration_id?: number; // 迭代ID;
  name?: string; // 提测单名称;
  product_id?: number; // 项目ID;
  remark?: string; // 提测单备注;
  staff_name?: string; // 指派人名称;
  staff_no?: string; // 指派人编号;
  notify_list: TestBillNotifyItem[];
  type?: number; // 提测单类型: 1.需求提测 2.任务提测 3.bug提测;
  status?: number; // 提测单状态： 1：待提测, 2：待确认, 3：已驳回, 4：测试中，5：待发布，6：已发布;
}

// 选择成员
export interface TestBillNotifyItem {
  is_sys?: boolean;
  staff_name: string;
  staff_no: string;
  is_department?: boolean;
}

// 提测单动态 接口响应类型
export interface LogsResp {
  content?: string; // 日志内容;
  create_time?: string;
  id?: number; // 记录ID;
  remark?: string; // 日志备注;
}

export default function useTestBill() {
  // 提测单列表
  const useGetTestBillList = async (params: ProductTestBillReq): Promise<ProductTestBillResp | null> => {
    const [err, data]: [unknown, ProductTestBillResp | null] = await awaitFunc<ProductTestBillReq, ProductTestBillResp>({
      asyncFunc: getTestBillList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 提测单已关联下拉列表
  const useGetProductTestBillList = async (params: AssociatedSelectReq): Promise<AssociatedSelectResp[] | null> => {
    const [err, data]: [unknown, AssociatedSelectResp[] | null] = await awaitFunc<AssociatedSelectReq, AssociatedSelectResp[]>({
      asyncFunc: getAssociatedSelect,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 提测单已关联下拉列表
  const useGetCreatorList = async (product_id: number): Promise<ListCreatorResp[] | null> => {
    const [err, data]: [unknown, ListCreatorResp[] | null] = await awaitFunc<number, ListCreatorResp[]>({
      asyncFunc: getCreatorList,
      args: product_id
    });
    if (err || !data) return null;
    return data;
  };

  // 提测单已关联下拉列表
  const useGetUserList = async (params: { product_id: number }): Promise<ListCreatorResp[] | null> => {
    const [err, data]: [unknown, ListCreatorResp[] | null] = await awaitFunc<{ product_id: number }, ListCreatorResp[]>({
      asyncFunc: allMember,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 修改成员状态
  const useModifyTestBillStatus = async (params: TestBillStatusReq): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<TestBillStatusReq, ResponseParams.ResponseDataSuccess>({
      asyncFunc: modifyTestBillStatus,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 提测单修改
  const useModifyTestBill = async (params: TestBillEditReq): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<TestBillEditReq, ResponseParams.ResponseDataSuccess>({
      asyncFunc: modifyTestBill,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 提测单关联下拉(未关联数据)
  const useAvailableTestBillList = async (params: AvailableSelectReq): Promise<AssociatedSelectResp[] | null> => {
    const [err, data]: [unknown, AssociatedSelectResp[] | null] = await awaitFunc<AvailableSelectReq, AssociatedSelectResp[]>({
      asyncFunc: getAvailableTestBillList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 提测单关联下拉
  const useAvailableIterationTestBillList = async (params: AvailableSelectReq): Promise<AssociatedSelectResp[] | null> => {
    const [err, data]: [unknown, AssociatedSelectResp[] | null] = await awaitFunc<AvailableSelectReq, AssociatedSelectResp[]>({
      asyncFunc: getAvailableIterationTestBillList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 提测单关联下拉(未关联数据)
  const useGetIterateList = async (params: { product_id: number; iteration_id?: number }): Promise<AssociatedSelectResp[] | null> => {
    const [err, data]: [unknown, AssociatedSelectResp[] | null] = await awaitFunc<{ product_id: number; iteration_id?: number }, AssociatedSelectResp[]>({
      asyncFunc: getIterateList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 提测单修改
  const useCreateTestBill = async (params: TestBillAddReq): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<TestBillAddReq, ResponseParams.ResponseDataSuccess>({
      asyncFunc: createTestBill,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 提测单详情
  const useGetTestBillDetail = async (id: number): Promise<TestBillDetailResp | null> => {
    const [err, data]: [unknown, TestBillDetailResp | null] = await awaitFunc<number, TestBillDetailResp>({
      asyncFunc: getTestBillDetail,
      args: id
    });
    if (err || !data) return null;
    return data;
  };

  // 提测单动态
  const useGetTestBillLogs = async (id: number): Promise<LogsResp[] | null> => {
    const [err, data]: [unknown, LogsResp[] | null] = await awaitFunc<number, LogsResp[]>({
      asyncFunc: getTestBillLogs,
      args: id
    });
    if (err || !data) return null;
    return data;
  };

  return {
    useAvailableIterationTestBillList,
    useGetTestBillLogs,
    useGetTestBillDetail,
    useCreateTestBill,
    useGetIterateList,
    useAvailableTestBillList,
    useModifyTestBill,
    useModifyTestBillStatus,
    useGetUserList,
    useGetCreatorList,
    useGetProductTestBillList,
    useGetTestBillList
  };
}
