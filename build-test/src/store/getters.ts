/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-06-06 18:51:21
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\store\getters.ts
 */
import { getSession } from "@/utils";
import { GetterTree } from "vuex";

import { State } from "./state";
export type Getters = {
  user(state: State): Record<string, any>;
};

const getters: GetterTree<State, State> & Getters = {
  user: (state: State) => state.user!,
  count: (state: State) => state.count,
  employeeLists: (state: State) => state.employeeLists,
  envList: (state: State) => state.envList,
  permission: (state: State) => state.permission,
  workCalendarDay: (state: State) => state.workCalendarDay,
  productInfo: (state: State) => {
    // 当前项目
    return state.productList?.find((item) => item.id === state.productId) ?? state.productInfo ?? getSession("productInfo", true);
  },
  currentIter: (state: State) => {
    // 当前迭代
    return state.iterateList?.find((item) => item.id === state.iterateId) ?? state.currentIter ?? getSession("currentIter", true);
  },
  productList: (state: State) => {
    // 全局项目列表
    return (Array.isArray(state.productList) && state.productList) || (Array.isArray(getSession("productList", true)) && getSession("productList", true)) || [];
  },
  productId: (state: State) => {
    // 当前项目id
    return state.productId || getSession("productId");
  },
  iterateList: (state: State) => {
    // 当前迭代列表
    return (Array.isArray(state.iterateList) && state.iterateList) || (Array.isArray(getSession("iterateList", true)) && getSession("iterateList", true)) || [];
  },
  iterateId: (state: State) => {
    // 当前迭代id
    return state.iterateId || getSession("iterateId");
  }
};
export default getters;
