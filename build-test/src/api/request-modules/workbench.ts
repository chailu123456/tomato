import axiosInstance from "../index";
import api from "../dict";
import { WorkItemForm, ProductDynamic } from "@/types/interface";
import { BackLogParamInter, GetCalendarParamsInter } from "@/composables/useDashboard";
/**
 * @description  仪表盘->剩余工作统计:
 * @returns {Promise<T>}
 */
export function getDashboardList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getDashboard);
}

/**
 * @description  我参与的项目列表
 * @returns {Promise<T>}
 */
export function getListParticipate<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getListParticipate);
}

/**
 * @description  工作时间轴
 * @returns {Promise<T>}
 */
export function getTimeline<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getTimeline);
}

/**
 * @description  工作项列表:
 * @param page_index 分页页码
 * @param page_size  分页页码
 * @param status 状态 1.未开始，2.进行中，3.已完成，4.已删除
 * @param name 名字，模糊查询
 * @param start_time 筛选开始时间
 * @param end_time 筛选结束时间
 * @param type 类型, 1.迭代，2.任务，3.bug，4.待办
 * @param sort_name 排序值
 * @param sort_by 排序顺序 1.正序 2.倒序
 * @returns {Promise<T>}
 */
export function getWorkTeam<T>(params: WorkItemForm): Promise<T> {
  params.start_time = params.start_time ? params.start_time + " 00:00:00" : "";
  params.end_time = params.end_time ? params.end_time + " 23:59:59" : "";
  delete params.times;
  delete params.sort_name;

  return axiosInstance.get<T>(api.getWorkTeam, params);
}

/**
 * @description  工作项列表:
 * @param page_index 分页页码
 * @param page_size  分页页码
 * @param status 状态 1.未开始，2.进行中，3.已完成，4.已删除
 * @param name 名字，模糊查询
 * @param start_time 筛选开始时间
 * @param end_time 筛选结束时间
 * @param type 类型, 1.迭代，2.任务，3.bug，4.待办
 * @param sort_name 排序值
 * @param sort_by 排序顺序 1.正序 2.倒序
 * @description  应用创建/更新
 * @returns {Promise<T>}
 */
export function getWorkTeamToDo<T>(params: WorkItemForm): Promise<T> {
  params.start_time = params.start_time ? params.start_time + " 00:00:00" : "";
  params.end_time = params.end_time ? params.end_time + " 23:59:59" : "";
  delete params.times;
  delete params.sort_name;
  return axiosInstance.get<T>(api.getWorkTeamToDo, params);
}

/**
 * @description  项目动态列表:
 * @param page_index 分页页码
 * @param page_size  分页页码
 * @param product_id 项目ID
 * @param create_by 创建人编号[]
 * @param start_time 筛选开始时间
 * @param end_time 筛选结束时间
 * @param type 类型, 1.迭代，2.任务，3.bug，4.待办
 * @param sort_name 排序值
 * @param sort_by 排序顺序 1.正序 2.倒序
 * @description  应用创建/更新
 * @returns {Promise<T>}
 */
export function getProductDynamic<T>(params: ProductDynamic): Promise<T> {
  if (!params.type) delete params.type;
  if (!params.create_by) delete params.create_by;
  if (params.create_by_no && params.create_by_no.length) {
    params.create_by = params.create_by_no;
  } else {
    delete params.create_by_no;
  }
  return axiosInstance.get<T>(api.getProductDynamic, params);
}

/**
 * @description  项目动态操作人下拉列表:
 * @returns {Promise<T>}
 */
export function getProductPeople<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getProductPeople);
}

/**
 * @description  工作项列表:
 * @param {number} ahead_time_enum 提醒时间枚举 1.开始时，2.提前5分钟，3.提前15分钟，4.提前30分钟，5.当天上班（9:00）6.提前一天上班（9:00）
 * @param {number[]}department 参与部门
 * @param {number} duration 时长
 * @param {string} end_time 结束时间
 * @param {string} start_time 开始时间
 * @param {string} start_time 开始时间
 * @param {number} filter_holiday 是否过滤节假日 0.不过滤 1.过滤
 * @param {number} id
 * @param {number} is_repeat 是否重复 0.不重复，1.每天重复，2.每周重复，3.每年重复
 * @param {string} name 名称
 * @param {string[]} participant 参与员工编号，记得加上当前登陆用户
 * @param {string} remark 备注
 * @param {string} remind_time 提醒备注
 * @returns {Promise<T>}
 */

export function handleBackLogApi<T>(params: BackLogParamInter): Promise<T> {
  return axiosInstance.post<T>(api.handleTomatoBackLog, params);
}
/**
 * @description  工作项日历列表:
 * @param GetCalendarParamsInter
 * @returns {Promise<T>}
 */

export function getCalendarListApi<T>(params: GetCalendarParamsInter): Promise<T> {
  return axiosInstance.get<T>(api.getCalenderList, params);
}

// 获取工作项待办详情
export function getBackLogDetailApi<T>(params: { id: number; month: string }): Promise<T> {
  const { id, month } = params;
  return axiosInstance.get<T>(api.handleTomatoBackLog + `/${id}?month=${month || ""}`);
}

// 操作待办状态
export function handleBackLogStatusApi<T>(params: GetCalendarParamsInter): Promise<T> {
  return axiosInstance.put<T>(api.handleTomatoBackLog + "/status", params);
}
// 删除待办
export function delCalenderBackLogApi<T>(params: { id: number; type: number; month: string }): Promise<T> {
  return axiosInstance.post<T>(api.delCalenderBackLog, params);
}
// 操作bug状态
export function updateBugStatusApi<T>(params: { id: number; status: number }): Promise<T> {
  return axiosInstance.put<T>(api.updateBugStatus, params);
}
// 操作bug状态
export function updateTaskStatusApi<T>(params: { id: number; status: number }): Promise<T> {
  return axiosInstance.put<T>(api.updateTaskList, params);
}

// 获取待办列表
export function getTomatoBackLogList<T>(params: { date: string }): Promise<T> {
  return axiosInstance.get<T>(api.handleTomatoBackLog, params);
}
