import { PRIORITY } from "@/utils/contantOptions";

export interface RequireListItem {
  collect_time: string;
  create_by: string;
  creator: string;
  description: string;
  id: number;
  is_trash: boolean;
  level: number;
  name: string;
  origin: string;
  origin_path: string;
  parent_id: number;
  plan_name: string;
  product_id: number;
  product_module_id: number;
  product_module_name: string;
  status: number;
  statusName: string;
  version: string;
}

// 获取PRIORITY 的类型
export type PRIORITYINTER = Pick<typeof PRIORITY[0], "id" | "value" | "color">;

// 项目成员
export interface ProjectMembers {
  id: number;
  job_name: string;
  job_path: string;
  product_id: number;
  role: number;
  staff_name: string;
  staff_no: string;
}

// 审批列表单 TODO
export interface ApprovalItems {
  approval_no: string;
  create_at: string;
  create_by: string;
  create_name: string;
  id: number;
  next_approve_name: string;
  next_approve_no: string;
  prev_approve_name: string;
  prev_approve_no: string;
  product_id: number;
  product_name: string;
  status: number;
  step: number;
  submit_at: string;
  submit_by: string;
  submit_name: string;
  title: string;
}

export interface RequestInter {
  index?: number;
  name: string | number;
  level?: number;
  type?: number;
  origin_path: string;
  description: string;
  estimate: string;
  target_value: string;
  id: number;
}

export interface ApprovalEditForm {
  title: string;
  attachment: DementApprovalAttachment[];
  product_id?: number;
  id?: number;
  demand_list: RequestInter[];
}

export interface DemandApprovalItem {
  create_by: string;
  create_time: string;
  creator: string;
  delete_time: string;
  demand_status: number;
  description: string;
  id: number;
  level: number;
  name: string;
  origin: string;
  origin_path: string;
  origin_remark: string;
  parent_id: number;
  product_id: number;
  product_module_id: number;
  type: number;
}

export interface DementApprovalAttachment {
  addr: string;
  size: string;
  title: string;
}

export interface DemandApprovalDetails {
  approval_no: string;
  attachment: DementApprovalAttachment[];
  create_at: string;
  create_by: string;
  create_name: string;
  next_approve_no: string;
  next_approve_name: string;
  demand_list: RequestInter[];
  id: number;
  product_id: number;
  product_name: string;
  status: number;
  submit_by: string;
  submit_name: string;
  title: string;
  approve_user: {
    step_one_user: string;
    step_two_first_user: string;
    step_two_second_user: string;
    submit_user: string;
  };
}

export interface DemandApprovalLog {
  advice: string;
  approval_id: number;
  create_at: string;
  id: number;
  remark: string;
  staff_avatar: string;
  staff_name: string;
  staff_no: string;
  status: number;
  step: number;
}

export interface WorkItemForm {
  page_index?: number;
  page_size?: number;
  status?: null | number[];
  type?: null | number | [];
  times?: string[];
  end_time: string;
  start_time: string;
  sort_name?: string;
  sort_by?: number;
  name: string;
  product_id?: null | number;
  is_drawer?: number | undefined;
}

export interface ProductDynamic {
  page_index?: number;
  page_size?: number;
  type?: null | number;
  create_time?: string[];
  sort_name?: string;
  sort_by?: number;
  product_id?: null | number;
  create_by?: string[];
  create_by_no?: string[];
}

export interface ResponseDataSuccess {
  code: number;
  data: [] & Record<string, any>;
  message: string;
}

export interface Tree {
  id: number;
  label: string;
  level: number;
  node_type: number;
  order: number;
  parent_id: number;
  parent_label: string;
  wiki_count: number;
  children?: Tree[] | undefined;
}

export interface ClassifyHeader {
  id: number;
  name: string;
  level?: number;
  parent_id?: number;
}
export interface DragParams {
  id: number;
  order: number;
  parent_id: number;
}

export interface BtnArray {
  id: string | undefined;
  label: string;
  key: string;
}

export interface ListData {
  id?: number | string;
  value: number | string;
  label?: string;
  color?: string;
  staff_name?: string;
  staff_no?: string;
}

export interface SearchForm {
  type: string;
  selectType?: string;
  componentIndex?: number;
  label: string;
  key: string;
  val: number | string | string[] | number[] | any;
  multiple?: boolean;
  valueKey?: string[];
  showRecord?: boolean;
  listData?: ListData[];
  typeTime?: number;
}

export interface SearchArray {
  btnArray: BtnArray[];
  searchForm: SearchForm[];
}
