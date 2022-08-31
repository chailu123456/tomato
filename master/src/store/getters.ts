/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-08-18 16:52:22
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
    const list = getSession("productList", true);
    if (Array.isArray(state.productList) && state.productList.length) {
      return state.productList;
    } else if (Array.isArray(list) && list.length) {
      return list;
    }
    return [];
  },
  productId: (state: State) => {
    // 这里拿到缓存的格式是字符串，需要转成number
    const curProductId = getSession("productId") ? Number(getSession("productId")) : 0;
    // 当前项目id
    return state.productId || curProductId;
  },
  iterateList: (state: State) => {
    // 当前迭代列表
    const list = getSession("iterateList", true);
    if (Array.isArray(state.iterateList) && state.iterateList.length) {
      return state.iterateList;
    } else if (Array.isArray(list) && list.length) {
      return list;
    }
    return [];
  },
  iterateId: (state: State) => {
    // 这里拿到缓存的格式是字符串，需要转成number
    const curIterateId = getSession("iterateId") ? Number(getSession("iterateId")) : 0;
    // 当前迭代id
    return state.iterateId || curIterateId;
  }
};
export default getters;
