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
    data: [];
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
}
