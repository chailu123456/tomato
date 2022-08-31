import { MutationTree, MutationPayload } from "vuex";

import { State } from "./state";
import { USER, Permission, ENVLIST } from "./state";
import { MutationType } from "./mutation-types";

// 定义Mutations类型
export type Mutations<S = State> = {
  // [MutationType.employeeLists]?(state: S, payload: Array<Record<string, any>>): void;
  [MutationType.user]?(state: S, payload: MutationPayload & USER): void;
  [MutationType.envList]?(state: S, payload: MutationPayload & ENVLIST): void;
  [MutationType.permission]?(state: S, payload: MutationPayload & Permission): void;
};

const mutations: MutationTree<State> & Mutations = {
  // [MutationType.employeeLists](state: State, payload: Array<Record<string, any>>) {
  //   state.employeeLists = payload;
  // },
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
  }
};

export default mutations;
