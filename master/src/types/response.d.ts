// 定义返回的数据接口格式
export declare namespace ResponseParams {
  export interface Iteration {
    code: number;
    details: string;
    error: string;
    list: [];
    message: string;
    total: number;
  }

  type List = {
    staff_no: string;
    job_name: string;
    job_path: string;
    staff_name: string;
  };
  export interface User {
    List: Array<List>;
    code: number;
    details: string;
    error: string;
    message: string;
  }
  export interface ProductList {
    count: number;
    data: {
      list: Array<{
        create_by: string;
        create_time: string;
        id: number;
        name: string;
        remark: string;
        status: number;
      }>;
    };
  }
  export interface DemandList {
    count: number;
    data: {
      list: Array<{
        create_by: string;
        create_time: string;
        id: number;
        name: string;
        remark: string;
        status: number;
      }>;
    };
  }
  export interface EmployeeList {
    job_name: string;
    job_path: string;
    staff_name: string;
    staff_no: string;
    isDisabled: boolean;
  }
  export interface ResponseDataSuccess {
    code: number;
    data: [] & Record<string, any>;
    message: string;
  }

  export interface ResponsePermissionSuccess {
    code: number;
    data: Record<string, unknown>;
    message: string;
  }

  export interface ResponseDataSuccessing {
    code: number;
    data: string;
    message: string;
  }

  export interface TaskList {
    code: number;
    data: {
      count: number;
      list: [
        {
          begin_time: string;
          complete_percent: number;
          create_by: string;
          create_time: string;
          end_time: string;
          hours: number;
          id: number;
          iteration_id: number;
          name: string;
          real_begin_time: string;
          real_end_time: string;
          remark: string;
          staff_name: string;
          staff_no: string;
          status: number;
          type: number;
        }
      ];
    };
    message: string;
  }

  export interface TabList {
    code: number;
    data: {
      count: number;
      list: [
        {
          create_time: string;
          env_id: number;
          id: number;
          is_encryption: number;
          key: string;
          last_visit_time: string;
          remark: string;
          value: string;
          version_id: number;
        }
      ];
    };
    message: string;
  }

  export interface employeeCalendarList {
    code: number;
    data: {
      count: number;
      list: [
        {
          name: string;
          user_calendar: [];
        }
      ];
    };
    message: string;
  }

  export interface RequireListItem {
    collect_time: string;
    create_by: string;
    creator: string;
    description: string;
    id: number;
    demand_status: number;
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
    approval_id: number;
    approval_title: string;
  }
}
