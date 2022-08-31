import { getDepartmentList, getEmployeeList, getStaffList } from "@/api/request-modules/common";
import { getIterationDemand } from "@/api/request-modules/iteration";
import { selectProductList } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { awaitFunc, setSession } from "@/utils";

/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 19:20:18
 * @LastEditTime: 2022-06-16 11:21:05
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useCommon.ts
 */
// 部门人员列表信息
export interface Department {
  department_code: string;
  name: string;
  p_department_code: string;
  son: Department[];
}

export interface ProjectItem {
  code: string;
  id: number;
  is_approval: number;
  name: string;
  state: number; // 1 未开始，2 进行中，3搁置 4 结项
  yapi_default_iteration_id: number;
  yapi_product_id: number;
}

// 项目成员下拉列表 接口响应类型
export interface StaffSelectResp {
  label: string; // 标签;
  options: {
    staff_no: string; // 成员编号;
    staff_name: string; // 成员名称;,
  }[];
}

// 需求下拉选择 接口响应类型
export interface DemandItemResp {
  id: number; // 需求ID;
  name: string; // 需求名称;
}

export default function useCommon() {
  // 获取部门人员列表
  const useGetDepartmentList = async (): Promise<Department[] | null> => {
    const [err, data]: [unknown, Department[] | null] = await awaitFunc<any, Department[]>({
      asyncFunc: getDepartmentList
    });
    if (err || !data) return null;
    return data;
  };
  // 获取项目列表
  const useGetProjectList = async (): Promise<ProjectItem[] | null> => {
    const [err, data]: [unknown, ProjectItem[] | null] = await awaitFunc<void, ProjectItem[]>({
      asyncFunc: selectProductList
    });
    if (err || !data) return null;
    return data;
  };

  // 设置项目缓存
  const setProjectCache = (list: ProjectItem[], iterId: number | null) => {
    const arr = list.map((item) => {
      return {
        iterationId: iterId,
        projectId: item.id,
        yapi_default_iteration_id: item.yapi_default_iteration_id
      };
    });

    setSession("cacheProject", JSON.stringify(arr));
  };

  // 根据部门id获取当前所有的员工
  const useGetEmployeeList = async (department_code: string): Promise<any | null> => {
    const [err, data]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<string, ResponseParams.ResponseDataSuccess>({
      asyncFunc: getEmployeeList,
      args: department_code
    });
    if (err || !data) return null;
    return data.data;
  };
  // 获取项目下的员工数据
  const useGetStaffList = async (params?: { product_id: number }): Promise<StaffSelectResp[] | null> => {
    const [err, data]: [unknown, StaffSelectResp[] | null] = await awaitFunc<{ product_id: number }, StaffSelectResp[]>({
      asyncFunc: getStaffList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 获取项目下的需求
  const useGetDemandList = async (params?: { product_id: number }): Promise<DemandItemResp[] | null> => {
    const [err, data]: [unknown, DemandItemResp[] | null] = await awaitFunc<{ product_id: number }, DemandItemResp[]>({
      asyncFunc: getIterationDemand,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  return {
    useGetDemandList,
    useGetStaffList,
    useGetEmployeeList,
    setProjectCache,
    useGetDepartmentList,
    useGetProjectList
  };
}
