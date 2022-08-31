import { getDemandSelectList, getIterationDetail, getTaskDetail, updateTaskList } from "@/api/request-modules/iteration";
import { selectProductList } from "@/api/request-modules/product";
import { getBugDetail } from "@/api/request-modules/test";
import {
  delCalenderBackLogApi,
  getBackLogDetailApi,
  getCalendarListApi,
  handleBackLogApi,
  handleBackLogStatusApi,
  updateBugStatusApi
} from "@/api/request-modules/workbench";
import { awaitFunc, setSession } from "@/utils";
import { ref } from "vue";

export interface BaseBackLogInter {
  ahead_time_enum?: number;
  duration: number;
  end_time: string;
  filter_holiday: number;
  id?: number;
  is_repeat: number;
  name: string;
  remark: string;
  remind_time?: number;
  start_time: string;
}
// 待办请求参数
export interface BackLogParamInter extends BaseBackLogInter {
  department: number[];
  participant: string[];
}

// 待办返回数据
export interface BackLogItemInter extends BaseBackLogInter {
  department: { is_department: boolean; staff_name: string; staff_no: string }[];
  participant: { staff_name: string; staff_no: string }[];
  status: number; // 状态 0.待办 1.完成 2.删除
}

export interface CalendarParamsInter {
  year: number;
  month: number;
}

export interface CalendarItemInter {
  end_time: string;
  id: number;
  product_id: number; // 工作项ID
  iteration_node: string; // 迭代节点
  iteration_id: number; // 迭代
  name: string;
  start_time: string;
  status: number; // 状态 1.未开始，2.进行中，3.已完成，4.已删除
  target_id: number;
  type: number; // 类型 1.迭代，2.任务，3.bug，4.待办
}

export interface CalendarInter {
  date: string;
  list: CalendarItemInter[];
}

export interface IterationItemFieldInter {
  staff_no: string;
  staff_name: string;
  avatar: string;
}

export interface IterationItemInter {
  backend_manager: IterationItemFieldInter;
  complete_percent: number;
  dev_time: string;
  done_hour: number;
  fixed_bug: number;
  iteration_node: string; // 迭代节点
  frontend_manager: IterationItemFieldInter;
  id: number;
  is_schedule: number;
  iteration_manager: IterationItemFieldInter;
  name: string;
  notify_url: string;
  real_dev_time: string;
  real_release_time: string;
  real_test_time: string;
  real_union_time: string;
  release_time: string;
  stage: number;
  status: number;
  test_manager: IterationItemFieldInter;
  test_time: string;
  time_percent: number;
  today_bug: number;
  today_hour: number;
  today_percent: number;
  total_bug: number;
  total_hour: number;
  union_percent: number;
  union_time: string;
  verified_bug: number;
  warning: string;
}

export interface ProductItemInter {
  // 项目item
  code: string;
  create_by: string;
  create_time: string;
  id: number;
  is_approval: number;
  is_report: number;
  name: string;
  notify_url: string;
  remark: string;
  status: number;
  yapi_default_iteration_id: number;
  yapi_product_id: number;
}

export interface TaskItemInter {
  // 任务详情
  begin_time: string;
  end_time: string;
  hours: number;
  id: number;
  iteration_id: number;
  iteration_name: string;
  level: number;
  name: string;
  status: number;
}

export interface BugItemInter {
  // bug详情
  attachment: any[];
  create_by: string;
  create_time: string;
  creator: string;
  delete_time: string;
  description: string;
  end_time: string;
  env: number;
  id: number;
  iteration_id: number;
  iteration_name: string;
  level: number;
  list: { info: string; create_time: string }[];
  name: string;
  product_id: number;
  product_name: string;
  staff_name: string;
  staff_no: string;
  status: number;
  type: number;
  update_time: string;
}

export interface GetCalendarParamsInter {
  id?: number;
  month: string;
  name?: string;
  type?: number; // 类型, 1.迭代，2.任务，3.bug，4.待办
  status?: number; // 状态 1.未开始，2.进行中，3.已完成
}

export type DialogType = "abeyancen" | "task" | "iteration" | "bug";

