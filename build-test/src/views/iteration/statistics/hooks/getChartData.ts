import useFetchSearch from "./useFetchSearch";
import { reactive } from "vue";
export default async function getChartData(id: number | null): Promise<any> {
  // 饼状图数据
  interface pieParams {
    label: string;
    percent: number;
  }
  // interface barParams {
  //   category: Array<string>;
  //   data: [];
  // }
  // interface lineParams {
  //   category: Array<string>;
  //   list: [];
  //   title: string;
  // }
  let data: {
    staff_count: number;
    total_hour: number;
    total_task: number;
    total_bug: number;
    pending_fixed_bug: number;
    pending_verified_bug: number;
    bug_status_pie: pieParams[];
    task_status_pie: pieParams[];
    staff_hour_burn_down_line: any;
    iteration_hour_burn_down_line: any;
    iteration_bug_count_burn_down_line: any;
    staff_hour_bar: any;
    staff_bug_count_bar: any;
    staff_bug_time_duration_bar: any;
  } = reactive({
    staff_count: 0, // 迭代成员
    total_hour: 0, // 迭代总工时
    total_task: 0, // 迭代总任务
    total_bug: 0, // 总bug
    pending_fixed_bug: 0, // 待解决bug
    pending_verified_bug: 0, // 待验证bug
    bug_status_pie: [], // bug状态分布图
    task_status_pie: [], // 任务状态分布图
    staff_hour_burn_down_line: [], // 工时燃尽图
    iteration_hour_burn_down_line: [], // 迭代成员工时燃尽图
    iteration_bug_count_burn_down_line: [], // bug燃尽图
    staff_hour_bar: [], // 成员任务工时数
    staff_bug_count_bar: [], // 成员bug数
    staff_bug_time_duration_bar: [] // 成员bug响应存活时间
  });
  const res = await useFetchSearch(id);
  data = res.data;
  return data;
}
