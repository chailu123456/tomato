import { getDepartmentList } from "@/api/request-modules/common";
import { awaitFunc } from "@/utils";

/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 19:20:18
 * @LastEditTime: 2022-04-21 20:00:56
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

export default function useCommon() {
  // 获取部门人员列表
  const useGetDepartmentList = async (): Promise<Department[] | null> => {
    const [err, data]: [unknown, Department[] | null] = await awaitFunc<any, Department[]>({
      asyncFunc: getDepartmentList
    });
    if (err || !data) return null;
    return data;
  };

  return {
    useGetDepartmentList
  };
}
