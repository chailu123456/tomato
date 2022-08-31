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
} | null;
export interface State {
  count: number;
  user: USER;
  // 员工列表
  employeeLists: Array<Record<string, any>>;
  // 产品列表
}

const state: State = {
  count: 0,
  user: getSession("user", true) as USER | null,
  employeeLists: []
};
export default state;
