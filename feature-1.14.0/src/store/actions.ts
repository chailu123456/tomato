import { State } from "./state";
import { ActionTree, ActionContext, ActionPayload } from "vuex";
import { getEnvList, getPermission } from "@/api/request-modules/configure";
import { getEmployeeList } from "@/api/request-modules/common";
import { ResponseParams } from "@/types/response";
import { setSession } from "@/utils";
export type Actions<State> = {
  EMPLOYEE_LIST(context: ActionContext<State, State>, payload: ActionPayload): void;
  GETENV_LIST(context: ActionContext<State, State>, payload: ActionPayload): void;
};

type EnvironmentList = {
  value: number;
  label: string;
};

export type EnvironmentListItem = {
  id: number;
  code: string;
  create_time: string;
  is_sys: string;
  name: string;
  update_time: string;
  remark: string;
};

const actions: ActionTree<State, State> = {
  EMPLOYEE_LIST(state) {
    getEmployeeList<ResponseParams.ResponseDataSuccess>().then(({ data }) => {
      state.commit("EMPLOYEE_LIST", data);
    });
  },
  GETENV_LIST(state) {
    getEnvList<ResponseParams.ResponseDataSuccess>().then(({ data }) => {
      const environmentListSlide: EnvironmentList[] = [];
      if (data.length) {
        data.forEach((item: EnvironmentListItem) => {
          environmentListSlide.push({
            value: item.id,
            label: item.name
          });
        });
      }
      setSession("envList", JSON.stringify(environmentListSlide));
      state.commit("ENVLIST", environmentListSlide);
    });
  },
  GET_PERMISSION(state) {
    return new Promise((resolve) => {
      // 获取访问配置模块权限
      getPermission<ResponseParams.ResponsePermissionSuccess>().then(({ data }) => {
        state.commit("PERMISSION", data);
        resolve(data);
      });
    });
  }
};

export default actions;
