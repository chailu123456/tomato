import { State } from "./state";
import { ActionTree, ActionContext, ActionPayload } from "vuex";
import { getEmployeeList } from "@/api/request-modules/common";
import { ResponseParams } from "@/types/response";
export type Actions<State> = {
  EMPLOYEE_LIST(context: ActionContext<State, State>, payload: ActionPayload): void;
};

const actions: ActionTree<State, State> = {
  EMPLOYEE_LIST(state) {
    getEmployeeList<ResponseParams.ResponseDataSuccess>().then(({ data }) => {
      state.commit("EMPLOYEE_LIST", data);
    });
  }
};

export default actions;