export default function useDashboard() {
  const productList: ProductItemInter[] = [];
  // 日历 元素
  const calendar = ref();
  // 日历 数据
  const calendarList = ref<CalendarInter[]>();
  // 获取项目list
  const useGetProductList = async (): Promise<ProductItemInter[] | null> => {
    const [err, data]: [unknown, ProductItemInter[] | null] = await awaitFunc<void, ProductItemInter[]>({
      asyncFunc: selectProductList
    });
    if (err || !data) return null;
    productList.length = 0;
    productList.push(...data);
    return data;
  };

  // 获取项目list
  const useGetDemandSelectList = async (params: { product_id: number; status: number }): Promise<ProductItemInter[] | null> => {
    const [err, data]: [unknown, ProductItemInter[] | null] = await awaitFunc<{ product_id: number; status: number }, ProductItemInter[]>({
      asyncFunc: getDemandSelectList,
      args: params
    });
    if (err || !data) return null;
    productList.length = 0;
    productList.push(...data);
    return data;
  };

  // 编辑待办
  const useSaveBackLog = async (params: BackLogParamInter): Promise<BackLogItemInter | null> => {
    const [err, data]: [unknown, BackLogItemInter | null] = await awaitFunc<BackLogParamInter, any>({
      asyncFunc: handleBackLogApi,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 操作待办状态
  const useHandleBackLogStatus = async (params: GetCalendarParamsInter): Promise<boolean> => {
    const [err]: [unknown, any] = await awaitFunc<GetCalendarParamsInter, any>({
      asyncFunc: handleBackLogStatusApi,
      args: params
    });
    if (err) return false;
    return true;
  };
  // 删除待办
  const useDelCalenderBackLog = async (params: { id: number; type: number; month: string }): Promise<boolean> => {
    const [err]: [unknown, any] = await awaitFunc<{ id: number; type: number; month: string }, any>({
      asyncFunc: delCalenderBackLogApi,
      args: params
    });
    if (err) return false;
    return true;
  };

  // 工作项日历列表
  const useGetCalendarList = async (params: GetCalendarParamsInter): Promise<CalendarInter[] | null> => {
    const [err, data]: [unknown, CalendarInter[] | null] = await awaitFunc<GetCalendarParamsInter, CalendarInter[]>({
      asyncFunc: getCalendarListApi,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 获取迭代详情
  const useGetIterationDetail = async (id: number): Promise<IterationItemInter | null> => {
    const [err, data]: [unknown, IterationItemInter | null] = await awaitFunc<number, IterationItemInter>({
      asyncFunc: getIterationDetail,
      args: id
    });
    if (err || !data) return null;
    return data;
  };

  // 获取待办详情
  const useGetBackLogDetail = async (params: { id: number; month?: string }): Promise<BackLogItemInter | null> => {
    const [err, data]: [unknown, BackLogItemInter | null] = await awaitFunc<{ id: number; month?: string }, BackLogItemInter>({
      asyncFunc: getBackLogDetailApi,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 获取bug详情
  const useGetBugDetail = async (id: number): Promise<BugItemInter | null> => {
    const [err, data]: [unknown, BugItemInter | null] = await awaitFunc<number, BugItemInter>({
      asyncFunc: getBugDetail,
      args: id
    });
    if (err || !data) return null;
    return data;
  };

  // 操作待办状态
  const useUpdateBugStatus = async (params: { id: number; status: number }): Promise<boolean> => {
    const [err]: [unknown, any] = await awaitFunc<{ id: number; status: number }, any>({
      asyncFunc: updateBugStatusApi,
      args: params
    });
    if (err) return false;
    return true;
  };
  // 获取Task详情
  const useGetTaskDetail = async (id: number): Promise<TaskItemInter | null> => {
    const [err, data]: [unknown, TaskItemInter | null] = await awaitFunc<number, TaskItemInter>({
      asyncFunc: getTaskDetail,
      args: id
    });
    if (err || !data) return null;
    return data;
  };
  // 操作待办状态
  const useHandleTaskStatus = async (params: { ids: number[]; status: number }): Promise<boolean> => {
    const [err]: [unknown, any] = await awaitFunc<{ ids: number[]; status: number }, any>({
      asyncFunc: updateTaskList,
      args: params
    });
    if (err) return false;
    return true;
  };

  // 处理项目数据缓存
  const useHandleProductCache = async (productId: number, hasList = false) => {
    await useGetProductList();
    if (hasList && !productList.length) return false;
    const item = productList.find((i) => i.id === productId);
    if (item) {
      setSession("productId", String(item.id));
      setSession("productInfo", JSON.stringify(item));
      return true;
    }
    return false;
  };

  // 获取日历接口数据
  const useGetCarlenderInfo = async (params: GetCalendarParamsInter) => {
    const data = await useGetCalendarList(params);
    try {
      calendar.value && Object.keys(calendar.value)?.length > 2 && setSession("calendar", calendar.value);
    } catch (e) {
      console.log(e);
    }
    if (data) {
      calendarList.value = data;
      return data;
    }
  };

  // 时长选项
  const timeOpts = [
    {
      id: 0,
      label: "无"
    },
    {
      id: 1,
      label: "30分钟"
    },
    {
      id: 2,
      label: "1小时"
    },
    {
      id: 3,
      label: "2小时"
    },
    {
      id: 4,
      label: "3小时"
    },
    {
      id: 5,
      label: "4小时"
    },
    {
      id: 6,
      label: "8小时"
    },
    {
      id: 7,
      label: "自定义时间"
    }
  ];
  // 提醒
  const noticeOpts = [
    {
      id: 1,
      label: "开始时"
    },
    {
      id: 2,
      label: "提前5分钟"
    },
    {
      id: 3,
      label: "提前15分钟"
    },
    {
      id: 4,
      label: "提前30分钟"
    },
    {
      id: 5,
      label: "当天上班(9:00)"
    },
    {
      id: 6,
      label: "提前一天上班(9:00)"
    }
  ];
  // 重复
  const repeatOpt = [
    {
      id: 0,
      label: "不重复"
    },
    {
      id: 1,
      label: "每天重复"
    },
    {
      id: 2,
      label: "每周重复"
    },
    {
      id: 3,
      label: "每年重复"
    }
  ];

  return {
    useDelCalenderBackLog,
    useUpdateBugStatus,
    useSaveBackLog,
    useGetCalendarList,
    useGetIterationDetail,
    useGetBackLogDetail,
    useGetBugDetail,
    useGetTaskDetail,
    useGetProductList,
    useGetDemandSelectList,
    useHandleProductCache,
    useHandleBackLogStatus,
    useHandleTaskStatus,
    useGetCarlenderInfo,
    productList,
    timeOpts,
    noticeOpts,
    repeatOpt,
    calendar,
    calendarList
  };
}
