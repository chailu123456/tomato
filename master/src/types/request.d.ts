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
    collect_time?: string;
    name: string;
    product_id: number | string;
    create_by?: string;
    creator?: string;
    description: string;
    id?: number;
    status?: number;
    demand_status?: number;
    level: number;
    type: number;
    parent_id?: number;
    product_id: number;
    name: string;
    origin?: string;
    origin_path?: string;
    iteration_name?: string;
    child_list?: any;
    list?: any;
    origin_remark: string;
    product_module_id: number;
    product_module_name?: string;
    attachment: Record<string, any>;
  }
  interface GetUserDemandList {
    product_id: [];
  }
  interface GetDemandList {
    pageIndex: number;
    page_size: number;
    pageSize: number;
    status: number;
    product_id: number;
  }
  interface GetDemandListDetail {
    id: number;
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
    demand_docs: Array<{
      name: string;
      size: number;
      type: number;
      url: string | null;
      remark: string;
    }>;
    delay_list: Array<{ bug_id: number; iteration_id: number }>;
  }
  interface UpdatePlan {
    id: number | null;
    deliver_time: string;
    demand_ids: Array<number>;
    name: string;
    product_id: Record<string, any> | number | null;
    version: string;
    demand_docs: Array<{
      name: string;
      size: number;
      type: number;
      url: string | null;
      remark: string;
    }>;
    delay_list: Array<{ bug_id: number; iteration_id: number }>;
  }

  interface UpdatePlanList {
    id?: number | null;
    end_time: string;
    start_time: string;
    demand_ids: Array<number | string> | string;
    name: string;
    product_id?: number | null;
    create_by?: string;
    creator?: string;
    staff_no: string;
    staff_name: string;
    remark: string;
  }

  interface GetRelevanceDemandList {
    product_id: number | undefined;
    plan_id: number | undefined;
    is_bind: boolean | undefined;
  }

  interface UpdateEmployeeList {
    iteration_id: number | null | string;
    staff_no_list: Array<string>;
  }

  interface UpdateAppList {
    iteration_id: number | null;
    list: Array<Record<string, any>>;
  }

  interface UpdateDoc {
    quote_id: number;
    category: number;
    /**
     * 1:链接；2:文件
     */
    type: number;
    url: string;
  }
  interface CreateIteration {
    notify_url: string;
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
    is_schedule: number;
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
    complete_percent?: number;
    id: number;
    status: number;
  }

  interface UpdateTaskListLevel {
    ids: number[];
    level: number;
  }

  interface GiveTaskList {
    staff_name: string;
    task_ids: number[];
    staff_no: string;
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

  interface GetEnvList {
    pageIndex: number;
    pageSize: number;
    name: string;
  }

  interface DeleteEnvirmentList {
    id: number;
  }

  interface CreateAndUpdateEnvList {
    code: string;
    id: number;
    name: string;
    remark: string;
    is_sys?: boolean;
    create_time?: string;
    update_time?: string;
    sync_env_id?: number | string;
  }

  interface CreateAndUpdateAppList {
    code_language: string | null;
    git_url: string;
    id: number | null;
    name: string;
    remark: string;
    run_env: number | null;
  }

  interface GetConfigTab {
    appId: number;
  }

  interface GetConfigTabList {
    keyword?: string;
    type?: number;
    appId?: number;
    envId?: number;
    pageIndex: number;
    pageSize: number;
  }

  interface CreateAndUpdateConfigList {
    value?: string;
    key?: string;
    env: string;
    appId?: number;
    envId?: number;
    id: number | null;
    name?: string;
    remark: string;
  }

  interface DeleteCurrentApp {
    id: number | null;
  }

  interface deleteSyncConfigList {
    appId: number;
    envId: number;
    id?: number | null;
  }

  interface CreateSyncConfigList {
    appId?: number;
    envId?: number;
    name?: string;
    env?: string;
    type: number;
    src_env_id: number;
  }

  interface AddEnvirment {
    appId: number;
    env_id: number;
    name: string;
  }

  interface GlobalVar {
    envId: number;
    keyword: string;
    pageIndex: number;
    pageSize: number;
  }

  interface GetGlobalList {
    envId: number;
    keyword: string;
    pageIndex: number;
    pageSize: number;
  }

  interface CreateAndUpdateGlobalList {
    id: number | null;
    key: string;
    remark: string;
  }

  interface CreateAndUpdateGlobalEnv {
    env_id: number;
    key: string;
    value: string;
  }

  interface UpdateGlobalEnv {
    is_encryption: boolean;
    globalId: number;
    value: string;
  }

  interface DeleteGlobalList {
    globalKey: string;
  }

  interface DeleteGlobalEnvList {
    globalKey: string;
    envId: number;
  }

  interface GetGlobalTabList {
    key: string;
  }

  interface DecryptGlobalVal {
    text: string;
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
    notify_list: Array<Record<string, any>>;
  }
  interface UpdateAssignTask {
    bug_id: number;
    remark: string | null;
    staff_no: string | null;
  }

  interface GetPlan {
    create_by: Array<any>;
    name: string;
    product_id: Array<any>;
  }
  interface GetPlanListsTurnPage {
    create_by: string;
    name: string;
    page_index: number;
    page_size: number;
    product_id: number;
    demand_status: number;
  }
  interface UserIterationParams {
    month: string;
    pageIndex: number;
    pageSize: number;
  }

  interface GetTestParams {
    name: string;
    status: string;
    product_id: number;
    pageIndex: number;
    pageSize: number;
  }

  interface GetPeopleParams {
    staff_no_list: string[];
    iteration_ids: string[];
    plan_ids: string[];
    product_id: number;
    pageIndex: number;
    pageSize: number;
  }

  interface GetKnowledgeParams {
    keyword: string;
    classify_id: number;
    tag_ids: number[];
    pageIndex: number;
    pageSize: number;
  }

  interface updateDocument {
    comment_permission: number;
    classify_id: number;
    tag_id: number[];
    department: number[];
    team_worker: number[];
    content_id: string;
    id: number;
    link_share: number;
    open_share: number;
    root_classify_id: number;
    open_share: number;
    title: string;
    status?: number;
  }

  interface GetUseCaseList {
    pageIndex: number;
    pageSize: number;
    status?: number[];
    product_id: number;
    type?: number[];
    level?: number[];
    name: string;
    create_by?: string[];
    staff_no?: string[];
  }
  interface GetUseQualityList {
    pageIndex?: number;
    pageSize?: number;
    page_size?: number;
    status?: number;
    product_id: number;
    iteration_id: number;
    start_time: string;
    month: string;
    end_time: string;
  }

  interface RelativeTaskList {
    product_id: number;
    iteration_id: number;
    filter_type: number;
  }
  interface SelectTaskLevel {
    product_id: number;
    iteration_id?: number;
    filter_type?: number;
  }

  interface UpdateIterationDemand {
    iteration_id: number;
    demand_ids: number[];
  }
}
