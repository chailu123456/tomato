import { GetterTree } from "vuex";

import { State } from "./state";

export type Getters = {
  user(state: State): Record<string, any>;
};

const getters: GetterTree<State, State> & Getters = {
  user: (state) => state.user!,
  count: (state) => state.count,
  employeeLists: (state) => state.employeeLists
};

export default getters;
