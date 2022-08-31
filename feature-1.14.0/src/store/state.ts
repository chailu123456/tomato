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
}

const state: State = {
  count: 0,
  user: getSession("user", true) as USER | null,
  employeeLists: [],
  envList: getSession("envList", true) as ENVLIST | null,
  permission: null,
  include: [],
  workCalendarDay: ""
  // employeeLists: []
};
export default state;
