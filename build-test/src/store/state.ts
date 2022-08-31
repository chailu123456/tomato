/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-06-01 16:34:18
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\store\state.ts
 */
import { Iterate } from "@/composables/useBoardBase";
import { ProjectItem } from "@/composables/useCommon";
import { getSession } from "@/utils";
export type USER = {
  department: string;
  department_code: string;
  duty_status: number;
  errcode: number;
  errmsg: string;
  gender: number;
  job_code: string;
  job_name: string;
  mobile: string;
  name: string;
  open_user_id: string;
  staff_no: string;
  telephone: string;
  userid: string;
  token: string;
  shr_staff_no?: string;
} | null;

export type ENVLIST = {
  label: string;
  value: number;
} | null;

export type Permission = {
  config_operation: boolean;
  create_product: boolean;
} | null;

export interface State {
  count: number;
  user: USER;
  // 员工列表
  employeeLists: Array<Record<string, any>>;
  // 环境变量列表
  envList: ENVLIST;
  // 访问配置模块权限
  permission: Permission;
  // employeeLists: Array<Record<string, any>>;
  // 产品列表
  // 缓存页面
  include: string[];
  workCalendarDay: string;
  productList: ProjectItem[]; // 全局項目list
  iterateList: Iterate[]; // 全局迭代list
  productId: number; // 全局当前项目id
  iterateId: number; // 全局当前迭代id
  productInfo: ProjectItem | null; // 全局项目列表
  currentIter: null | Iterate; // 全局当前迭代 currentIter 类型
  iterateContentVisible: boolean;
  addMemberVisible: boolean;
}

const state: State = {
  count: 0,
  user: getSession("user", true) as USER | null,
  employeeLists: [],
  envList: getSession("envList", true) as ENVLIST | null,
  permission: null,
  include: [],
  workCalendarDay: "",
  productInfo: null, // 全局项目列表
  currentIter: null, // 全局当前迭代
  productList: [], // 全局项目list
  iterateList: [], // 全局迭代list
  productId: 0, // 全局当前项目id
  iterateId: 0, // 全局当前迭代id
  iterateContentVisible: false,
  addMemberVisible: false
};
export default state;
