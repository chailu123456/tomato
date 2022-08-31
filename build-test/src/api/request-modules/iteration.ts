import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
import { DemandReqItems } from "@/composables/useIteration";
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
 * @param product_id 项目id
 * @description  迭代下拉列表
 * @returns {Promise<T>}
 */
export function getDemandSelectList<T>(params: { product_id: number; status: number }): Promise<T> {
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
 * @param iteration_id  迭代id
 * @param list 应用列表
 * @description  更新维护应用
 * @returns {Promise<T>}
 */
export function updateAppList<T>(params: RequestParams.UpdateAppList): Promise<T> {
  return axiosInstance.put<T>(api.updateAppList, params);
}
/**
 * @param iteration_id  迭代id
 * @description   搁置迭代恢复
 * @returns {Promise<T>}
 */
export function reductionIterationStatus<T>(params: { iteration_id: number | null }): Promise<T> {
  return axiosInstance.put<T>(`${api.reductionIterationStatus}/${params.iteration_id}/restore`, params);
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
 * @param {Number} quote_id 引用的ID，不同的type引用的是不同的id，（1，2，3，4，5，6引用的是迭代ID）
   @param {Number} category 1:需求文档；2:原型文档；3:UI设计图；4:详细设计；5:测试用例；6:接口文档
   @param {Array} docs
    @param {Number} type 1:链接；2:文件
    @param {Number} name 文档名称
    @param {Number} size 文档尺寸
    @param {String} url 文档url地址
 * @description  更新文档(UI设计图/详细设计/测试用例)
 * @returns {Promise<T>}
 */
export function updateDocBatch<T>(params: DemandReqItems): Promise<T> {
  return axiosInstance.post<T>(api.updateDocBatch, params);
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
 * 更新迭代关联需求
 * @param iteration_id
 * @param demand_ids
 * @returns
 */
export function updateIterationDemand<T>(params: RequestParams.UpdateIterationDemand): Promise<T> {
  return axiosInstance.put<T>(api.updateIterationDemand, params);
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
export function getTaskList<T>(params: Record<string, any>): Promise<T> {
  if (params.expected_start_time && !params.expected_start_time.length) delete params.expected_start_time;
  delete params.times;
  delete params.time;
  const keyArr = ["status", "type", "level", "staff_no", "create_by"];
  for (let i = 0; i < keyArr.length; i++) {
    if (params[keyArr[i]] && !params[keyArr[i]].length) delete params[keyArr[i]];
    if (!params[keyArr[i]]) delete params[keyArr[i]];
  }

  return axiosInstance.get<T>(api.getTaskList, params);
}
/**
 * 获取任务详情
 * @param id
 * @returns
 */
export function getTaskDetail<T>(id: number): Promise<T> {
  return axiosInstance.get<T>(api.getTaskList + "/" + id);
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
export function updateTaskList<T>(params: Partial<RequestParams.UpdateTaskList>): Promise<T> {
  return axiosInstance.put<T>(api.updateTaskList, params);
}

/**
 * @param product_id 项目ID
   @param iteration_id 迭代ID
   @param filter_type 过滤类型：1=未关联迭代的任务
 * @description  任务下拉列表
 * @returns {Promise<T>}
 */
export function getBugTaskList<T>(params: { product_id: string | number; iteration_id?: string | null; filter_type?: number }): Promise<T> {
  if (!params.iteration_id) params.iteration_id = "0";
  return axiosInstance.get<T>(api.getBugTaskList, params);
}

/**
   @param ids 任务ID
   @param level 优先级
 * @description  更新任务优先级
 * @returns {Promise<T>}
 */
export function updateTaskListLevel<T>(params: RequestParams.UpdateTaskListLevel): Promise<T> {
  return axiosInstance.put<T>(api.updateTaskLevel, params);
}

/**
 * @param complete_percent 完成进度
   @param staff_no 指派员工工号
   @param staff_name 指派员工姓名
   @param task_ids 任务ID
 * @description  指派任务
 * @returns {Promise<T>}
 */
export function giveTask<T>(params: RequestParams.GiveTaskList): Promise<T> {
  return axiosInstance.post<T>(api.giveTaskList, params);
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
export function updateTask<T>(params: Record<string, any>): Promise<T> {
  return axiosInstance.put<T>(api.updateTask, params);
}

/**
 * @param id 任务id
 * @description  任务列表--任务详情
 * @returns {Promise<T>}
 */
export function detailTask<T>(id: string | number): Promise<T> {
  return axiosInstance.get<T>(`${api.detailTask}/${id}`);
}

/**
 * @param id 任务id
 * @description  任务列表--任务详情--动态记录
 * @returns {Promise<T>}
 */
export function detailTaskLog<T>(id: string | number): Promise<T> {
  return axiosInstance.get<T>(`${api.detailTaskLog}/${id}/logs`);
}

/**
 * @param product_id 项目id
 * @param iteration_id 迭代id
 * @description  任务创建人列表
 * @returns {Promise<T>}
 */
export function creatorTask<T>(params: { iteration_id: string; product_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.creatorTask, params);
}

/**
 * @param product_id 项目id
 * @param iteration_id 迭代id
 * @param filter_type 迭代id 过滤类型：1=未关联迭代的任务
 * @description  任务-关联任务弹窗列表
 * @returns {Promise<T>}
 */
export function relativeTask<T>(params: RequestParams.RelativeTaskList): Promise<T> {
  return axiosInstance.get<T>(api.relativeTask, params);
}

/**
 * @description  编辑任务 基础项编辑
 * @returns {Promise<T>}
 */
export function updateBasicTask<T>(params: Record<string, any>): Promise<T> {
  return axiosInstance.put<T>(api.updateBasicTask, params);
}

/**
   @param iteration_id 指派迭代id员工姓名
   @param task_ids 任务ID
 * @description  任务-关联任务弹窗-确定
 * @returns {Promise<T>}
 */
export function relativeTaskIteration<T>(params: { task_ids: number[]; iteration_id: number }): Promise<T> {
  return axiosInstance.post<T>(api.relativeTaskIteration, params);
}

/**
 * @description  删除任务
 * @returns {Promise<T>}
 */
export function deleteTask<T>(params: { ids: number[] }): Promise<T> {
  return axiosInstance.delete<T>(api.deleteTask, { data: params });
}

/**
 * @param month 日历展示月份
 * @param iteration_id 迭代ID
 * @description  迭代日历
 * @returns {Promise<T>}
 */
export function getCalendarLists<T>(params: {
  month: string;
  iteration_id?: Array<number>;
  product_id: number | null;
  name: string;
  stage: number;
}): Promise<T> {
  return axiosInstance.get<T>(api.getCalendarLists, params);
}

/**
 * @param project_id 项目id
 * @param plan_id 计划id
 * @description  迭代主页-新增和编辑
 * @returns {Promise<T>}
 */
export function getIterationPlanList<T>(params: { product_id: number; plan_id?: number }): Promise<T> {
  return axiosInstance.get<T>(api.getIterationPlanList, params);
}
/**
 * @param product_id 是项目id
 * @param iteration_id 迭代id
 * @description  获取当前迭代员工列表
 * @returns {Promise<T>}
 */
export function getIterationEmployeeList<T>(params: { product_id: string; iteration_id?: string | null }): Promise<T> {
  if (!params.iteration_id) params.iteration_id = "0";
  return axiosInstance.get<T>(api.getIterationEmployeeList, params);
}
/**
 * @param product_id 是项目id
 * @param with_plan_id 计划id(计划管理中编辑时是计划id，新增时则为0)
 * @description  获取当前迭代需求列表
 * @returns {Promise<T>}
 */
export function getIterationDemand<T>(params: {
  product_id: number;
  with_plan_id?: number;
  iteration_id?: null | number | string;
  with_iteration_id?: number | string;
}): Promise<T> {
  return axiosInstance.get<T>(api.getIterationDemand, params);
}

/**
 * @param iteration_id 是迭代id
 * @param remark 风险备注
 * @description  /tomato/iteration/risk-warning
 * @returns {Promise<T>}
 */
export function updateRiskWarning<T>(params: { iteration_id: number; remark: string }): Promise<T> {
  return axiosInstance.put<T>(api.updateRiskWarning, params);
}

/**
 * @description  产品-迭代级联选择器
 * @returns {Promise<T>}
 */
export function getIterationCascader<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getIterationCascader);
}

/**
 *
 * @param month  月份
 * @param pageIndex  分页索引
 * @param pageSize   分页大小
 * @description 获取员工迭代视图
 * @returns {Promise<T>}
 */
export function getEmployeeCalendarList<T>(params: RequestParams.UserIterationParams): Promise<T> {
  return axiosInstance.get<T>(api.getEmployeeCalendarList, params);
}

/**
 *
 * @param staff_no  月份
 * @param certain_day  分页索引
 * @description 个人闲忙日历详情
 * @returns {Promise<T>}
 */
export function getEmployeeCalendarDetails<T>(params: { staff_no: string; certain_day: string; year?: string }): Promise<T> {
  return axiosInstance.get<T>(api.getEmployeeCalendarDetails, params);
}

/**
 *
 * @param iteration_id  迭代ID
 * @description 获取统计视图数据
 * @returns {Promise<T>}
 */
export function getStatisticsData<T>(params: number | string | null): Promise<T> {
  return axiosInstance.get<T>(`${api.getStatisticsData}/${params}`);
}
/**
 * @param name  迭代名称
 * @param status  状态
 * @param product_id   项目ID
 * @description 测试概览
 * @returns {Promise<T>}
 */
export function getTestList<T>(params: RequestParams.GetTestParams): Promise<T> {
  return axiosInstance.get<T>(api.getTestOverflowList, params);
}

/**
 * @param iteration_id 是迭代id
 * @param remark 风险备注
 * @description  更新测试概览备注
 * @returns {Promise<T>}
 */
export function updateTestRemark<T>(params: { iteration_id: number; remark: string }): Promise<T> {
  return axiosInstance.put<T>(api.editTestOverflowRemark, params);
}

/**
 * @param staff_no_list  员工工号列表
 * @param iteration_id_list  当前迭代ID列表
 * @param plan_id_list   迭代计划ID列表
 * @description 人员排布列表
 * @returns {Promise<T>}
 */
export function getPeopleList<T>(params: RequestParams.GetPeopleParams): Promise<T> {
  return axiosInstance.get<T>(api.getPeopleList, params);
}

/**
 * @param product_id id
 * @param staff_no 员工id
 * @description  人员排布--关联计划
 * @returns {Promise<T>}
 */
export function relativePeoplePlan<T>(params: { product_id: number; staff_no: string }): Promise<T> {
  return axiosInstance.get<T>(api.relativePeoplePlan, params);
}

/**
 * @param product_id id
 * @param status_list 状态
 * @description  人员排布--迭代计划
 * @returns {Promise<T>}
 */
export function getPlanSelect<T>(params: { product_id: number; status_list?: number[] }): Promise<T> {
  return axiosInstance.get<T>(api.getPlanList, params);
}

/**
 * @param product_id id
 * @param plan_ids 计划id
 * @param staff_no 员工id
 * @description  人员排布--关联计划-编辑
 * @returns {Promise<T>}
 */
export function updateRelativePeoplePlan<T>(params: { product_id: number; plan_ids: number[]; staff_no: string }): Promise<T> {
  return axiosInstance.put<T>(api.editRelativePeoplePlan, params);
}

/**
 * @param product_id id
 * @param remark 风险备注
 * @param staff_no 员工id
 * @description  人员排布列表备注
 * @returns {Promise<T>}
 */
export function updatePeopleRemark<T>(params: { product_id: number; remark: string; staff_no: string }): Promise<T> {
  return axiosInstance.put<T>(api.editPeopleRemark, params);
}

/**
 * @param pageSize 每页大小
 * @param pageIndex  当前页
 * @param product_id  项目ID
 * @param status 状态，用例结果 -1.全部 1.已通过 2.未通过 3.阻塞 4.锁定 5.未执行
 * @param type 类型，用例类型 -1.全部 1.冒烟 2.功能
 * @param name 标题，模糊查询
 * @param create_by 创建人
 * @description  用例列表
 * @returns {Promise<T>}
 */
export function getUseCaseData<T>(params: RequestParams.GetUseCaseList): Promise<T> {
  if (!params.type) {
    params.type = [1, 2];
  }
  return axiosInstance.get<T>(api.getUseCaseData, params);
}

/**

 * @param iteration_id   迭代ID
 * @description  用例列表 ---创建人下拉
 * @returns {Promise<T>}
 */
export function getUseCaseStaff<T>(params: { iteration_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.getUseCaseStaff, params);
}

/**
 * @param ids id
 * @param status 状态
 * @description  更新测试用例状态
 * @returns {Promise<T>}
 */
export function updateUseCaseStatus<T>(params: { ids: number[]; status: number }): Promise<T> {
  return axiosInstance.put<T>(api.updateUseCaseStatus, params);
}

/**
 * @param ids id
 * @description  删除测试用例  包含批量
 * @returns {Promise<T>}
 */
export function deleteUseCaseStatus<T>(params: { ids: number[] }): Promise<T> {
  return axiosInstance.post<T>(api.deleteUseCaseStatus, params);
}

/**
 * @param ids id
 * @description  更新测试用例备注
 * @returns {Promise<T>}
 */
export function updateUseCaseRemark<T>(params: { ids: number; remark: string }): Promise<T> {
  return axiosInstance.put<T>(api.updateUseCaseRemark, params);
}

/**
 * @param id  用例id
 * @param status 状态，用例结果 -1.全部 1.已通过 2.未通过 3.阻塞 4.锁定 5.未执行
 * @param type 类型，用例类型 -1.全部 1.冒烟 2.功能
 * @param name 用例名称
 * @param output 输出
 * @param level 等级
 * @param input 输入
 * @param premise 前提
 * @param remark 备注
 * @description  编辑测试用例
 * @returns {Promise<T>}
 */
export function editUseCaseData<T>(params: any): Promise<T> {
  return axiosInstance.put<T>(api.editUseCaseData, params);
}

/**
 * @param status 状态，用例结果 -1.全部 1.已通过 2.未通过 3.阻塞 4.锁定 5.未执行
 * @param type 类型，用例类型 -1.全部 1.冒烟 2.功能
 * @param name 用例名称
 * @param output 输出
 * @param level 等级
 * @param input 输入
 * @param premise 前提
 * @param remark 备注
 * @description  编辑测试用例
 * @returns {Promise<T>}
 */
export function addUseCaseData<T>(params: any): Promise<T> {
  return axiosInstance.post<T>(api.addUseCaseData, params);
}

// 获取项目权限
export function checkProductPermission<T>(productId: string | number): Promise<T> {
  return axiosInstance.get<T>(`${api.getProductPermission}/${productId}/check-permissions`);
}

/**
 * @param product_id 项目ID
 * @description  测试用例下拉列表
 * @returns {Promise<T>}
 */
export function getUseCaseList<T>(params: { product_id: string | number }): Promise<T> {
  return axiosInstance.get<T>(api.getUseCaseList, params);
}
