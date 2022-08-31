/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-06-07 15:05:56
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\store\mutations.ts
 */
import { MutationTree, MutationPayload } from "vuex";

import { State } from "./state";
import { USER, Permission, ENVLIST } from "./state";
import { MutationType } from "./mutation-types";
import { ProjectItem } from "@/composables/useCommon";
import { clearSession, setSession } from "@/utils";
import { Iterate } from "@/composables/useBoardBase";

// 定义Mutations类型
export type Mutations<S = State> = {
  [MutationType.user]?(state: S, payload: MutationPayload & USER): void;
  [MutationType.envList]?(state: S, payload: MutationPayload & ENVLIST): void;
  [MutationType.permission]?(state: S, payload: MutationPayload & Permission): void;
};

const mutations: MutationTree<State> & Mutations = {
  [MutationType.user](state: State, payload: MutationPayload & USER) {
    state.user = payload;
  },
  [MutationType.envList](state: State, payload: MutationPayload & ENVLIST) {
    state.envList = payload;
  },
  [MutationType.permission](state: State, payload: MutationPayload & Permission) {
    state.permission = payload;
  },
  [MutationType.include](state: State, payload: string) {
    if (!state.include.includes(payload)) state.include.push(payload);
  },
  [MutationType.updateCalendarDay](state: State, payload: string) {
    state.workCalendarDay = payload;
  },
  [MutationType.iterateContentVisible](state: State, payload: boolean) {
    state.iterateContentVisible = payload;
  },
  [MutationType.addMemberVisible](state: State, payload: boolean) {
    state.addMemberVisible = payload;
  },
  [MutationType.updateProductInfo](state: State, payload: ProjectItem) {
    state.productInfo = state.productList?.find((item) => item.id === state.productId) ?? payload;
    if (state.productInfo) {
      setSession("productInfo", JSON.stringify(state.productInfo));
    } else {
      clearSession("productInfo");
    }
  },
  [MutationType.updateCurrentIter](state: State, payload: any) {
    state.currentIter = state.iterateList?.find((item) => item.id === state.iterateId) ?? payload;
    if (state.currentIter) {
      setSession("currentIter", JSON.stringify(state.currentIter));
    } else {
      clearSession("currentIter");
    }
  },
  [MutationType.updateProductList](state: State, payload: ProjectItem[]) {
    state.productList = payload;
    // 设置项目list
    if (Array.isArray(state.productList) && state.productList.length) {
      setSession("productList", JSON.stringify(state.productList));
    } else {
      clearSession("productList");
    }
  },
  [MutationType.updateProductId](state: State, payload: number) {
    const productId = typeof payload === "number" ? payload : Number(payload);
    state.productId = !isNaN(productId) ? productId : 0;
    if (state.productId) {
      setSession("productId", state.productId.toString());
    } else {
      clearSession("productId");
    }
  },
  [MutationType.updateIterateId](state: State, payload: number) {
    const iterateId = typeof payload === "number" ? payload : Number(payload);
    state.iterateId = !isNaN(iterateId) ? iterateId : 0;
    if (state.iterateId) {
      setSession("iterateId", state.iterateId.toString());
    } else {
      clearSession("iterateId");
    }
  },
  [MutationType.updateIterateList](state: State, payload: Iterate[]) {
    state.iterateList = payload;
    // 设置项目list
    if (Array.isArray(payload) && payload.length) {
      setSession("iterateList", JSON.stringify(payload));
    } else {
      clearSession("iterateList");
    }
  }
};

export default mutations;
