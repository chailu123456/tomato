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
  workCalendarDay: (state: State) => state.workCalendarDay
};

export default getters;
