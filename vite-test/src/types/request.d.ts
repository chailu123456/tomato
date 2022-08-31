export declare namespace RequestParams {
  interface Login {
    name: string;
  }

  interface CreateProductParams {
    name: string;
    remark: string;
  }
  interface UpdateProductParams {
    name: string;
    remark: string;
    id: number;
  }
  interface GetProductList {
    name: string;
    // manager: string;
    pageIndex: number;
    pageSize: number;
  }
  interface UpdateStatus {
    id: number;
    status: number;
  }
  interface IterationParams {
    status: number;
    pageIndex: number;
    pageSize: number;
  }
  interface CreateDemand {
    name: string;
    product_id: number | string;
  }
  interface GetDemandList {
    pageIndex: number;
    pageSize: number;
    status: number;
    product_id: number;
  }
  interface PutDemand {
    id: number;
    product_id: number;
    name: string;
    child_list: {
      id: number;
      name: string;
    };
  }
  interface CreatePlan {
    deliver_time: string;
    demand_ids: Array<number>;
    name: string;
    product_id: Record<string, any> | number | null;
    version: string;
  }
  interface UpdatePlan {
    prototype_doc: string;
    remark: string;
    demand_doc: string;
    id: number | null;
    deliver_time?: string;
    demand_ids: Array<number>;
    name: string;
    product_id: Record<string, any> | number | null;
    version: string;
  }

  interface GetRelevanceDemandList {
    product_id: number | undefined;
    plan_id: number | undefined;
    is_bind: boolean | undefined;
  }

  interface UpdateEmployeeList {
    iteration_id: number;
    staff_no_list: Array<string>;
  }

  interface UpdateAppList {
    iteration_id: number;
    app_id_list: Array<string>;
  }

  interface UpdateDoc {
    quote_id: number;
    type: number;
    url: string;
  }
  interface CreateIteration {
    backend_manager: {
      staff_name: string | null;
      staff_no: string | null;
    };
    dev_time: string | null;
    frontend_manager: {
      staff_name: string | null;
      staff_no: string | null;
    };
    id: number | null;
    iteration_manager: {
      staff_name: string | null;
      staff_no: string | null;
    };
    name: string | null;
    plan_id: number | null;
    release_time: string | null;
    test_manager: {
      staff_name: string | null;
      staff_no: string | null;
    };
    test_time: string | null;
    union_time: string | null;
  }

  interface GetTaskList {
    pageIndex: number;
    pageSize: number;
    status: number;
    iteration_id: number;
    type: number;
    name: number;
    staff_no: string;
  }

  interface UpdateTaskList {
    complete_percent: number;
    id: number;
    status: number;
  }
  interface CreateTaskList {
    begin_time: string;
    end_time: string;
    hours: number;
    iteration_id: number;
    name: string;
    remark: string;
    staff_name: string;
    staff_no: string;
    type: number;
  }

  interface GetBugList {
    pageIndex: number;
    pageSize: number;
    iteration_id: number;
    status: number;
    name: string;
    staff_no: string;
  }
  interface UpdateBugStatus {
    create_by: string;
    create_time: string;
    creator: string;
    description: string;
    end_time: string;
    id: number;
    iteration_id: number;
    level: number;
    name: string;
    staff_name: string;
    staff_no: string;
    status: number;
  }

  interface GetApplyTestList {
    id: number;
  }

  interface UpdateBug {
    description: string;
    id: number;
    iteration_id: number;
    level: number;
    name: string;
    staff_name: string;
    staff_no: string;
  }
  interface GetAppList {
    pageIndex: number;
    pageSize: number;
    name?: string;
  }

  interface CreateAndUpdateAppList {
    code_language: string;
    git_url: string;
    id: number | null;
    name: string;
    remark: string;
    run_env: number | null;
  }

  interface AttachList {
    id: number;
    name: string;
    size?: number;
    url: string;
  }

  interface EditDemand {
    attach_list: AttachList[];
    id: number;
    demand_ids: number[];
    influence: string;
    precaution: string;
  }

  interface EditApplyTest {
    id: number;
    to_status: number;
    remark: string;
  }
}
