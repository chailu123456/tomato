import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 *
 * @param status  状态
 * @param pageIndex  分页索引
 * @param pageSize   分页大小
 * @description 获取看板列表
 * @returns {Promise<T>}
 */
export function getIterationList<T>(params: RequestParams.IterationParams): Promise<T> {
  return axiosInstance.get<T>(api.getIterationList, params);
}

/**
 * @param status 迭代状态,-1全部,0未开始，1设计中，2开发中，3联调中，4测试中，5待发版，6已发版
 * @param id  迭代详情id
 * @description 获取迭代详情
 * @returns {Promise<T>}
 */
export function getIterationDetail<T>(id: number): Promise<T> {
  return axiosInstance.get<T>(api.getIterationDetail + id);
}

/**
 * @param status 迭代状态,-1全部,0未开始，1设计中，2开发中，3联调中，4测试中，5待发版，6已发版
 * @description  迭代需求下拉列表
 * @returns {Promise<T>}
 */
export function getDemandSelectList<T>(params?: { status: number }): Promise<T> {
  return axiosInstance.get<T>(api.getDemandSelectList, params);
}

/**
 * @param model  成员列表
 * @description  更新维护成员
 * @returns {Promise<T>}
 */
export function updateEmployeeList<T>(params: RequestParams.UpdateEmployeeList): Promise<T> {
  return axiosInstance.put<T>(api.updateEmployeeList, params);
}

/**
 * @param model  应用列表
 * @description  更新应用
 * @returns {Promise<T>}
 */
export function updateAppList<T>(params: RequestParams.UpdateAppList): Promise<T> {
  return axiosInstance.put<T>(api.updateAppList, params);
}

/**
 * @param quote_id 引用的ID，不同的type引用的是不同的id，（1、2引用的是计划ID，3，4，5引用的是迭代id）
   @param type 1:需求文档；2:原型文档；3:UI设计图；4:详细设计；5:测试用例
   @param url 文档url地址
 * @description  更新文档(UI设计图/详细设计/测试用例)
 * @returns {Promise<T>}
 */
export function updateDoc<T>(params: RequestParams.UpdateDoc): Promise<T> {
  return axiosInstance.post<T>(api.updateDoc, params);
}

/**
 * @param iteration_id 迭代版本号ID(工号)
 * @param status 迭代状态，0未开始，1设计中，2开发中，3联调中，4测试中，5待发版，6已发版
 * @description  更新迭代状态
 * @returns {Promise<T>}
 */
export function updateIterationStatus<T>(params: { iteration_id: number; status: number }): Promise<T> {
  return axiosInstance.put<T>(api.updateIterationStatus, params);
}

/**
 * @param backend_manager {staff_name} 员工名字 { staff_no } 员工号
   @param dev_time 开发时间
   @param frontend_manager {staff_name} 员工名字 { staff_no } 员工号
   @param id ID迭代版本号
   @param iteration_manager {staff_name} 员工名字 { staff_no } 员工号
   @param name 迭代名称
   @param plan_id 计划ID
   @param release_time 发版时间
   @param test_manager {staff_name} 员工名字 { staff_no } 员工号
   @param test_time 提测时间
   @param union_time 联调时间
 * @description  创建/更新迭代
 * @returns {Promise<T>}
 */
export function createIteration<T>(params: RequestParams.CreateIteration): Promise<T> {
  return axiosInstance.post<T>(api.createIteration, params);
}

/**
 * @param pageSize 每页大小
 * @param pageIndex  当前页
 * @param iteration_id 迭代ID
 * @param status 状态，-1全部;0未开始;1进行中;2已完成;3已关闭;4已延期;5已搁置;999已删除
 * @param type 类型，-1全部；0其他；1设计；2开发；3联调；
 * @param name 名字，模糊查询
 * @param staff_no 指派人员(工号)
 * @description  任务列表
 * @returns {Promise<T>}
 */
export function getTaskList<T>(params: RequestParams.GetTaskList): Promise<T> {
  return axiosInstance.get<T>(api.getTaskList, params);
}

/**
 * @param begin_time 开始日期
   @param end_time 结束日期
   @param hours 工时
   @param iteration_id 迭代版本号ID
   @param name 任务名称
   @param remark 备注
   @param staff_name 员工姓名
   @param staff_no 员工工号
   @param type 类型：0其他；1设计；2开发；3联调
 * @description  更新任务状态
 * @returns {Promise<T>}
 */
export function createTaskList<T>(params: Array<RequestParams.CreateTaskList>): Promise<T> {
  return axiosInstance.post<T>(api.createTaskList, params);
}

/**
 * @param complete_percent 完成进度
   @param id 任务ID
   @param status 任务状态
 * @description  更新任务状态
 * @returns {Promise<T>}
 */
export function updateTaskList<T>(params: RequestParams.UpdateTaskList): Promise<T> {
  return axiosInstance.put<T>(api.updateTaskList, params);
}

/**
 * @param begin_time 开始日期
   @param end_time 结束日期
   @param hours 工时
   @param iteration_id 迭代版本号ID
   @param name 任务名称
   @param remark 备注
   @param staff_name 员工姓名
   @param staff_no 员工工号
   @param type 类型：0其他；1设计；2开发；3联调
 * @description  更新任务状态
 * @returns {Promise<T>}
 */
export function updateTask<T>(params: RequestParams.CreateTaskList): Promise<T> {
  return axiosInstance.put<T>(api.updateTask, params);
}

/**
 * @param month 日历展示月份
 * @param iteration_id 迭代ID
 * @description  迭代日历
 * @returns {Promise<T>}
 */
export function getCalendarLists<T>(params: { month: string; iteration_id?: number }): Promise<T> {
  return axiosInstance.get<T>(api.getCalendarLists, params);
}

/**
 * @param is_available 是否只查询可关联计划
 * @description  计划管理-产品-计划级联选择器
 * @returns {Promise<T>}
 */
export function getPlanCascader<T>(is_available: boolean): Promise<T> {
  return axiosInstance.get<T>(api.getPlanCascader, { is_available });
}
