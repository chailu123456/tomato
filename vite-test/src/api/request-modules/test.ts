import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 * @param pageSize 每页大小
 * @param pageIndex  当前页
 * @param iteration_id 迭代ID
 * @param status 状态，-1全部;0待解决;1进行中;2已解决;3已关闭;4已关闭;999已作废;
 * @param name 名字，模糊查询
 * @param staff_no 指派人员(工号)
 * @description  更新任务状态
 * @returns {Promise<T>}
 */
export function getBugList<T>(params: RequestParams.UpdateTaskList): Promise<T> {
  return axiosInstance.get<T>(api.getBugList, params);
}

/**
 * @param create_by 创建人工号
 * @param create_time  创建时间
 * @param creator 创建人名字
 * @param description bug描述
 * @param end_time 解决日期
 * @param iteration_id 迭代版本号ID(工号)
 * @param level 级别：1一般;2中等;3严重
 * @param name BUG名称
 * @param staff_name 指派员工姓名
 * @param staff_no 指派员工工号
 * @param status 状态：0待解决;1进行中;2已解决;3已关闭;4已关闭;
 * @description  更新bug状态
 * @returns {Promise<T>}
 */
export function updateBugStatus<T>(params: RequestParams.UpdateBugStatus): Promise<T> {
  return axiosInstance.put<T>(api.updateBugStatus, params);
}

/**
 * @param description bug描述
 * @param iteration_id 迭代版本号ID(工号)
 * @param level 级别：1一般;2中等;3严重
 * @param name BUG名称
 * @param staff_name 指派员工姓名
 * @param staff_no 指派员工工号
 * @param id bug ID
 * @description  更新bug
 * @returns {Promise<T>}
 */
export function updateBug<T>(params: RequestParams.UpdateBug): Promise<T> {
  return axiosInstance.put<T>(api.updateBug, params);
}

/**
 * @param description bug描述
 * @param iteration_id 迭代版本号ID(工号)
 * @param level 级别：1一般;2中等;3严重
 * @param name BUG名称
 * @param staff_name 指派员工姓名
 * @param staff_no 指派员工工号
 * @description  创建bug
 * @returns {Promise<T>}
 */
export function createBug<T>(params: Omit<RequestParams.UpdateBug, "id">): Promise<T> {
  return axiosInstance.post<T>(api.createBug, params);
}

/**
 * @param id 迭代版本号ID(工号)
 * @returns {Promise<T>}
 */
export function getApplyTest<T>(params: RequestParams.GetApplyTestList): Promise<T> {
  return axiosInstance.get<T>(`${api.getApplyTestList + "/" + params.id}`, "");
}

/**
 * @param attachList 相关配置
 * @param demand_ids 提测需求ID,多个以逗号隔开
 * @param id 迭代ID
 * @param influence 影响范围
 * @param precaution 注意事项
 * @description  编辑提测内容
 * @returns {Promise<T>}
 */
export function editApplyTest<T>(params: RequestParams.EditDemand): Promise<T> {
  return axiosInstance.post<T>(api.editTestContent, params);
}

/**
 * @param remark 备注
 * @param to_status 下阶段状态，1：提测驳回，2：待测试，3：测试中，4：测试完成，5：已发布
 * @param id 迭代ID
 * @description  申请提测
 * @returns {Promise<T>}
 */
export function ApplyTest<T>(params: RequestParams.EditApplyTest): Promise<T> {
  return axiosInstance.post<T>(api.applyTest, params);
}
