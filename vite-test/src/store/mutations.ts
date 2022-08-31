import { MutationTree, MutationPayload } from "vuex";

import { State } from "./state";
import { USER } from "./state";
import { MutationType } from "./mutation-types";

// 定义Mutations类型
export type Mutations<S = State> = {
  [MutationType.employeeLists]?(state: S, payload: Array<Record<string, any>>): void;
  [MutationType.user]?(state: S, payload: MutationPayload & USER): void;
};

const mutations: MutationTree<State> & Mutations = {
  [MutationType.employeeLists](state, payload) {
    state.employeeLists = payload;
  },
  [MutationType.user](state, payload) {
    state.user = payload;
  }
};

export default mutations;
